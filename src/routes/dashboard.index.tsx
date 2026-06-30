import { useEffect, useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toBn } from "@/lib/bn";
import {
  Crown,
  Trophy,
  Target,
  CheckCircle2,
  Percent,
  Brain,
  Briefcase,
  Star,
  ThumbsUp,
  Bookmark,
  ArrowRight,
  Mail,
  AlertTriangle,
} from "lucide-react";

function EmailVerifyBanner({ createdAt, verified }: { createdAt: string | null; verified: boolean }) {
  if (verified || !createdAt) return null;
  const ageMs = Date.now() - new Date(createdAt).getTime();
  const twoDays = 2 * 24 * 60 * 60 * 1000;
  const overdue = ageMs > twoDays;
  const hoursLeft = Math.max(0, Math.ceil((twoDays - ageMs) / (60 * 60 * 1000)));

  if (overdue) {
    return (
      <div className="rounded-xl border border-red-300 bg-red-50 p-4 flex gap-3 items-start">
        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="font-bold text-red-900">ইমেইল ভেরিফাই করুন</p>
          <p className="text-sm text-red-800 mt-0.5">২ দিনের গ্রেস পিরিয়ড শেষ। ভেরিফাই না করা পর্যন্ত নতুন কুইজ দেওয়া যাবে না।</p>
        </div>
        <Link to="/verify-email" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700">
          <Mail className="w-4 h-4" /> ভেরিফাই
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 flex gap-3 items-start">
      <Mail className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="font-semibold text-amber-900">ইমেইল ভেরিফাই করতে ভুলবেন না</p>
        <p className="text-sm text-amber-800 mt-0.5">আনুমানিক {Math.floor(hoursLeft / 24)} দিন {hoursLeft % 24} ঘন্টা বাকি। এর পরে ভেরিফাই ছাড়া কুইজ বন্ধ থাকবে।</p>
      </div>
      <Link to="/verify-email" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-white text-sm font-bold hover:bg-amber-700">
        এখনই ভেরিফাই
      </Link>
    </div>
  );
}

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "ড্যাশবোর্ড — Quiz4Job" },
      { name: "description", content: "আপনার ব্যক্তিগত কুইজ ড্যাশবোর্ড — স্কোর, র‍্যাঙ্ক এবং অগ্রগতি দেখুন।" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, profile, isPremium, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { data: sessions } = useQuery({
    queryKey: ["dash-sessions", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("quiz_sessions")
        .select("id, category_id, score, correct_answers, wrong_answers, total_questions, percentage, time_taken_seconds, completed_at, status")
        .eq("user_id", user!.id)
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(50);
      return data ?? [];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["dash-cats"],
    queryFn: async () => {
      const { data } = await supabase.from("quiz_categories").select("id, name_bn, slug, icon, color");
      return data ?? [];
    },
  });

  const { data: lb } = useQuery({
    queryKey: ["dash-lb", month, year, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("monthly_leaderboard")
        .select("user_id, total_score, profile:profiles!monthly_leaderboard_user_id_fkey(full_name, username)")
        .eq("month", month)
        .eq("year", year)
        .order("total_score", { ascending: false })
        .limit(100);
      return data ?? [];
    },
  });

  const { data: savedJobs } = useQuery({
    queryKey: ["dash-saved", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("saved_jobs")
        .select("id, created_at, job:jobs(id, slug, title_bn, organization_name, application_deadline)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(3);
      return data ?? [];
    },
  });

  const totalQuizzes = sessions?.length ?? 0;
  const totalCorrect = sessions?.reduce((s, x) => s + (x.correct_answers ?? 0), 0) ?? 0;
  const avgPercent = totalQuizzes
    ? Math.round(sessions!.reduce((s, x) => s + Number(x.percentage ?? 0), 0) / totalQuizzes)
    : 0;

  const myRank = useMemo(() => {
    if (!lb || !user) return null;
    const idx = lb.findIndex((r: any) => r.user_id === user.id);
    return idx === -1 ? null : idx + 1;
  }, [lb, user]);
  const myScore = lb?.find((r: any) => r.user_id === user?.id)?.total_score ?? 0;
  const topScore = lb?.[0]?.total_score ?? 0;
  const pointsToTop = Math.max(0, topScore - myScore);

  // weak categories by avg %
  const weakCats = useMemo(() => {
    if (!sessions || !categories) return [];
    const byCat: Record<string, { sum: number; n: number }> = {};
    sessions.forEach((s) => {
      const k = s.category_id;
      if (!k) return;
      byCat[k] ||= { sum: 0, n: 0 };
      byCat[k].sum += Number(s.percentage ?? 0);
      byCat[k].n += 1;
    });
    const ranked = Object.entries(byCat)
      .map(([id, v]) => ({ id, avg: v.sum / v.n }))
      .sort((a, b) => a.avg - b.avg);
    const weakIds = ranked.slice(0, 3).map((r) => r.id);
    const result = categories.filter((c) => weakIds.includes(c.id));
    if (result.length < 3) {
      const rest = categories.filter((c) => !weakIds.includes(c.id)).slice(0, 3 - result.length);
      return [...result, ...rest];
    }
    return result;
  }, [sessions, categories]);

  // Quota: free=5/week, basic=5/day, pro=10/day
  const tier = profile?.premium_tier ?? "free";
  const isFree = !isPremium || tier === "free";
  const dailyLimit = tier === "pro" ? 10 : 5;
  const weeklyLimit = 5;
  const usedWeek = profile?.free_quizzes_week ?? 0;
  const usedDay = profile?.free_quizzes_today ?? 0;
  const quotaLimit = isFree ? weeklyLimit : dailyLimit;
  const quotaUsed = isFree ? usedWeek : usedDay;
  const quotaLeft = Math.max(0, quotaLimit - quotaUsed);
  const quotaPercent = Math.min(100, Math.round((quotaUsed / quotaLimit) * 100));
  const periodLabel = isFree ? "এই সপ্তাহে" : "আজ";

  if (loading || !user) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">লোড হচ্ছে…</div>;
  }

  const firstName = (profile?.full_name || "ইউজার").split(" ")[0];
  const premiumExpiry = profile?.premium_expires_at
    ? new Date(profile.premium_expires_at).toLocaleDateString("en-GB")
    : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <EmailVerifyBanner createdAt={profile?.created_at ?? null} verified={!!profile?.email_verified} />
        {/* Welcome */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">স্বাগতম, {firstName}! 👋</h1>
            <div className="mt-2 flex flex-wrap gap-2">
              {isPremium ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-medium">
                  <Crown className="w-4 h-4" /> {tier === "pro" ? "Pro" : "Basic"} প্রিমিয়াম
                  {premiumExpiry && <span className="text-amber-700">· মেয়াদ {premiumExpiry}</span>}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-sm font-medium">
                  ফ্রি সদস্য
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bd-green/10 text-bd-green text-sm font-medium">
                {periodLabel} {toBn(quotaLeft)}/{toBn(quotaLimit)} কুইজ বাকি
              </span>
            </div>
          </div>
          <Link to="/profile" className="text-sm text-bd-green hover:underline">প্রোফাইল সম্পাদনা →</Link>
        </div>

        {/* Weekly/Daily quota tracker */}
        <div className={`rounded-xl p-5 shadow border-2 ${
          isFree
            ? quotaLeft === 0
              ? "bg-gradient-to-r from-red-50 to-amber-50 border-red-300"
              : "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-300"
            : "bg-gradient-to-r from-green-50 to-emerald-50 border-bd-green/40"
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div>
              <p className="font-bold text-lg text-slate-800">
                {isFree ? "🎯 আপনার সাপ্তাহিক ফ্রি কুইজ" : "📅 আপনার দৈনিক কুইজ কোটা"}
              </p>
              <p className="text-sm text-slate-600 mt-0.5">
                {isFree
                  ? <>সপ্তাহে মাত্র <strong>৫টি</strong> ফ্রি কুইজ · প্রতি কুইজে সর্বোচ্চ ২০ প্রশ্ন</>
                  : tier === "pro"
                    ? <>প্রতিদিন <strong>১০টি</strong> কুইজ · প্রতি কুইজে ৬০ প্রশ্ন</>
                    : <>প্রতিদিন <strong>৫টি</strong> কুইজ · প্রতি কুইজে ৪০ প্রশ্ন</>}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-extrabold text-bd-green">{toBn(quotaLeft)}<span className="text-base text-slate-500">/{toBn(quotaLimit)}</span></div>
              <div className="text-xs text-slate-500">বাকি আছে</div>
            </div>
          </div>
          <div className="h-3 bg-white/70 rounded-full overflow-hidden border border-slate-200">
            <div
              className={`h-full transition-all ${
                quotaPercent >= 100 ? "bg-red-500" : quotaPercent >= 80 ? "bg-orange-500" : "bg-bd-green"
              }`}
              style={{ width: `${quotaPercent}%` }}
            />
          </div>
          {isFree && (
            <div className="mt-4 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 p-4 text-amber-950">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-extrabold text-base flex items-center gap-1.5">
                    <Crown className="w-5 h-5" />
                    {quotaLeft === 0
                      ? "সাপ্তাহিক কোটা শেষ! প্রিমিয়ামে আপগ্রেড করুন"
                      : "প্রিমিয়াম হলে কী পাবেন?"}
                  </p>
                  <ul className="text-sm mt-1 space-y-0.5">
                    <li>✓ প্রতিদিন ৫–১০টি কুইজ (৪০–৬০ প্রশ্ন)</li>
                    <li>✓ ৳৩,০০০ মাসিক পুরস্কারের সুযোগ 🏆</li>
                    <li>✓ লিডারবোর্ডে নাম তোলার সুযোগ</li>
                  </ul>
                </div>
                <Link to="/premium" className="px-5 py-2.5 rounded-lg bg-amber-950 text-amber-50 font-bold hover:bg-amber-900 whitespace-nowrap">
                  প্রিমিয়াম ৳৩০/মাস →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<Target className="w-5 h-5 text-blue-600" />} label="মোট কুইজ" value={toBn(totalQuizzes)} />
          <StatCard icon={<CheckCircle2 className="w-5 h-5 text-green-600" />} label="সঠিক উত্তর" value={toBn(totalCorrect)} />
          <StatCard icon={<Percent className="w-5 h-5 text-purple-600" />} label="গড় স্কোর" value={`${toBn(avgPercent)}%`} />
          <StatCard icon={<Trophy className="w-5 h-5 text-amber-600" />} label="এই মাসের র‍্যাংক" value={myRank ? `#${toBn(myRank)}` : "—"} />
        </div>

        {/* Monthly Progress */}
        <section className="bg-white rounded-xl border p-5">
          <h2 className="font-bold text-lg mb-3">এই মাসে আপনার অবস্থান</h2>
          <p className="text-sm text-muted-foreground mb-2">
            আপনি <strong className="text-bd-green">{toBn(myScore)}</strong> পয়েন্ট পেয়েছেন।
            {pointsToTop > 0 && (
              <> ১ম স্থানের জন্য আরও <strong>{toBn(pointsToTop)}</strong> পয়েন্ট লাগবে।</>
            )}
          </p>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-bd-green to-green-500 transition-all"
              style={{ width: `${topScore ? Math.min(100, (myScore / topScore) * 100) : 0}%` }} />
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            {(lb ?? []).slice(0, 3).map((r: any, i) => (
              <div key={r.user_id} className="px-3 py-2 rounded-lg bg-slate-50 flex items-center justify-between">
                <span>#{toBn(i + 1)} {r.profile?.full_name?.split(" ")[0] ?? "—"}</span>
                <strong>{toBn(r.total_score)}</strong>
              </div>
            ))}
            {myRank && myRank > 3 && (
              <div className="px-3 py-2 rounded-lg bg-bd-green/10 border border-bd-green/30 flex items-center justify-between">
                <span>আপনি #{toBn(myRank)}</span>
                <strong>{toBn(myScore)}</strong>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-3">আরও কুইজ দিন এবং এগিয়ে যান!</p>
        </section>

        {/* Prize eligibility checklist */}
        {isPremium && (
          <section className="bg-white rounded-xl border p-5">
            <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" /> পুরস্কারের যোগ্যতা
            </h2>
            <ul className="space-y-2 text-sm">
              <ChecklistItem ok label="প্রিমিয়াম সদস্য" />
              <ChecklistItem
                ok={!!profile?.facebook_liked}
                label="Facebook পেজ লাইক"
                action={
                  !profile?.facebook_liked && (
                    <a href="https://facebook.com/quiz4job" target="_blank" rel="noopener noreferrer"
                       className="inline-flex items-center gap-1 px-3 py-1 rounded bg-blue-600 text-white text-xs font-medium hover:bg-blue-700">
                      <ThumbsUp className="w-3.5 h-3.5" /> লাইক করুন
                    </a>
                  )
                }
              />
              <ChecklistItem
                ok={totalQuizzes >= 5}
                label="এই মাসে ৫+ র‍্যান্ক কুইজ"
                action={
                  totalQuizzes < 5 && (
                    <Link to="/quiz" className="inline-flex items-center gap-1 px-3 py-1 rounded bg-bd-green text-white text-xs font-medium hover:bg-bd-green/90">
                      কুইজ দিন
                    </Link>
                  )
                }
              />
            </ul>
          </section>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <ActionTile to="/quiz" icon={<Brain className="w-5 h-5" />} label="কুইজ শুরু করুন" color="bg-bd-green" />
          <ActionTile to="/jobs" icon={<Briefcase className="w-5 h-5" />} label="চাকরি দেখুন" color="bg-blue-600" />
          <ActionTile to="/leaderboard" icon={<Trophy className="w-5 h-5" />} label="লিডারবোর্ড" color="bg-amber-500" />
          <ActionTile to="/premium" icon={<Star className="w-5 h-5" />} label="প্রিমিয়াম হন" color="bg-gradient-to-r from-amber-500 to-yellow-600" />
        </div>

        {/* Recent quizzes */}
        <section className="bg-white rounded-xl border p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg">সাম্প্রতিক কুইজ ইতিহাস</h2>
            <Link to="/dashboard/history" className="text-sm text-bd-green hover:underline flex items-center gap-1">
              সব দেখুন <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {sessions && sessions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground border-b">
                  <tr>
                    <th className="py-2 pr-2">বিষয়</th>
                    <th className="py-2 pr-2">তারিখ</th>
                    <th className="py-2 pr-2">স্কোর</th>
                    <th className="py-2 pr-2">সঠিক/মোট</th>
                    <th className="py-2 pr-2">সময়</th>
                    <th className="py-2 pr-2">রিভিউ</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.slice(0, 5).map((s) => {
                    const cat = categories?.find((c) => c.id === s.category_id);
                    return (
                      <tr key={s.id} className="border-b last:border-0">
                        <td className="py-2 pr-2">{cat?.name_bn ?? "—"}</td>
                        <td className="py-2 pr-2">{s.completed_at ? new Date(s.completed_at).toLocaleDateString("en-GB") : "—"}</td>
                        <td className="py-2 pr-2 font-medium">{toBn(s.score ?? 0)}</td>
                        <td className="py-2 pr-2">{toBn(s.correct_answers ?? 0)}/{toBn(s.total_questions ?? 0)}</td>
                        <td className="py-2 pr-2">{toBn(Math.round((s.time_taken_seconds ?? 0) / 60))} মি</td>
                        <td className="py-2 pr-2">
                          <Link to="/quiz/result/$sessionId" params={{ sessionId: s.id }} className="text-bd-green hover:underline">দেখুন</Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">এখনও কোনো কুইজ দেননি। <Link to="/quiz" className="text-bd-green underline">শুরু করুন</Link></p>
          )}
        </section>

        {/* Recommended */}
        <section className="bg-white rounded-xl border p-5">
          <h2 className="font-bold text-lg mb-3">আপনার জন্য প্রস্তাবিত</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {weakCats.map((c: any) => (
              <Link key={c.id} to="/quiz" className="rounded-lg border p-4 hover:shadow-md transition flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg grid place-items-center text-white text-lg"
                  style={{ background: c.color ?? "#16a34a" }}>{c.icon ?? "📚"}</div>
                <div>
                  <div className="font-medium">{c.name_bn}</div>
                  <div className="text-xs text-muted-foreground">দুর্বল এলাকা — অনুশীলন করুন</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Saved jobs */}
        <section className="bg-white rounded-xl border p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg flex items-center gap-2"><Bookmark className="w-5 h-5" /> সেভ করা চাকরি</h2>
            <Link to="/jobs" className="text-sm text-bd-green hover:underline">সব দেখুন →</Link>
          </div>
          {savedJobs && savedJobs.length > 0 ? (
            <ul className="divide-y">
              {savedJobs.map((s: any) => (
                <li key={s.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <Link to="/jobs/$slug" params={{ slug: s.job?.slug }} className="font-medium hover:text-bd-green">
                      {s.job?.title_bn}
                    </Link>
                    <div className="text-xs text-muted-foreground">{s.job?.organization_name}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    শেষ: {s.job?.application_deadline ? new Date(s.job.application_deadline).toLocaleDateString("en-GB") : "—"}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">এখনও কোনো চাকরি সেভ করেননি।</p>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border p-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">{icon}<span>{label}</span></div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}

function ChecklistItem({ ok, label, action }: { ok: boolean; label: string; action?: React.ReactNode }) {
  return (
    <li className="flex items-center justify-between gap-3 py-2 border-b last:border-0">
      <span className="flex items-center gap-2">
        {ok ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <span className="w-5 h-5 rounded-full border-2 border-red-400 grid place-items-center text-xs text-red-500">✕</span>}
        <span className={ok ? "text-foreground" : "text-muted-foreground"}>{label}</span>
      </span>
      {!ok && action}
    </li>
  );
}

function ActionTile({ to, icon, label, color }: { to: string; icon: React.ReactNode; label: string; color: string }) {
  return (
    <Link to={to as any} className={`${color} text-white rounded-xl p-4 hover:opacity-90 transition flex items-center gap-3 font-medium`}>
      {icon}<span>{label}</span>
    </Link>
  );
}