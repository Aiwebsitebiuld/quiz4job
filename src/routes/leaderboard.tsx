import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { bnCurrency, toBn } from "@/lib/bn";
import { CountdownTimer } from "@/components/countdown-timer";
import { Crown, Trophy, Medal, Check, X as XIcon, ThumbsUp, Star } from "lucide-react";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "মাসিক লিডারবোর্ড — Quiz4Job" },
      { name: "description", content: "মাসিক নগদ পুরস্কার লিডারবোর্ড। শীর্ষ ৩ জন bKash-এ ৳৩,০০০ পুরস্কার পাবেন।" },
    ],
  }),
  component: LeaderboardPage,
});

const BN_MONTHS = [
  "জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন",
  "জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর",
];

type LbRow = {
  id: string;
  user_id: string;
  total_score: number;
  quizzes_taken: number;
  correct_answers: number;
  is_premium: boolean;
  facebook_liked: boolean;
  is_prize_eligible: boolean;
  prize_amount: number;
  profile: { full_name: string | null; username: string | null; avatar_url: string | null; district: string | null } | null;
};

function useLeaderboard(month: number, year: number) {
  return useQuery({
    queryKey: ["leaderboard", month, year],
    queryFn: async (): Promise<LbRow[]> => {
      const { data, error } = await supabase
        .from("monthly_leaderboard")
        .select("id,user_id,total_score,quizzes_taken,correct_answers,is_premium,facebook_liked,is_prize_eligible,prize_amount,profile:profiles!monthly_leaderboard_user_id_fkey(full_name,username,avatar_url,district)")
        .eq("month", month)
        .eq("year", year)
        .order("total_score", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as unknown as LbRow[];
    },
  });
}

function useHallOfFame() {
  return useQuery({
    queryKey: ["hall-of-fame"],
    queryFn: async () => {
      const { data } = await supabase
        .from("monthly_leaderboard")
        .select("id,user_id,month,year,prize_amount,total_score,profile:profiles!monthly_leaderboard_user_id_fkey(full_name,username,avatar_url)")
        .gt("prize_amount", 0)
        .order("year", { ascending: false })
        .order("month", { ascending: false })
        .order("prize_amount", { ascending: false })
        .limit(12);
      return data ?? [];
    },
  });
}

function Avatar({ src, name, size = 48 }: { src?: string | null; name: string; size?: number }) {
  const initial = name.trim().charAt(0).toUpperCase() || "U";
  if (src) return <img src={src} alt={name} className="rounded-full object-cover" style={{ width: size, height: size }} />;
  return (
    <div
      className="rounded-full bg-bd-green text-white grid place-items-center font-bold"
      style={{ width: size, height: size, fontSize: size / 2.5 }}
    >
      {initial}
    </div>
  );
}

function LeaderboardPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [page, setPage] = useState(1);
  const [showEligibility, setShowEligibility] = useState(false);

  const { profile, user, isPremium } = useAuth();
  const { data: rows = [], isLoading } = useLeaderboard(month, year);
  const { data: hof = [] } = useHallOfFame();

  const myRank = useMemo(() => {
    if (!user) return null;
    const idx = rows.findIndex((r) => r.user_id === user.id);
    return idx >= 0 ? { rank: idx + 1, row: rows[idx] } : null;
  }, [rows, user]);

  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);
  const pageSize = 20;
  const pageCount = Math.max(1, Math.ceil(rest.length / pageSize));
  const paged = rest.slice((page - 1) * pageSize, page * pageSize);

  const yearOpts = [now.getFullYear(), now.getFullYear() - 1];

  const PRIZE = [1500, 1000, 500];

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-b from-bd-green to-bd-green-dark text-white">
        <div className="max-w-6xl mx-auto px-4 py-10 sm:py-14 text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold">মাসিক নগদ পুরস্কার লিডারবোর্ড 🏆</h1>
          <p className="mt-3 text-white/85 text-lg">{BN_MONTHS[month - 1]} {toBn(year)}-এর শীর্ষ কুইজার্স</p>
        </div>
      </section>

      {/* Prize pool banner */}
      <section className="max-w-6xl mx-auto px-4 -mt-8">
        <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-gold via-amber-400 to-amber-600 text-amber-950 shadow-2xl shadow-amber-500/30 border-2 border-amber-300 animate-pulse-slow">
          <div className="text-center">
            <div className="text-lg sm:text-xl font-semibold">🎁 এই মাসের পুরস্কার পুল</div>
            <div className="text-4xl sm:text-6xl font-extrabold mt-1">{bnCurrency(3000)} টাকা</div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-5 max-w-3xl mx-auto">
            {[
              { e: "🥇", l: "১ম", a: 1500 },
              { e: "🥈", l: "২য়", a: 1000 },
              { e: "🥉", l: "৩য়", a: 500 },
            ].map((p) => (
              <div key={p.l} className="bg-white/40 backdrop-blur rounded-2xl p-3 sm:p-4 text-center border border-white/60">
                <div className="text-2xl sm:text-3xl">{p.e}</div>
                <div className="text-sm font-bold mt-1">{p.l} স্থান</div>
                <div className="text-lg sm:text-2xl font-extrabold">{bnCurrency(p.a)}</div>
              </div>
            ))}
          </div>
          <p className="text-center mt-4 text-sm font-semibold">বিজয়ীদের bKash-এ পুরস্কার পাঠানো হবে</p>
          <div className="mt-5 flex flex-col items-center gap-2">
            <p className="text-sm font-semibold">মাস শেষ হতে বাকি:</p>
            <CountdownTimer />
          </div>
        </div>
      </section>

      {/* Eligibility */}
      <section className="max-w-6xl mx-auto px-4 mt-8">
        <div className="rounded-2xl border-2 border-gold/60 bg-gold/5 p-6">
          <h2 className="text-xl font-bold text-foreground">পুরস্কারের জন্য যোগ্যতা</h2>
          <ul className="mt-3 space-y-2 text-foreground/90">
            <li className="flex gap-2"><Check className="w-5 h-5 text-bd-green shrink-0" /> প্রিমিয়াম সদস্য হতে হবে (৳১০/মাস)</li>
            <li className="flex gap-2"><Check className="w-5 h-5 text-bd-green shrink-0" /> আমাদের Facebook পেজ লাইক করতে হবে</li>
            <li className="flex gap-2"><Check className="w-5 h-5 text-bd-green shrink-0" /> এই মাসে কমপক্ষে ৫টি র‍্যান্ক কুইজ দিতে হবে</li>
          </ul>
          {user && (
            <button
              onClick={() => setShowEligibility(true)}
              className="mt-4 px-5 py-2.5 rounded-lg bg-bd-green text-white font-semibold hover:bg-bd-green-dark"
            >
              আমার যোগ্যতা যাচাই করুন
            </button>
          )}
        </div>
      </section>

      {/* Month selector */}
      <section className="max-w-6xl mx-auto px-4 mt-10 flex flex-wrap items-center gap-3">
        <span className="font-semibold">মাস:</span>
        <select
          value={month}
          onChange={(e) => { setMonth(Number(e.target.value)); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-border bg-white"
        >
          {BN_MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
        <select
          value={year}
          onChange={(e) => { setYear(Number(e.target.value)); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-border bg-white"
        >
          {yearOpts.map((y) => <option key={y} value={y}>{toBn(y)}</option>)}
        </select>
      </section>

      {/* Podium */}
      {top3.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 mt-8">
          <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end">
            {[1, 0, 2].map((idx, pos) => {
              const r = top3[idx];
              if (!r) return <div key={pos} />;
              const heights = ["h-32", "h-40", "h-24"];
              const colors = [
                "from-slate-300 to-slate-400",
                "from-yellow-300 to-amber-500",
                "from-amber-700 to-amber-900",
              ];
              const emojis = ["🥈", "🥇", "🥉"];
              const name = r.profile?.full_name || r.profile?.username || "—";
              return (
                <div key={r.id} className="flex flex-col items-center text-center">
                  <div className="text-3xl sm:text-4xl mb-2">{emojis[pos]}</div>
                  <Avatar src={r.profile?.avatar_url} name={name} size={72} />
                  <div className="mt-2 font-bold text-sm sm:text-base truncate max-w-full">{name}</div>
                  <div className="text-gold font-extrabold text-lg">{bnCurrency(PRIZE[idx])}</div>
                  <div className="text-xs text-muted-foreground">স্কোর {toBn(r.total_score)}</div>
                  <div className={`mt-2 w-full ${heights[pos]} rounded-t-xl bg-gradient-to-b ${colors[pos]} grid place-items-center text-white text-2xl sm:text-3xl font-extrabold shadow-lg`}>
                    {toBn(idx + 1)}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Full table */}
      <section className="max-w-6xl mx-auto px-4 mt-10">
        <div className="overflow-x-auto rounded-2xl border border-border bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-bd-green-light text-bd-green-dark">
              <tr>
                <th className="px-4 py-3 text-left">র‍্যাংক</th>
                <th className="px-4 py-3 text-left">ব্যবহারকারী</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">জেলা</th>
                <th className="px-4 py-3 text-right">স্কোর</th>
                <th className="px-4 py-3 text-right hidden sm:table-cell">কুইজ</th>
                <th className="px-4 py-3 text-right hidden sm:table-cell">সঠিক</th>
                <th className="px-4 py-3 text-center">যোগ্যতা</th>
                <th className="px-4 py-3 text-right">পুরস্কার</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={8} className="text-center py-10 text-muted-foreground">লোড হচ্ছে…</td></tr>
              )}
              {!isLoading && rows.length === 0 && (
                <tr><td colSpan={8} className="text-center py-10 text-muted-foreground">এই মাসে এখনো কোনো র‍্যান্ক কুইজ নেই।</td></tr>
              )}
              {[...top3, ...paged].map((r, i) => {
                const rank = i < top3.length ? i + 1 : (page - 1) * pageSize + (i - top3.length) + 4;
                const mine = user && r.user_id === user.id;
                const name = r.profile?.full_name || r.profile?.username || "—";
                const prize = rank <= 3 ? PRIZE[rank - 1] : 0;
                const rowClass =
                  rank === 1 ? "bg-amber-100/70" :
                  rank === 2 ? "bg-slate-100" :
                  rank === 3 ? "bg-amber-50" :
                  rank <= 10 ? "bg-bd-green-light/40" : "";
                return (
                  <tr key={r.id} className={`border-t border-border ${rowClass} ${mine ? "outline outline-2 outline-blue-400 bg-blue-50/60" : ""}`}>
                    <td className="px-4 py-3 font-bold">
                      {rank === 1 ? "🏆" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : ""} #{toBn(rank)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar src={r.profile?.avatar_url} name={name} size={32} />
                        <div className="font-semibold">{name}</div>
                        {mine && <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">আপনি</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{r.profile?.district || "—"}</td>
                    <td className="px-4 py-3 text-right font-bold">{toBn(r.total_score)}</td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell">{toBn(r.quizzes_taken)}</td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell">{toBn(r.correct_answers)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5 text-xs">
                        <span title="Premium" className={r.is_premium ? "text-gold" : "text-muted-foreground/40"}><Star className="w-4 h-4" /></span>
                        <span title="FB liked" className={r.facebook_liked ? "text-blue-600" : "text-muted-foreground/40"}><ThumbsUp className="w-4 h-4" /></span>
                        {r.is_prize_eligible
                          ? <Check className="w-4 h-4 text-bd-green" />
                          : <XIcon className="w-4 h-4 text-red-500" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gold">{prize ? bnCurrency(prize) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pageCount > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-lg font-semibold ${p === page ? "bg-bd-green text-white" : "bg-white border border-border hover:bg-muted"}`}
              >
                {toBn(p)}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* My ranking */}
      {user && (
        <section className="max-w-6xl mx-auto px-4 mt-10">
          <div className="rounded-2xl bg-blue-50 border-2 border-blue-300 p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm text-blue-700 font-semibold">আপনার র‍্যাংক</div>
              <div className="text-3xl font-extrabold text-blue-900">{myRank ? `#${toBn(myRank.rank)}` : "—"}</div>
            </div>
            <div>
              <div className="text-sm text-blue-700 font-semibold">মোট স্কোর</div>
              <div className="text-2xl font-bold text-blue-900">{toBn(myRank?.row.total_score ?? 0)}</div>
            </div>
            <div>
              <div className="text-sm text-blue-700 font-semibold">পুরস্কার যোগ্যতা</div>
              <div className="text-xl font-bold">{myRank?.row.is_prize_eligible ? <span className="text-bd-green">✓ যোগ্য</span> : <span className="text-red-600">✗ অযোগ্য</span>}</div>
            </div>
            <Link to="/quiz" className="px-5 py-2.5 rounded-lg bg-bd-green text-white font-semibold hover:bg-bd-green-dark">
              র‍্যাংক উন্নত করুন →
            </Link>
          </div>
        </section>
      )}

      {/* Hall of Fame */}
      <section className="max-w-6xl mx-auto px-4 mt-12 mb-16">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center">সর্বকালের বিজয়ীরা 🏛️</h2>
        {hof.length === 0 ? (
          <p className="text-center text-muted-foreground mt-4">শীঘ্রই বিজয়ীদের তালিকা প্রকাশিত হবে।</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {hof.map((h: any) => {
              const name = h.profile?.full_name || h.profile?.username || "—";
              return (
                <div key={h.id} className="rounded-2xl border border-gold/40 bg-gradient-to-br from-amber-50 to-white p-4 flex items-center gap-4">
                  <Avatar src={h.profile?.avatar_url} name={name} size={56} />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate">{name}</div>
                    <div className="text-xs text-muted-foreground">{BN_MONTHS[h.month - 1]} {toBn(h.year)}</div>
                    <div className="text-gold font-extrabold">{bnCurrency(h.prize_amount)}</div>
                  </div>
                  <Trophy className="w-7 h-7 text-gold" />
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Eligibility modal */}
      {showEligibility && profile && (
        <div className="fixed inset-0 bg-black/60 z-50 grid place-items-center p-4" onClick={() => setShowEligibility(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">আপনার যোগ্যতা</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                {isPremium ? <Check className="w-5 h-5 text-bd-green" /> : <XIcon className="w-5 h-5 text-red-500" />}
                <span>প্রিমিয়াম সদস্য (৳১০/মাস)</span>
              </li>
              <li className="flex items-center gap-3">
                {profile.facebook_liked ? <Check className="w-5 h-5 text-bd-green" /> : <XIcon className="w-5 h-5 text-red-500" />}
                <span>Facebook পেজ লাইক করেছেন</span>
              </li>
              <li className="flex items-center gap-3">
                {(myRank?.row.quizzes_taken ?? 0) >= 5 ? <Check className="w-5 h-5 text-bd-green" /> : <XIcon className="w-5 h-5 text-red-500" />}
                <span>এই মাসে ৫+ র‍্যান্ক কুইজ ({toBn(myRank?.row.quizzes_taken ?? 0)}/৫)</span>
              </li>
            </ul>
            <button onClick={() => setShowEligibility(false)} className="mt-6 w-full px-4 py-2.5 rounded-lg bg-bd-green text-white font-semibold">ঠিক আছে</button>
          </div>
        </div>
      )}
    </div>
  );
}
