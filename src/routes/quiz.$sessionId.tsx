import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, Flag, Check, X, BookOpen, AlertTriangle } from "lucide-react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import {
  fetchSessionWithQuestions, completeQuizSession, getOptionText, getQuestionText,
  questionLabel, type QuestionRow,
} from "@/lib/quiz";
import { toBn } from "@/lib/bn";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export const Route = createFileRoute("/quiz/$sessionId")({
  head: () => ({ meta: [{ title: "কুইজ চলছে — Quiz4Job" }] }),
  component: QuizTakingPage,
});

const OPTIONS = ["a", "b", "c", "d"] as const;
type Opt = (typeof OPTIONS)[number];

function QuizTakingPage() {
  const { sessionId } = Route.useParams();
  const navigate = useNavigate();

  const sessQuery = useQuery({
    queryKey: ["quiz", "session", sessionId],
    queryFn: () => fetchSessionWithQuestions(sessionId),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  const session = sessQuery.data?.session;
  const questions = sessQuery.data?.questions ?? [];
  const lang = (session?.language ?? "bn") as "bn" | "en";

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Opt | null>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [remaining, setRemaining] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [timeUpOpen, setTimeUpOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const startTime = useRef<number>(Date.now());

  // Init timer once session loaded
  useEffect(() => {
    if (!session || remaining !== null) return;
    const startedAt = session.started_at ?? new Date().toISOString();
    const limit = session.time_limit_seconds ?? 600;
    const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
    const left = Math.max(0, limit - elapsed);
    setRemaining(left);
    startTime.current = new Date(startedAt).getTime();
  }, [session, remaining]);

  // Tick
  useEffect(() => {
    if (remaining === null) return;
    if (remaining <= 0) { if (!timeUpOpen) setTimeUpOpen(true); return; }
    const t = setTimeout(() => setRemaining((r) => (r === null ? null : r - 1)), 1000);
    return () => clearTimeout(t);
  }, [remaining, timeUpOpen]);

  // Auto-submit on time up
  useEffect(() => {
    if (!timeUpOpen) return;
    const t = setTimeout(() => { void doSubmit(); }, 3000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeUpOpen]);

  if (sessQuery.isLoading || remaining === null) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">লোড হচ্ছে…</div>;
  }
  if (sessQuery.error || !session) {
    return <div className="min-h-screen grid place-items-center text-bd-red">কুইজ লোড করা যায়নি।</div>;
  }
  if (session.status === "completed") {
    navigate({ to: "/quiz/result/$sessionId", params: { sessionId } });
    return null;
  }
  if (questions.length === 0) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">এই কুইজে প্রশ্ন নেই।</div>;
  }

  const current = questions[idx];
  const total = questions.length;
  const answeredCount = Object.values(answers).filter((a) => a !== null).length;
  const skippedCount = Object.values(answers).filter((a) => a === null).length;
  const remainingQ = total - answeredCount;
  const score = questions.reduce((acc, q) => acc + (answers[q.id] === q.correct_option ? 1 : 0), 0);

  const mm = Math.floor(remaining / 60), ss = remaining % 60;
  const timerColor = remaining <= 60 ? "text-bd-red" : remaining <= 120 ? "text-orange-400" : "text-emerald-400";
  const timerPulse = remaining <= 120 ? "animate-pulse" : "";

  const select = (opt: Opt) => {
    if (revealed[current.id]) return;
    setAnswers((a) => ({ ...a, [current.id]: opt }));
    setRevealed((r) => ({ ...r, [current.id]: true }));
    if (opt === current.correct_option) {
      toast.success("সঠিক!", { duration: 1500 });
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.4 }, scalar: 0.8 });
    } else {
      toast.error("ভুল!", { duration: 1500 });
    }
  };

  const skip = () => {
    setAnswers((a) => ({ ...a, [current.id]: null }));
    if (idx < total - 1) setIdx(idx + 1);
  };

  async function doSubmit() {
    if (submitting) return;
    setSubmitting(true);
    try {
      const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
      // Ensure each question has an entry (skipped if not answered)
      const final: Record<string, Opt | null> = {};
      for (const q of questions) final[q.id] = answers[q.id] ?? null;
      await completeQuizSession(sessionId, questions, final, elapsed);
      navigate({ to: "/quiz/result/$sessionId", params: { sessionId } });
    } catch (e: any) {
      toast.error(e?.message ?? "সাবমিট ব্যর্থ হয়েছে");
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-muted/30 pb-20">
      {/* Progress bar at very top */}
      <Progress value={((idx + 1) / total) * 100} className="h-1.5 rounded-none" />

      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-xl">{(session as any).quiz_categories?.icon ?? "📚"}</span>
            <span className="font-semibold hidden sm:inline">{(session as any).quiz_categories?.name_bn ?? "কুইজ"}</span>
            <span className="opacity-80">প্রশ্ন {toBn(idx + 1)}/{toBn(total)}</span>
          </div>
          <div className={`flex items-center gap-2 font-mono text-xl font-bold ${timerColor} ${timerPulse}`}>
            <Clock className="w-5 h-5" />
            {toBn(String(mm).padStart(2, "0"))}:{toBn(String(ss).padStart(2, "0"))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm hidden sm:inline">স্কোর: <span className="font-bold text-gold">{toBn(score)}/{toBn(total)}</span></span>
            <Button
              size="sm"
              variant={remaining <= 120 ? "destructive" : "outline"}
              className={remaining <= 120 ? "" : "bg-transparent text-white border-white/40 hover:bg-white/10 hover:text-white"}
              onClick={() => setConfirmOpen(true)}
            >
              <Flag className="w-4 h-4 mr-1" /> সাবমিট করুন
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-8">
        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="rounded-3xl bg-card border border-border shadow-xl p-6 md:p-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bd-green text-white text-sm font-bold">
                প্রশ্ন #{toBn(idx + 1)}
              </div>
              {current.difficulty && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted">{
                  { easy: "সহজ", medium: "মাধ্যম", hard: "কঠিন" }[current.difficulty as "easy"] ?? current.difficulty
                }</span>
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-bold leading-relaxed">
              {getQuestionText(current, lang)}
            </h2>

            <div className="mt-6 space-y-3">
              {OPTIONS.map((opt) => {
                const isSelected = answers[current.id] === opt;
                const isCorrect = current.correct_option === opt;
                const shown = revealed[current.id];
                let cls = "border-border hover:border-bd-green/60 hover:bg-bd-green/5";
                if (shown) {
                  if (isCorrect) cls = "border-emerald-500 bg-emerald-50 text-emerald-900";
                  else if (isSelected) cls = "border-rose-500 bg-rose-50 text-rose-900";
                  else cls = "border-border opacity-60";
                } else if (isSelected) {
                  cls = "border-info bg-info/10";
                }
                return (
                  <button
                    key={opt}
                    onClick={() => select(opt)}
                    disabled={shown}
                    className={`w-full text-left flex items-start gap-3 p-4 rounded-2xl border-2 transition-all ${cls}`}
                  >
                    <span className="w-9 h-9 rounded-full bg-white border-2 border-current grid place-items-center font-bold flex-shrink-0">
                      {questionLabel(opt, lang)}
                    </span>
                    <span className="flex-1 text-base">{getOptionText(current, opt, lang)}</span>
                    {shown && isCorrect && <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-2" />}
                    {shown && isSelected && !isCorrect && <X className="w-5 h-5 text-rose-600 flex-shrink-0 mt-2" />}
                  </button>
                );
              })}
            </div>

            {!revealed[current.id] && (
              <button onClick={skip} className="mt-4 text-sm text-muted-foreground hover:text-foreground underline underline-offset-2">
                এড়িয়ে যান →
              </button>
            )}

            {revealed[current.id] && current.explanation_bn && (
              <Accordion type="single" collapsible defaultValue="ex" className="mt-6">
                <AccordionItem value="ex" className="border rounded-xl px-4 bg-amber-50/50">
                  <AccordionTrigger className="hover:no-underline">
                    <span className="flex items-center gap-2 font-semibold">
                      <BookOpen className="w-4 h-4 text-amber-700" /> 📖 ব্যাখ্যা
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-amber-900">
                    {current.explanation_bn}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Bottom navigation */}
        <div className="mt-6 flex items-center justify-between">
          <Button variant="outline" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>
            <ChevronLeft className="w-4 h-4 mr-1" /> আগের প্রশ্ন
          </Button>
          {idx < total - 1 ? (
            <Button onClick={() => setIdx(idx + 1)} className="bg-bd-green hover:bg-bd-green-dark text-white">
              পরবর্তী প্রশ্ন <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={() => setConfirmOpen(true)} className="bg-gold hover:bg-gold/90 text-black font-bold">
              <Flag className="w-4 h-4 mr-1" /> সাবমিট করুন
            </Button>
          )}
        </div>

        {/* Question number grid */}
        <div className="mt-8 rounded-2xl border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground mb-2">প্রশ্ন তালিকা — ক্লিক করে যেকোনো প্রশ্নে যান</div>
          <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-1.5">
            {questions.map((q, i) => {
              const a = answers[q.id];
              const visited = a !== undefined;
              const skipped = visited && a === null;
              const answered = visited && a !== null;
              const isCur = i === idx;
              let cls = "bg-muted text-muted-foreground";
              if (answered) cls = "bg-bd-green text-white";
              else if (skipped) cls = "bg-amber-300 text-amber-900";
              if (isCur) cls += " ring-2 ring-info";
              return (
                <button
                  key={q.id}
                  onClick={() => setIdx(i)}
                  className={`h-8 rounded-md text-xs font-bold ${cls}`}
                >
                  {toBn(i + 1)}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span><span className="inline-block w-3 h-3 rounded bg-bd-green mr-1 align-middle" /> উত্তর দেওয়া</span>
            <span><span className="inline-block w-3 h-3 rounded bg-amber-300 mr-1 align-middle" /> এড়ানো</span>
            <span><span className="inline-block w-3 h-3 rounded bg-muted mr-1 align-middle" /> বাকি</span>
          </div>
        </div>
      </div>

      {/* Submit confirmation */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Flag className="w-5 h-5 text-bd-green" /> কুইজ সাবমিট করবেন?</DialogTitle>
            <DialogDescription>
              আপনি {toBn(answeredCount)}টি প্রশ্নের উত্তর দিয়েছেন, {toBn(remainingQ)}টি বাকি (এর মধ্যে {toBn(skippedCount)}টি এড়িয়েছেন)।
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>আরও সময় দিন</Button>
            <Button onClick={doSubmit} disabled={submitting} className="bg-bd-green hover:bg-bd-green-dark text-white">
              {submitting ? "সাবমিট হচ্ছে…" : "সাবমিট করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Time up */}
      <Dialog open={timeUpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-bd-red"><AlertTriangle className="w-5 h-5" /> সময় শেষ!</DialogTitle>
            <DialogDescription>স্বয়ংক্রিয়ভাবে সাবমিট হচ্ছে…</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </main>
  );
}