import { supabase } from "@/integrations/supabase/client";

export type QuestionRow = {
  id: string;
  question_text_bn: string;
  question_text_en: string | null;
  option_a_bn: string; option_a_en: string | null;
  option_b_bn: string; option_b_en: string | null;
  option_c_bn: string; option_c_en: string | null;
  option_d_bn: string; option_d_en: string | null;
  correct_option: "a" | "b" | "c" | "d";
  explanation_bn: string | null;
  difficulty: string | null;
};

export type SessionRow = {
  id: string;
  user_id: string;
  category_id: string;
  session_type: string;
  language: string;
  total_questions: number;
  time_limit_seconds: number;
  questions_attempted: number;
  correct_answers: number;
  wrong_answers: number;
  skipped: number;
  score: number;
  max_possible_score: number;
  percentage: number | null;
  time_taken_seconds: number | null;
  status: "in_progress" | "completed" | "abandoned";
  is_ranked: boolean;
  started_at: string;
  completed_at: string | null;
};

export type QuizConfig = {
  categoryId: string;
  totalQuestions: number;
  timeLimitSeconds: number;
  language: "bn" | "en";
  isRanked: boolean;
};

/** Create a new quiz session: enforces free-quota, picks random questions */
export async function createQuizSession(cfg: QuizConfig) {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) throw new Error("লগইন করুন");

  // Quota check via DB function
  const { data: canTake, error: ctErr } = await supabase.rpc("can_take_quiz", { user_uuid: user.id });
  if (ctErr) throw ctErr;
  if (!canTake) throw new Error("আজকের ৫টি ফ্রি কুইজ শেষ। প্রিমিয়াম হন।");

  // Premium check for ranked quizzes
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_premium,premium_expires_at,free_quizzes_today")
    .eq("id", user.id)
    .single();
  const isPremium = !!profile?.is_premium && (!profile.premium_expires_at || new Date(profile.premium_expires_at) > new Date());

  if (cfg.isRanked && !isPremium) {
    throw new Error("র‍্যাংকড কুইজের জন্য প্রিমিয়াম প্রয়োজন।");
  }

  // Pick random questions from category
  const { data: qs, error: qErr } = await supabase
    .from("questions")
    .select("id")
    .eq("category_id", cfg.categoryId)
    .eq("is_active", true)
    .limit(200);
  if (qErr) throw qErr;
  if (!qs || qs.length === 0) throw new Error("এই বিষয়ে এখনো প্রশ্ন যোগ হয়নি।");

  const shuffled = [...qs].sort(() => Math.random() - 0.5).slice(0, Math.min(cfg.totalQuestions, qs.length));
  const ids = shuffled.map((q) => q.id);
  const actualTotal = ids.length;

  const { data: session, error: sErr } = await supabase
    .from("quiz_sessions")
    .insert({
      user_id: user.id,
      category_id: cfg.categoryId,
      session_type: cfg.isRanked ? "ranked" : "practice",
      language: cfg.language,
      total_questions: actualTotal,
      time_limit_seconds: cfg.timeLimitSeconds,
      max_possible_score: actualTotal,
      status: "in_progress",
      is_ranked: cfg.isRanked && isPremium,
    })
    .select()
    .single();
  if (sErr) throw sErr;

  // Stash chosen question order client-side via sessionStorage so order persists
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(`q4j:order:${session.id}`, JSON.stringify(ids));
  }

  // Increment free_quizzes_today (best-effort, only for non-premium)
  if (!isPremium) {
    await supabase
      .from("profiles")
      .update({ free_quizzes_today: (profile?.free_quizzes_today ?? 0) + 1 })
      .eq("id", user.id);
  }

  return { session, questionIds: ids };
}

export async function fetchSessionWithQuestions(sessionId: string) {
  const { data: session, error: sErr } = await supabase
    .from("quiz_sessions")
    .select("*, quiz_categories:category_id(id,name_bn,slug,icon,color)")
    .eq("id", sessionId)
    .single();
  if (sErr) throw sErr;

  let ids: string[] = [];
  if (typeof window !== "undefined") {
    const stored = window.sessionStorage.getItem(`q4j:order:${sessionId}`);
    if (stored) {
      try { ids = JSON.parse(stored); } catch { /* ignore */ }
    }
  }

  // Fallback: if no cached order (e.g. result page after reload) — fetch all answers + their questions
  if (ids.length === 0) {
    const { data: ans } = await supabase
      .from("quiz_answers")
      .select("question_id, created_at")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });
    ids = (ans ?? []).map((a) => a.question_id);
  }

  let questions: QuestionRow[] = [];
  if (ids.length > 0) {
    const { data: qs, error: qErr } = await supabase
      .from("questions")
      .select("id,question_text_bn,question_text_en,option_a_bn,option_a_en,option_b_bn,option_b_en,option_c_bn,option_c_en,option_d_bn,option_d_en,correct_option,explanation_bn,difficulty")
      .in("id", ids);
    if (qErr) throw qErr;
    const map = new Map((qs ?? []).map((q) => [q.id, q as QuestionRow]));
    questions = ids.map((id) => map.get(id)).filter(Boolean) as QuestionRow[];
  }

  return { session, questions };
}

/** Submit final answers + mark session complete. answers map: questionId -> selectedOption | null (skipped). */
export async function completeQuizSession(
  sessionId: string,
  questions: QuestionRow[],
  answers: Record<string, "a" | "b" | "c" | "d" | null>,
  elapsedSeconds: number,
) {
  let correct = 0, wrong = 0, skipped = 0;
  const rows = questions.map((q) => {
    const sel = answers[q.id] ?? null;
    let isCorrect: boolean | null = null;
    if (sel === null) { skipped++; }
    else {
      isCorrect = sel === q.correct_option;
      if (isCorrect) correct++; else wrong++;
    }
    return {
      session_id: sessionId,
      question_id: q.id,
      selected_option: sel,
      is_correct: isCorrect,
      time_taken_seconds: null,
    };
  });

  // Delete any previous answers for safety then insert
  await supabase.from("quiz_answers").delete().eq("session_id", sessionId);
  if (rows.length > 0) {
    const { error } = await supabase.from("quiz_answers").insert(rows);
    if (error) throw error;
  }

  const total = questions.length;
  const percentage = total > 0 ? (correct / total) * 100 : 0;

  const { data, error: uErr } = await supabase
    .from("quiz_sessions")
    .update({
      questions_attempted: correct + wrong,
      correct_answers: correct,
      wrong_answers: wrong,
      skipped: skipped,
      score: correct,
      percentage,
      time_taken_seconds: elapsedSeconds,
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .select()
    .single();
  if (uErr) throw uErr;

  // Cleanup the stored order
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(`q4j:order:${sessionId}`);
  }
  return data;
}

export function questionLabel(opt: "a" | "b" | "c" | "d", lang: "bn" | "en") {
  if (lang === "en") return opt.toUpperCase();
  return { a: "ক", b: "খ", c: "গ", d: "ঘ" }[opt];
}

export function getOptionText(q: QuestionRow, opt: "a" | "b" | "c" | "d", lang: "bn" | "en") {
  if (lang === "en") {
    return (q as any)[`option_${opt}_en`] || (q as any)[`option_${opt}_bn`];
  }
  return (q as any)[`option_${opt}_bn`];
}

export function getQuestionText(q: QuestionRow, lang: "bn" | "en") {
  if (lang === "en" && q.question_text_en) return q.question_text_en;
  return q.question_text_bn;
}