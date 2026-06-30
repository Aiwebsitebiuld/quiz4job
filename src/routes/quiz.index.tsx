import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Trophy, Sparkles, Crown, BookOpen, AlertCircle, Play } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { createQuizSession } from "@/lib/quiz";
import { getQuizQuota, type QuizQuota } from "@/lib/quiz";
import { toBn } from "@/lib/bn";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/quiz/")({
  head: () => ({
    meta: [
      { title: "কুইজ বিষয় বেছে নিন — Quiz4Job" },
      { name: "description", content: "বিসিএস, ব্যাংক, প্রাইমারি, ইংরেজি, গণিত — যেকোনো বিষয়ে MCQ কুইজ দিন এবং পুরস্কার জিতুন।" },
    ],
  }),
  component: QuizCategoriesPage,
});

type Category = {
  id: string; name_bn: string; name_en: string; slug: string;
  icon: string | null; color: string | null; description_bn: string | null;
  question_count: number; is_premium_only: boolean;
};

function QuizCategoriesPage() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [picked, setPicked] = useState<Category | null>(null);

  const quotaQ = useQuery({
    queryKey: ["quiz", "quota", user?.id],
    queryFn: getQuizQuota,
    enabled: !!user,
  });
  const quota = quotaQ.data ?? null;

  const cats = useQuery({
    queryKey: ["quiz", "categories", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quiz_categories")
        .select("id,name_bn,name_en,slug,icon,color,description_bn,question_count,is_premium_only")
        .eq("is_active", true)
        .order("display_order");
      if (error) throw error;
      return (data ?? []) as Category[];
    },
  });

  const isPremium = (profile?.premium_tier === "basic" || profile?.premium_tier === "pro") && !!profile?.is_premium;
  const limit = quota?.limit ?? 5;
  const used = quota?.used ?? 0;
  const remaining = quota?.remaining ?? Math.max(0, limit - used);
  const periodLabel = quota?.period === "day" ? "আজ" : "এই সপ্তাহে";
  const periodEndLabel = quota?.period === "day" ? "আজকের" : "এই সপ্তাহের";

  return (
    <main className="bg-background min-h-screen">
      <section className="hero-gradient text-white py-14 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm mb-3">
            <Sparkles className="w-4 h-4 text-gold" /> {toBn(cats.data?.length ?? 12)}+ বিষয়
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold">কুইজ বিষয় বেছে নিন</h1>
          <p className="mt-3 text-white/80 max-w-2xl mx-auto">
            যেকোনো বিষয়ে কুইজ দিন — শীর্ষ ৩ জন পাবেন নগদ পুরস্কার!
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        {/* Free quota banner */}
        {!loading && user && !isPremium && (
          <div className={`rounded-2xl border p-5 ${remaining === 0 ? "border-bd-red/40 bg-bd-red/5" : "border-bd-green/30 bg-bd-green/5"}`}>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="font-bold text-lg">
                  {remaining === 0
                    ? `${periodEndLabel} ফ্রি কুইজ শেষ! 🚫`
                    : <>{periodLabel} আপনি <span className="text-bd-green-dark">{toBn(used)}/{toBn(limit)}</span> টি কুইজ নিয়েছেন। <span className="text-bd-green">{toBn(remaining)}</span> টি বাকি আছে।</>}
                </div>
                <div className="mt-3 max-w-md">
                  <Progress value={(used / Math.max(1, limit)) * 100} className="h-2.5" />
                </div>
              </div>
              {remaining === 0 && (
                <Button asChild className="gold-shimmer text-black font-bold">
                  <Link to="/premium"><Crown className="w-4 h-4 mr-1" /> প্রিমিয়াম হন → সীমাহীন কুইজ</Link>
                </Button>
              )}
            </div>
          </div>
        )}
        {!loading && user && isPremium && (
          <div className="rounded-2xl border border-gold/40 bg-gold/5 p-5 flex items-center gap-3">
            <Crown className="w-6 h-6 text-gold" />
            <div>
              <div className="font-bold">প্রিমিয়াম ({profile?.premium_tier === "pro" ? "Pro" : "Basic"}) — আজ {toBn(used)}/{toBn(limit)} কুইজ ব্যবহার হয়েছে 🏆</div>
              <div className="text-sm text-muted-foreground">প্রতি কুইজে সর্বোচ্চ {toBn(quota?.max_questions ?? 0)} প্রশ্ন।</div>
            </div>
          </div>
        )}
        {!loading && !user && (
          <div className="rounded-2xl border border-info/30 bg-info/5 p-5 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-info" />
              <div className="font-semibold">কুইজ দিতে লগইন করুন — প্রথম ৫টি কুইজ ফ্রি!</div>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline"><Link to="/login">লগইন</Link></Button>
              <Button asChild className="bg-bd-green hover:bg-bd-green-dark"><Link to="/signup">সাইন আপ</Link></Button>
            </div>
          </div>
        )}

        {/* Categories grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cats.isLoading && Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-3xl border border-border bg-card h-56 animate-pulse" />
          ))}
          {(cats.data ?? []).map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (i % 6) * 0.05 }}
              className="rounded-3xl border border-border bg-card p-6 hover:border-bd-green hover:shadow-xl transition-all flex flex-col"
              style={c.color ? { borderTopColor: c.color, borderTopWidth: 4 } : undefined}
            >
              <div className="flex items-start justify-between">
                <div className="text-5xl">{c.icon ?? "📚"}</div>
                {c.is_premium_only && <Badge className="bg-gold text-black border-0">প্রিমিয়াম</Badge>}
              </div>
              <h2 className="mt-3 text-xl font-bold">{c.name_bn}</h2>
              <p className="text-xs text-muted-foreground">{c.name_en}</p>
              <p className="text-sm text-bd-green-dark font-semibold mt-2">
                {toBn(c.question_count ?? 0)}+ প্রশ্ন
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">সহজ</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">মাধ্যম</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">কঠিন</span>
              </div>
              <Button
                onClick={() => {
                  if (!user) { navigate({ to: "/login" }); return; }
                  setPicked(c);
                }}
                disabled={(c.question_count ?? 0) === 0}
                className="mt-5 bg-bd-green hover:bg-bd-green-dark text-white"
              >
                <Play className="w-4 h-4 mr-1" /> কুইজ শুরু করুন
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      <ConfigDialog
        category={picked}
        onClose={() => setPicked(null)}
        isPremium={isPremium}
        maxQuestions={quota?.max_questions ?? 20}
        onStart={async (cfg) => {
          try {
            const { session } = await createQuizSession(cfg);
            toast.success("কুইজ শুরু হচ্ছে…");
            navigate({ to: "/quiz/$sessionId", params: { sessionId: session.id } });
            quotaQ.refetch();
          } catch (e: any) {
            toast.error(e?.message ?? "কুইজ শুরু করা যায়নি");
          }
        }}
      />
    </main>
  );
}

function ConfigDialog({
  category, onClose, isPremium, maxQuestions, onStart,
}: {
  category: Category | null;
  onClose: () => void;
  isPremium: boolean;
  maxQuestions: number;
  onStart: (cfg: Parameters<typeof createQuizSession>[0]) => void;
}) {
  const [count, setCount] = useState("10");
  const [time, setTime] = useState("600");
  const [lang, setLang] = useState<"bn" | "en">("bn");
  const [ranked, setRanked] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!category) return null;

  const countOptions = ["10", "20", "30", "40", "50", "60"].filter(
    (n) => parseInt(n, 10) <= maxQuestions,
  );

  return (
    <Dialog open={!!category} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-3xl">{category.icon ?? "📚"}</span>
            <div>
              <div>কুইজ কনফিগার করুন</div>
              <div className="text-sm font-normal text-muted-foreground">{category.name_bn}</div>
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">কুইজ সেটিংস</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <Field label="প্রশ্নের সংখ্যা">
            <RadioGroup value={countOptions.includes(count) ? count : countOptions[countOptions.length - 1]} onValueChange={setCount} className="grid grid-cols-4 gap-2">
              {countOptions.map((n) => (
                <PillOption key={n} id={`n-${n}`} value={n} selected={count === n} label={toBn(n)} />
              ))}
            </RadioGroup>
            <p className="text-xs text-muted-foreground mt-1">আপনার প্ল্যানে প্রতি কুইজে সর্বোচ্চ {toBn(maxQuestions)} প্রশ্ন।</p>
          </Field>

          <Field label="সময়সীমা">
            <RadioGroup value={time} onValueChange={setTime} className="grid grid-cols-3 gap-2">
              {[{ v: "600", l: "১০ মিনিট" }, { v: "1200", l: "২০ মিনিট" }, { v: "1800", l: "৩০ মিনিট" }].map((o) => (
                <PillOption key={o.v} id={`t-${o.v}`} value={o.v} selected={time === o.v} label={o.l} />
              ))}
            </RadioGroup>
          </Field>

          <Field label="ভাষা">
            <RadioGroup value={lang} onValueChange={(v) => setLang(v as "bn" | "en")} className="grid grid-cols-2 gap-2">
              <PillOption id="l-bn" value="bn" selected={lang === "bn"} label="বাংলা" />
              <PillOption id="l-en" value="en" selected={lang === "en"} label="English" />
            </RadioGroup>
          </Field>

          <Field label="কুইজের ধরন">
            <div className="space-y-2">
              <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer ${!ranked ? "border-bd-green bg-bd-green/5" : "border-border"}`}>
                <input type="radio" checked={!ranked} onChange={() => setRanked(false)} className="mt-1 accent-bd-green" />
                <div>
                  <div className="font-semibold">র‍্যান্ডম প্র্যাকটিস <Badge variant="secondary" className="ml-1">ফ্রি</Badge></div>
                  <div className="text-xs text-muted-foreground">শেখার জন্য — লিডারবোর্ডে গণ্য হবে না</div>
                </div>
              </label>
              <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer ${ranked ? "border-gold bg-gold/5" : "border-border"} ${!isPremium ? "opacity-60" : ""}`}>
                <input type="radio" checked={ranked} onChange={() => setRanked(true)} disabled={!isPremium} className="mt-1 accent-gold" />
                <div>
                  <div className="font-semibold flex items-center gap-1">র‍্যাংকড কুইজ <Crown className="w-3.5 h-3.5 text-gold" /></div>
                  <div className="text-xs text-muted-foreground">
                    {isPremium
                      ? "🏆 লিডারবোর্ডে নাম + ৳৩,০০০ পুরস্কারের যোগ্য"
                      : <>প্রিমিয়াম প্রয়োজন। <Link to="/premium" className="text-bd-green underline">এখনই হন</Link></>}
                  </div>
                </div>
              </label>
            </div>
          </Field>
        </div>

        <Button
          size="lg"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onStart({
                categoryId: category.id,
                totalQuestions: parseInt(count, 10),
                timeLimitSeconds: parseInt(time, 10),
                language: lang,
                isRanked: ranked,
              });
            } finally { setBusy(false); }
          }}
          className="w-full h-12 bg-bd-green hover:bg-bd-green-dark text-white font-bold"
        >
          <Play className="w-4 h-4 mr-2" /> কুইজ শুরু করুন
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-sm font-semibold mb-2">{label}</div>
      {children}
    </div>
  );
}

function PillOption({ id, value, selected, label }: { id: string; value: string; selected: boolean; label: string }) {
  return (
    <Label htmlFor={id} className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer text-sm font-semibold transition-all ${selected ? "border-bd-green bg-bd-green text-white" : "border-border hover:border-bd-green/50"}`}>
      <RadioGroupItem value={value} id={id} className="sr-only" />
      {label}
    </Label>
  );
}