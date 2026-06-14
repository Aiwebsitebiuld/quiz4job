import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import confetti from "canvas-confetti";
import { Trophy, Check, X, SkipForward, Clock, Share2, RefreshCw, Crown, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { fetchSessionWithQuestions, getOptionText, getQuestionText, questionLabel } from "@/lib/quiz";
import { toBn } from "@/lib/bn";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export const Route = createFileRoute("/quiz/result/$sessionId")({
  head: () => ({ meta: [{ title: "কুইজের ফলাফল — Quiz4Job" }] }),
  component: ResultPage,
});

function ResultPage() {
  const { sessionId } = Route.useParams();
  const { profile, isPremium } = useAuth();

  const q = useQuery({
    queryKey: ["quiz", "result", sessionId],
    queryFn: () => fetchSessionWithQuestions(sessionId),
  });

  const answers = useQuery({
    queryKey: ["quiz", "answers", sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quiz_answers")
        .select("question_id, selected_option, is_correct")
        .eq("session_id", sessionId);
      if (error) throw error;
      return data ?? [];
    },
  });

  const session = q.data?.session;
  const questions = q.data?.questions ?? [];
  const lang = (session?.language ?? "bn") as "bn" | "en";
  const pct = Math.round(Number(session?.percentage ?? 0));

  useEffect(() => {
    if (pct >= 70) {
      confetti({ particleCount: 200, spread: 90, origin: { y: 0.3 } });
      setTimeout(() => confetti({ particleCount: 120, spread: 120, origin: { y: 0.4 } }), 400);
    }
  }, [pct]);

  if (q.isLoading) return <div className="min-h-screen grid place-items-center text-muted-foreground">লোড হচ্ছে…</div>;
  if (!session) return <div className="min-h-screen grid place-items-center text-bd-red">ফলাফল লোড করা যায়নি।</div>;

  const correct = session.correct_answers ?? 0;
  const wrong = session.wrong_answers ?? 0;
  const skipped = session.skipped ?? 0;
  const total = session.total_questions ?? 0;
  const timeSec = session.time_taken_seconds ?? 0;
  const mm = Math.floor(timeSec / 60), ss = timeSec % 60;

  const scoreColor = pct >= 70 ? "text-emerald-600" : pct >= 50 ? "text-amber-600" : "text-rose-600";
  const ringStroke = pct >= 70 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444";
  const badge =
    pct >= 90 ? { label: "অসাধারণ! 🌟 টপার", cls: "bg-gold text-black" }
    : pct >= 70 ? { label: "চমৎকার! 👏 ভালো করেছেন", cls: "bg-emerald-500 text-white" }
    : pct >= 50 ? { label: "ঠিক আছে! 📚 আরও পড়ুন", cls: "bg-amber-500 text-white" }
    : { label: "চেষ্টা করুন! 💪 হাল ছাড়বেন না", cls: "bg-rose-500 text-white" };

  const answerMap = new Map((answers.data ?? []).map((a) => [a.question_id, a]));

  const shareText = encodeURIComponent(`আমি Quiz4Job-এ ${toBn(pct)}% স্কোর পেয়েছি! 🏆 কুইজ দিয়ে নগদ পুরস্কার জিতুন।`);
  const shareUrl = encodeURIComponent(typeof window !== "undefined" ? window.location.origin : "");

  return (
    <main className="min-h-screen bg-muted/30 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Hero result card */}
        <div className="rounded-3xl bg-card shadow-2xl border border-border p-6 md:p-10 text-center">
          <div className="text-sm text-muted-foreground">{(session as any).quiz_categories?.name_bn ?? "কুইজ"} · {session.completed_at ? new Date(session.completed_at).toLocaleString("en-GB") : ""}</div>

          {/* Animated SVG score circle */}
          <div className="relative mx-auto mt-6 w-56 h-56">
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
              <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" className="opacity-30" />
              <circle
                cx="60" cy="60" r="52" fill="none" stroke={ringStroke} strokeWidth="10" strokeLinecap="round"
                strokeDasharray={`${(pct / 100) * 2 * Math.PI * 52} ${2 * Math.PI * 52}`}
                style={{ transition: "stroke-dasharray 1.2s ease-out" }}
              />
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <div>
                <div className={`text-5xl md:text-6xl font-extrabold ${scoreColor}`}>{toBn(pct)}%</div>
                <div className="text-sm text-muted-foreground mt-1">{toBn(correct)}/{toBn(total)} সঠিক</div>
              </div>
            </div>
          </div>

          <Badge className={`mt-6 text-base px-4 py-1.5 ${badge.cls} border-0`}>{badge.label}</Badge>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <Stat icon={<Check className="w-4 h-4 text-emerald-600" />} label="সঠিক" value={toBn(correct)} />
            <Stat icon={<X className="w-4 h-4 text-rose-600" />} label="ভুল" value={toBn(wrong)} />
            <Stat icon={<SkipForward className="w-4 h-4 text-amber-600" />} label="এড়ানো" value={toBn(skipped)} />
            <Stat icon={<Clock className="w-4 h-4 text-info" />} label="সময়" value={`${toBn(String(mm).padStart(2,"0"))}:${toBn(String(ss).padStart(2,"0"))}`} />
          </div>
        </div>

        {/* Ranked + leaderboard nudge */}
        {session.is_ranked && (
          <div className="rounded-2xl border border-gold/30 bg-gold/5 p-5 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Trophy className="w-7 h-7 text-gold" />
              <div>
                <div className="font-bold">+{toBn(correct)} পয়েন্ট লিডারবোর্ডে যোগ হয়েছে!</div>
                <div className="text-sm text-muted-foreground">এই মাসের শীর্ষ ৩ জন bKash-এ পুরস্কার পাবেন।</div>
              </div>
            </div>
            <Button asChild className="bg-bd-green hover:bg-bd-green-dark text-white">
              <Link to="/">লিডারবোর্ড দেখুন</Link>
            </Button>
          </div>
        )}

        {/* Share + Facebook like */}
        <div className="rounded-2xl border border-border bg-card p-5 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm">
            <div className="font-semibold flex items-center gap-2"><Share2 className="w-4 h-4" /> ফলাফল শেয়ার করুন</div>
            <div className="text-muted-foreground text-xs">বন্ধুদের চ্যালেঞ্জ করুন</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <a target="_blank" rel="noopener noreferrer" href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`}>
                📘 Facebook-এ শেয়ার
              </a>
            </Button>
            {profile && !profile.facebook_liked && (
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={async () => {
                  window.open("https://facebook.com/quiz4job", "_blank");
                  await supabase.from("profiles").update({ facebook_liked: true }).eq("id", profile.id);
                }}
              >
                👍 Facebook পেজ লাইক করুন
              </Button>
            )}
          </div>
        </div>

        {/* Upsell */}
        {!isPremium && (
          <div className="rounded-2xl gold-shimmer text-black p-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-extrabold text-lg flex items-center gap-2"><Crown className="w-5 h-5" /> প্রিমিয়াম হলে সীমাহীন কুইজ + পুরস্কার</div>
              <div className="text-sm">মাত্র ৳১০/মাসে — শীর্ষ ৩ জন পাবেন ৳৩,০০০ পর্যন্ত নগদ।</div>
            </div>
            <Button asChild className="bg-slate-900 hover:bg-slate-800 text-white">
              <Link to="/subscribe">প্রিমিয়াম হন</Link>
            </Button>
          </div>
        )}

        {/* Question review */}
        <Accordion type="single" collapsible className="rounded-2xl border border-border bg-card">
          <AccordionItem value="review" className="border-0">
            <AccordionTrigger className="px-5 hover:no-underline">
              <span className="flex items-center gap-2 font-semibold"><BookOpen className="w-4 h-4" /> উত্তরপত্র পর্যালোচনা করুন</span>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-5 space-y-3">
              {questions.map((qq, i) => {
                const a = answerMap.get(qq.id);
                const sel = (a?.selected_option ?? null) as "a"|"b"|"c"|"d"|null;
                const correctOpt = qq.correct_option;
                const state = sel === null ? "skip" : sel === correctOpt ? "ok" : "bad";
                const headerCls = state === "ok" ? "bg-emerald-50 border-emerald-200" : state === "bad" ? "bg-rose-50 border-rose-200" : "bg-muted border-border";
                return (
                  <div key={qq.id} className={`rounded-xl border p-4 ${headerCls}`}>
                    <div className="text-xs text-muted-foreground mb-1">প্রশ্ন {toBn(i + 1)}</div>
                    <div className="font-semibold">{getQuestionText(qq, lang)}</div>
                    <div className="mt-2 text-sm space-y-1">
                      {(["a","b","c","d"] as const).map((o) => (
                        <div key={o} className={`flex items-center gap-2 ${o === correctOpt ? "text-emerald-700 font-semibold" : sel === o ? "text-rose-700 line-through" : "text-muted-foreground"}`}>
                          <span className="font-bold">{questionLabel(o, lang)})</span>
                          <span>{getOptionText(qq, o, lang)}</span>
                          {o === correctOpt && <Check className="w-4 h-4" />}
                          {sel === o && o !== correctOpt && <X className="w-4 h-4" />}
                        </div>
                      ))}
                    </div>
                    {qq.explanation_bn && (
                      <div className="mt-3 text-sm bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-amber-900">
                        📖 {qq.explanation_bn}
                      </div>
                    )}
                  </div>
                );
              })}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Button asChild variant="outline"><Link to="/quiz"><RefreshCw className="w-4 h-4 mr-1" /> আবার চেষ্টা করুন</Link></Button>
          <Button asChild variant="outline"><Link to="/quiz">অন্য বিষয়ে কুইজ দিন</Link></Button>
          <Button asChild className="bg-bd-green hover:bg-bd-green-dark text-white"><Link to="/">লিডারবোর্ড দেখুন</Link></Button>
        </div>
      </div>
    </main>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-3">
      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">{icon}{label}</div>
      <div className="text-xl font-extrabold mt-1">{value}</div>
    </div>
  );
}