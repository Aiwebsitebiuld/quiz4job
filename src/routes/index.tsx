import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Trophy, Sparkles, Crown, Medal, Award, Check, X, Star, ArrowRight,
  Briefcase, Calendar, MapPin, BookOpen, Wallet, UserPlus, Brain, Gift,
  Users, Flame, Quote,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoneyParticles } from "@/components/money-particles";
import { CountdownTimer } from "@/components/countdown-timer";
import { toBn, bnCurrency } from "@/lib/bn";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Quiz4Job — কুইজ দিন, ৳৩,০০০ পুরস্কার জিতুন!" },
      { name: "description", content: "বাংলাদেশের #১ চাকরির কুইজ প্ল্যাটফর্ম। বিসিএস, ব্যাংক, প্রাইমারি প্রস্তুতি। মাসিক ৳৩,০০০ পর্যন্ত নগদ পুরস্কার। মাত্র ৳১০/মাসে প্রিমিয়াম।" },
      { property: "og:title", content: "Quiz4Job — কুইজ দিন, পুরস্কার জিতুন!" },
      { property: "og:description", content: "মাত্র ৳১০/মাসে প্রিমিয়াম। আনলিমিটেড কুইজ + ৳৩,০০০ পর্যন্ত নগদ পুরস্কার।" },
    ],
  }),
  component: HomePage,
});

/* ----------------------------- data hooks ----------------------------- */

function useCategories() {
  return useQuery({
    queryKey: ["home", "categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quiz_categories")
        .select("id,name_bn,slug,icon,color,question_count,description_bn")
        .eq("is_active", true)
        .order("display_order", { ascending: true })
        .limit(12);
      if (error) throw error;
      return data ?? [];
    },
  });
}

function useLeaderboard() {
  const now = new Date();
  return useQuery({
    queryKey: ["home", "leaderboard", now.getFullYear(), now.getMonth() + 1],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("monthly_leaderboard")
        .select("rank,total_score,quizzes_taken,user_id,profiles:user_id(username,full_name,avatar_url,district)")
        .eq("month", now.getMonth() + 1)
        .eq("year", now.getFullYear())
        .order("total_score", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data ?? [];
    },
  });
}

function useWinners() {
  const last = new Date();
  last.setMonth(last.getMonth() - 1);
  return useQuery({
    queryKey: ["home", "winners", last.getFullYear(), last.getMonth() + 1],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prize_records")
        .select("position,prize_amount,profiles:user_id(username,full_name,avatar_url,district)")
        .eq("month", last.getMonth() + 1)
        .eq("year", last.getFullYear())
        .order("position", { ascending: true })
        .limit(3);
      if (error) throw error;
      return data ?? [];
    },
  });
}

function useJobs() {
  return useQuery({
    queryKey: ["home", "jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("id,slug,title_bn,organization_name,organization_logo,organization_type,location_bn,application_deadline,is_featured")
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("published_date", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data ?? [];
    },
  });
}

function useBlog() {
  return useQuery({
    queryKey: ["home", "blog"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id,slug,title_bn,excerpt_bn,featured_image,category,published_at")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data ?? [];
    },
  });
}

function useStats() {
  return useQuery({
    queryKey: ["home", "stats"],
    queryFn: async () => {
      const [users, sessions, prizes, sum] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("quiz_sessions").select("*", { count: "exact", head: true }).eq("status", "completed"),
        supabase.from("prize_records").select("*", { count: "exact", head: true }),
        supabase.from("prize_records").select("prize_amount"),
      ]);
      const total = (sum.data ?? []).reduce(
        (acc: number, r: { prize_amount: number | null }) => acc + Number(r.prize_amount ?? 0),
        0,
      );
      return {
        users: users.count ?? 0,
        quizzes: sessions.count ?? 0,
        prizesGiven: prizes.count ?? 0,
        totalPaid: total,
      };
    },
  });
}

/* ----------------------------- helpers ----------------------------- */

function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1400;
          const start = performance.now();
          const tick = (t: number) => {
            const p = Math.min(1, (t - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setN(Math.floor(eased * value));
            if (p < 1) requestAnimationFrame(tick);
            else setN(value);
          };
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, [value]);
  return <div ref={ref} className="tabular-nums">{toBn(n.toLocaleString("en-US"))}{suffix}</div>;
}

function rankRowStyle(rank: number) {
  if (rank === 1) return "bg-gradient-to-r from-gold/20 to-transparent border-gold/50";
  if (rank === 2) return "bg-gradient-to-r from-slate-300/30 to-transparent border-slate-300/60";
  if (rank === 3) return "bg-gradient-to-r from-amber-700/20 to-transparent border-amber-700/40";
  return "border-border";
}

function rankIcon(rank: number) {
  if (rank === 1) return <Crown className="w-5 h-5 text-gold" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />;
  if (rank === 3) return <Award className="w-5 h-5 text-amber-700" />;
  return <span className="text-sm font-bold text-muted-foreground">#{toBn(rank)}</span>;
}

const PRIZE_AMOUNTS = [1500, 1000, 500];

/* ----------------------------- page ----------------------------- */

function HomePage() {
  const { user } = useAuth();
  const categories = useCategories();
  const leaderboard = useLeaderboard();
  const winners = useWinners();
  const jobs = useJobs();
  const blog = useBlog();
  const stats = useStats();

  return (
    <main className="bg-background">
      {/* ───────────── 1. HERO ───────────── */}
      <section className="hero-gradient text-white relative overflow-hidden">
        <MoneyParticles count={22} />
        <div className="max-w-7xl mx-auto px-4 pt-14 pb-20 md:pt-20 md:pb-28 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-sm mb-6 border border-white/20"
            >
              <Sparkles className="w-4 h-4 text-gold" /> বাংলাদেশের #১ চাকরি কুইজ প্ল্যাটফর্ম
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tight"
            >
              কুইজ দিয়ে জিতুন<br />
              <span className="text-gradient-prize">৳৩,০০০ নগদ পুরস্কার!</span>{" "}
              <span className="inline-block">🏆</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="mt-6 text-lg md:text-xl text-white/85 max-w-2xl mx-auto"
            >
              বিসিএস, ব্যাংক, প্রাইমারি — সব পরীক্ষার MCQ কুইজে অংশ নিন। প্রতিমাসে নগদ টাকা জিতুন!
            </motion.p>

            {/* Prize cards */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { pos: "১ম স্থান", amt: 1500, emoji: "🥇", from: "from-gold", glow: "shadow-[0_0_60px_-15px_rgba(245,158,11,0.8)]" },
                { pos: "২য় স্থান", amt: 1000, emoji: "🥈", from: "from-slate-300", glow: "shadow-[0_0_60px_-15px_rgba(203,213,225,0.7)]" },
                { pos: "৩য় স্থান", amt: 500,  emoji: "🥉", from: "from-amber-600", glow: "shadow-[0_0_60px_-15px_rgba(217,119,6,0.7)]" },
              ].map((p, i) => (
                <motion.div
                  key={p.pos}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.15, type: "spring" }}
                  whileHover={{ y: -6, scale: 1.03 }}
                  className={`relative rounded-3xl border border-white/20 bg-gradient-to-br ${p.from} to-transparent backdrop-blur p-6 ${p.glow}`}
                >
                  <div className="text-5xl mb-2">{p.emoji}</div>
                  <div className="text-sm text-white/80">{p.pos}</div>
                  <div className="text-3xl md:text-4xl font-extrabold text-white mt-1">
                    {bnCurrency(p.amt)} <span className="text-base font-semibold">টাকা</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <p className="mt-6 text-white/80 text-sm md:text-base">
              <span className="font-semibold text-gold-light">বিজয়ীদের সরাসরি bKash-এ পাঠানো হয়!</span>{" "}
              মাত্র {bnCurrency(10)}/মাসে প্রিমিয়াম হলেই পুরস্কার পাওয়ার যোগ্য।
            </p>

            {/* Countdown */}
            <div className="mt-10">
              <div className="text-sm md:text-base text-white/80 mb-3">
                ⏰ এই মাসের পুরস্কারের সময় শেষ হচ্ছে:
              </div>
              <CountdownTimer />
            </div>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="lg" className="h-14 px-8 text-base bg-bd-green hover:bg-bd-green-dark text-white shadow-lg shadow-bd-green/30">
                <Link to="/signup">🚀 এখনই শুরু করুন</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base border-gold text-gold hover:bg-gold hover:text-black bg-transparent">
                <Link to="/signup">📋 আজকের কুইজ দিন</Link>
              </Button>
            </div>

            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm">
              🎁 প্রথম {toBn(5)}টি কুইজ সম্পূর্ণ <span className="font-bold text-gold">বিনামূল্যে!</span>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── 2. HOW IT WORKS ───────────── */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="৪টি সহজ ধাপ"
            title="কীভাবে পুরস্কার জিতবেন?"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {[
              { n: 1, icon: UserPlus, emoji: "📝", title: "নিবন্ধন করুন", desc: "বিনামূল্যে অ্যাকাউন্ট তৈরি করুন" },
              { n: 2, icon: Star,     emoji: "⭐", title: "প্রিমিয়াম হন", desc: `মাত্র ${bnCurrency(10)}/মাসে bKash করুন` },
              { n: 3, icon: Brain,    emoji: "🧠", title: "কুইজ দিন", desc: "প্রতিদিন কুইজ দিয়ে পয়েন্ট জমান" },
              { n: 4, icon: Wallet,   emoji: "💰", title: "পুরস্কার নিন", desc: `মাস শেষে শীর্ষ ${toBn(3)} জন bKash-এ পাবেন` },
            ].map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative rounded-3xl border border-border bg-card p-6 hover:border-bd-green hover:shadow-xl hover:shadow-bd-green/10 transition-all"
              >
                <div className="absolute -top-5 -left-5 w-12 h-12 rounded-2xl bg-bd-green text-white grid place-items-center font-extrabold text-lg shadow-lg shadow-bd-green/30">
                  {toBn(s.n)}
                </div>
                <div className="text-5xl mb-3">{s.emoji}</div>
                <h3 className="text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-muted-foreground text-sm">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── 3. FREE vs PREMIUM ───────────── */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-bd-green-light/30">
        <div className="max-w-6xl mx-auto">
          <SectionHeader eyebrow="তুলনা" title="ফ্রি বনাম প্রিমিয়াম" />
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            {/* Free */}
            <div className="rounded-3xl border-2 border-border bg-card p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">ফ্রি</h3>
                  <p className="text-muted-foreground text-sm">শুরু করুন আজই</p>
                </div>
                <div className="text-3xl font-extrabold">{bnCurrency(0)}</div>
              </div>
              <ul className="mt-6 space-y-3 text-sm">
                <FeatureLine ok>প্রতিদিন {toBn(5)}টি কুইজ</FeatureLine>
                <FeatureLine ok>সব বিষয়ে প্রশ্ন</FeatureLine>
                <FeatureLine ok>চাকরির বোর্ড</FeatureLine>
                <FeatureLine ok>লিডারবোর্ড দেখা</FeatureLine>
                <FeatureLine>সীমাহীন কুইজ নয়</FeatureLine>
                <FeatureLine>নগদ পুরস্কার নেই</FeatureLine>
                <FeatureLine>Ranked কুইজ নয়</FeatureLine>
              </ul>
              <Button asChild variant="outline" className="w-full mt-8 h-12">
                <Link to="/signup">বিনামূল্যে শুরু করুন</Link>
              </Button>
            </div>
            {/* Premium */}
            <div className="relative rounded-3xl border-2 border-gold bg-gradient-to-br from-gold-light via-card to-card p-8 shadow-[0_0_60px_-15px_rgba(245,158,11,0.5)]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 gold-shimmer text-black text-xs font-bold px-4 py-1 rounded-full">
                ⭐ সবচেয়ে জনপ্রিয়
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    প্রিমিয়াম <Crown className="w-6 h-6 text-gold" />
                  </h3>
                  <p className="text-muted-foreground text-sm">পুরস্কার পাওয়ার যোগ্য</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-extrabold text-bd-green-dark">{bnCurrency(10)}</div>
                  <div className="text-xs text-muted-foreground">/মাস</div>
                </div>
              </div>
              <ul className="mt-6 space-y-3 text-sm">
                <FeatureLine ok>সীমাহীন কুইজ প্রতিদিন</FeatureLine>
                <FeatureLine ok highlight>🏆 নগদ পুরস্কারের যোগ্য</FeatureLine>
                <FeatureLine ok>Ranked লিডারবোর্ডে নাম</FeatureLine>
                <FeatureLine ok>বিস্তারিত বিশ্লেষণ</FeatureLine>
                <FeatureLine ok>সব বিষয়ে এক্সক্লুসিভ প্রশ্ন</FeatureLine>
                <FeatureLine ok>bKash/Nagad-এ পুরস্কার</FeatureLine>
              </ul>
              <Button asChild className="w-full mt-8 h-12 gold-shimmer text-black hover:opacity-90 font-bold">
                <Link to="/subscribe">⭐ প্রিমিয়াম হন</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── 4. CATEGORIES ───────────── */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionHeader eyebrow="বিষয় নির্বাচন করুন" title="কোন বিষয়ে কুইজ দিতে চান?" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-12">
            {(categories.data ?? Array.from({ length: 8 })).slice(0, 12).map((c: any, i: number) => (
              <motion.div
                key={c?.id ?? i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 6) * 0.05 }}
                className="group rounded-2xl border border-border bg-card p-5 hover:border-bd-green hover:shadow-xl hover:-translate-y-1 transition-all"
                style={c?.color ? { borderTopColor: c.color, borderTopWidth: 3 } : undefined}
              >
                <div className="text-4xl mb-2">{c?.icon ?? "📚"}</div>
                <h3 className="font-bold">{c?.name_bn ?? "লোড হচ্ছে…"}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {c ? `${toBn(c.question_count ?? 0)}টি প্রশ্ন` : ""}
                </p>
                <Button asChild size="sm" variant="ghost" className="mt-3 -ml-2 text-bd-green hover:text-bd-green-dark group-hover:translate-x-1 transition">
                  <Link to="/signup">কুইজ শুরু করুন <ArrowRight className="w-3 h-3 ml-1" /></Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── 5. LEADERBOARD PREVIEW ───────────── */}
      <section className="py-20 px-4 bg-gradient-to-b from-bd-green-light/30 to-background">
        <div className="max-w-5xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 text-amber-700 text-sm font-semibold mb-3">
              <Trophy className="w-4 h-4" /> এই মাসের রেস
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold">
              এই মাসের শীর্ষ প্রতিযোগী <span className="inline-block">🏆</span>
            </h2>
          </div>

          <div className="mt-10 rounded-3xl overflow-hidden border border-gold/30 bg-card shadow-2xl shadow-gold/10">
            <div className="gold-shimmer text-black px-6 py-4 font-bold flex items-center justify-between">
              <span>শীর্ষ {toBn(5)} প্রতিযোগী</span>
              <span className="text-xs hidden sm:block">Ranked কুইজ অনুসারে</span>
            </div>
            <div className="divide-y divide-border">
              {leaderboard.isLoading && (
                <div className="p-8 text-center text-muted-foreground">লোড হচ্ছে…</div>
              )}
              {!leaderboard.isLoading && (leaderboard.data ?? []).length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  এই মাসে এখনো কেউ নেই — প্রথম হওয়ার সুযোগ আপনার!
                </div>
              )}
              {(leaderboard.data ?? []).map((row: any, i: number) => {
                const rank = row.rank ?? i + 1;
                const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
                return (
                  <div key={i} className={`flex items-center gap-4 px-4 sm:px-6 py-4 border-l-4 ${rankRowStyle(rank)}`}>
                    <div className="w-10 grid place-items-center">{rankIcon(rank)}</div>
                    <div className="w-10 h-10 rounded-full bg-bd-green/10 text-bd-green grid place-items-center font-bold overflow-hidden">
                      {profile?.avatar_url
                        ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                        : (profile?.full_name ?? profile?.username ?? "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{profile?.full_name ?? profile?.username ?? "অজানা"}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {profile?.district ? `📍 ${profile.district}` : "—"} · {toBn(row.quizzes_taken ?? 0)}টি কুইজ
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-lg">{toBn(row.total_score ?? 0)}</div>
                      <div className="text-[10px] text-muted-foreground">পয়েন্ট</div>
                    </div>
                    {rank <= 3 && (
                      <Badge className="hidden sm:inline-flex gold-shimmer text-black font-bold border-0">
                        {bnCurrency(PRIZE_AMOUNTS[rank - 1])}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="bg-muted/50 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
              <Link to="/signup" className="text-bd-green font-semibold hover:underline">
                সম্পূর্ণ লিডারবোর্ড দেখুন →
              </Link>
              {user && <span className="text-sm text-muted-foreground">আপনার র‍্যাংক: <span className="font-bold text-foreground">#{toBn("--")}</span></span>}
            </div>
          </div>

          <div className="mt-10 text-center rounded-2xl bg-bd-red/5 border border-bd-red/20 p-6">
            <div className="flex items-center justify-center gap-2 text-bd-red font-bold mb-2">
              <Flame className="w-5 h-5" /> মাস শেষে শীর্ষ {toBn(3)} জন পুরস্কার পাবেন!
            </div>
            <p className="text-muted-foreground">আপনার অবস্থান উন্নত করুন — এখনই কুইজ দিন।</p>
            <Button asChild className="mt-4 h-12 px-6 bg-bd-green hover:bg-bd-green-dark text-white">
              <Link to="/signup">কুইজ দিন এবং এগিয়ে যান</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ───────────── 6. WINNERS ───────────── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <SectionHeader eyebrow="বাস্তব বিজয়ী" title="গত মাসের বিজয়ীরা 🎉" />
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {(winners.data && winners.data.length > 0 ? winners.data : [1, 2, 3].map((p) => ({ position: p, prize_amount: PRIZE_AMOUNTS[p - 1], profiles: null }))).map((w: any, i: number) => {
              const rank = w.position ?? i + 1;
              const profile = Array.isArray(w.profiles) ? w.profiles[0] : w.profiles;
              const colors = ["from-gold/20 to-transparent border-gold", "from-slate-300/30 to-transparent border-slate-300", "from-amber-700/20 to-transparent border-amber-700/60"];
              const emoji = ["🥇", "🥈", "🥉"][rank - 1] ?? "🏆";
              return (
                <div key={i} className={`rounded-3xl border-2 bg-gradient-to-b ${colors[rank - 1]} p-6 text-center`}>
                  <div className="text-5xl mb-3">{emoji}</div>
                  <div className="w-20 h-20 rounded-full bg-bd-green/10 text-bd-green grid place-items-center font-bold text-2xl mx-auto overflow-hidden">
                    {profile?.avatar_url
                      ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                      : (profile?.full_name ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <h3 className="mt-3 font-bold text-lg">{profile?.full_name ?? profile?.username ?? "বিজয়ী"}</h3>
                  <p className="text-xs text-muted-foreground">{profile?.district ?? "বাংলাদেশ"}</p>
                  <div className="mt-4 text-2xl font-extrabold text-bd-green-dark">
                    পেয়েছেন: {bnCurrency(w.prize_amount ?? PRIZE_AMOUNTS[rank - 1])}
                  </div>
                  <Quote className="w-6 h-6 mx-auto mt-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground italic mt-2">
                    "প্রতিদিন কুইজ দিয়ে এত সহজে পুরস্কার পাবো ভাবিনি!"
                  </p>
                  <Badge className="mt-4 bg-pink-500 hover:bg-pink-500 text-white border-0">✓ bKash-এ পেয়েছি!</Badge>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────── 7. JOBS ───────────── */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bd-green/10 text-bd-green text-sm font-semibold mb-3">
                <Briefcase className="w-4 h-4" /> চাকরি
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold">সর্বশেষ চাকরির বিজ্ঞপ্তি</h2>
            </div>
            <Link to="/jobs" className="text-bd-green font-semibold hover:underline">সমস্ত চাকরি দেখুন →</Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
            {jobs.isLoading && Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-5 h-44 animate-pulse" />
            ))}
            {(jobs.data ?? []).map((j: any) => (
              <Link
                key={j.id}
                to="/jobs"
                className="block rounded-2xl border border-border bg-card p-5 hover:border-bd-green hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-bd-green/10 grid place-items-center overflow-hidden flex-shrink-0">
                    {j.organization_logo
                      ? <img src={j.organization_logo} alt="" className="w-full h-full object-cover" />
                      : <Briefcase className="w-5 h-5 text-bd-green" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold line-clamp-2">{j.title_bn}</h3>
                    <p className="text-sm text-muted-foreground truncate">{j.organization_name}</p>
                  </div>
                  {j.is_featured && <Badge className="bg-gold text-black hover:bg-gold border-0">ফিচারড</Badge>}
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{j.location_bn ?? "বাংলাদেশ"}</span>
                  <span className="flex items-center gap-1 text-bd-red font-semibold">
                    <Calendar className="w-3 h-3" />
                    {j.application_deadline ? new Date(j.application_deadline).toLocaleDateString("en-GB") : "—"}
                  </span>
                </div>
                <Button size="sm" variant="ghost" className="mt-3 -ml-2 text-bd-green">বিস্তারিত <ArrowRight className="w-3 h-3 ml-1" /></Button>
              </Link>
            ))}
            {!jobs.isLoading && (jobs.data ?? []).length === 0 && (
              <div className="col-span-full text-center text-muted-foreground py-12">
                নতুন চাকরির বিজ্ঞপ্তি শীঘ্রই আসছে।
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ───────────── 8. SUBSCRIPTION CTA ───────────── */}
      <section className="py-20 px-4 gold-shimmer text-black">
        <div className="max-w-5xl mx-auto text-center">
          <Gift className="w-12 h-12 mx-auto" />
          <h2 className="mt-4 text-4xl md:text-6xl font-extrabold text-slate-900">
            মাত্র {bnCurrency(10)}-এ পুরস্কার জিতুন!
          </h2>
          <p className="mt-4 text-lg text-slate-900/85 max-w-2xl mx-auto">
            প্রতিমাসে মাত্র একটি চা-এর দামে প্রিমিয়াম হন এবং {bnCurrency(1500)} পর্যন্ত নগদ পুরস্কার জিতুন!
          </p>
          <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
            <Badge className="bg-pink-500 hover:bg-pink-500 text-white border-0 text-sm px-3 py-1">bKash</Badge>
            <Badge className="bg-orange-500 hover:bg-orange-500 text-white border-0 text-sm px-3 py-1">Nagad</Badge>
            <Badge className="bg-purple-600 hover:bg-purple-600 text-white border-0 text-sm px-3 py-1">Rocket</Badge>
          </div>
          <Button asChild size="lg" className="mt-8 h-14 px-10 bg-slate-900 hover:bg-slate-800 text-white text-base font-bold">
            <Link to="/subscribe">⭐ এখনই প্রিমিয়াম হন — মাত্র {bnCurrency(10)}/মাস</Link>
          </Button>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-900/80">
            <Link to="/faq" className="hover:underline">কখন পুরস্কার পাবো?</Link>
            <span>·</span>
            <Link to="/faq" className="hover:underline">কীভাবে পেমেন্ট করবো?</Link>
            <span>·</span>
            <Link to="/faq" className="hover:underline">পুরস্কার কীভাবে পাঠানো হয়?</Link>
          </div>
        </div>
      </section>

      {/* ───────────── 9. BLOG ───────────── */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-info/10 text-info text-sm font-semibold mb-3">
                <BookOpen className="w-4 h-4" /> প্রস্তুতি
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold">পরীক্ষার প্রস্তুতি টিপস</h2>
            </div>
            <Link to="/blog" className="text-bd-green font-semibold hover:underline">সব আর্টিকেল পড়ুন →</Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {blog.isLoading && Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card h-64 animate-pulse" />
            ))}
            {(blog.data ?? []).map((post: any) => (
              <Link
                key={post.id}
                to="/blog"
                className="group block rounded-2xl border border-border bg-card overflow-hidden hover:border-bd-green hover:shadow-xl transition-all"
              >
                <div className="aspect-[16/9] bg-gradient-to-br from-bd-green/20 to-gold/20 overflow-hidden">
                  {post.featured_image && (
                    <img src={post.featured_image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  )}
                </div>
                <div className="p-5">
                  {post.category && <Badge variant="secondary" className="mb-2">{post.category}</Badge>}
                  <h3 className="font-bold line-clamp-2 group-hover:text-bd-green transition-colors">{post.title_bn}</h3>
                  {post.excerpt_bn && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{post.excerpt_bn}</p>}
                </div>
              </Link>
            ))}
            {!blog.isLoading && (blog.data ?? []).length === 0 && (
              <div className="col-span-full text-center text-muted-foreground py-12">
                নতুন আর্টিকেল শীঘ্রই আসছে।
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ───────────── 10. STATS ───────────── */}
      <section className="py-16 px-4 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {[
            { label: "নিবন্ধিত ব্যবহারকারী", value: stats.data?.users ?? 0, icon: Users, suffix: "+" },
            { label: "কুইজ সম্পন্ন", value: stats.data?.quizzes ?? 0, icon: Brain, suffix: "+" },
            { label: "পুরস্কার বিতরণ", value: stats.data?.prizesGiven ?? 0, icon: Trophy, suffix: "+" },
            { label: "মোট পুরস্কার (৳)", value: stats.data?.totalPaid ?? 0, icon: Wallet },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <s.icon className="w-7 h-7 mx-auto text-gold" />
              <div className="mt-3 text-3xl md:text-4xl font-extrabold text-gold">
                <CountUp value={s.value} suffix={s.suffix} />
              </div>
              <div className="mt-1 text-sm text-white/70">{s.label}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

/* ----------------------------- shared ----------------------------- */

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bd-green/10 text-bd-green text-sm font-semibold mb-3">
        <Sparkles className="w-4 h-4" /> {eyebrow}
      </div>
      <h2 className="text-3xl md:text-5xl font-extrabold">{title}</h2>
    </div>
  );
}

function FeatureLine({ children, ok = false, highlight = false }: { children: React.ReactNode; ok?: boolean; highlight?: boolean }) {
  return (
    <li className={`flex items-start gap-2 ${highlight ? "font-bold text-bd-green-dark" : ""}`}>
      {ok
        ? <Check className="w-5 h-5 text-bd-green flex-shrink-0 mt-0.5" />
        : <X className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />}
      <span className={ok ? "" : "text-muted-foreground line-through"}>{children}</span>
    </li>
  );
}