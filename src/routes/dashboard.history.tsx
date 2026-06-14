import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toBn } from "@/lib/bn";

export const Route = createFileRoute("/dashboard/history")({
  head: () => ({ meta: [{ title: "কুইজ ইতিহাস — Quiz4Job" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (!loading && !user) navigate({ to: "/login" }); }, [loading, user, navigate]);

  const [catFilter, setCatFilter] = useState("all");
  const [minScore, setMinScore] = useState(0);
  const [days, setDays] = useState(90);

  const { data: categories } = useQuery({
    queryKey: ["hist-cats"],
    queryFn: async () => (await supabase.from("quiz_categories").select("id, name_bn, slug")).data ?? [],
  });

  const { data: sessions } = useQuery({
    queryKey: ["hist-sessions", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("quiz_sessions")
        .select("id, category_id, score, percentage, correct_answers, wrong_answers, total_questions, time_taken_seconds, completed_at")
        .eq("user_id", user!.id)
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(500);
      return data ?? [];
    },
  });

  const filtered = useMemo(() => {
    if (!sessions) return [];
    const cutoff = Date.now() - days * 86400000;
    return sessions.filter((s) => {
      if (catFilter !== "all" && s.category_id !== catFilter) return false;
      if (Number(s.percentage ?? 0) < minScore) return false;
      if (s.completed_at && new Date(s.completed_at).getTime() < cutoff) return false;
      return true;
    });
  }, [sessions, catFilter, minScore, days]);

  const lineData = useMemo(() => {
    return [...filtered]
      .reverse()
      .slice(-30)
      .map((s) => ({
        date: s.completed_at ? new Date(s.completed_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "",
        score: Number(s.percentage ?? 0),
      }));
  }, [filtered]);

  const catData = useMemo(() => {
    if (!categories) return [];
    const byCat: Record<string, { sum: number; n: number }> = {};
    filtered.forEach((s) => {
      if (!s.category_id) return;
      byCat[s.category_id] ||= { sum: 0, n: 0 };
      byCat[s.category_id].sum += Number(s.percentage ?? 0);
      byCat[s.category_id].n += 1;
    });
    return categories
      .map((c) => ({
        name: c.name_bn,
        avg: byCat[c.id] ? Math.round(byCat[c.id].sum / byCat[c.id].n) : 0,
      }))
      .filter((d) => d.avg > 0);
  }, [filtered, categories]);

  if (loading || !user) return <div className="min-h-screen grid place-items-center text-muted-foreground">লোড হচ্ছে…</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">কুইজ ইতিহাস</h1>
            <p className="text-sm text-muted-foreground">আপনার সম্পন্ন কুইজগুলোর সম্পূর্ণ তালিকা ও পরিসংখ্যান</p>
          </div>
          <Link to="/dashboard" className="text-sm text-bd-green hover:underline">← ড্যাশবোর্ডে ফিরুন</Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border p-4 flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">বিষয়</label>
            <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
              className="h-9 rounded-md border px-3 text-sm bg-white">
              <option value="all">সব</option>
              {(categories ?? []).map((c) => <option key={c.id} value={c.id}>{c.name_bn}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">তারিখ পরিসীমা</label>
            <select value={days} onChange={(e) => setDays(Number(e.target.value))}
              className="h-9 rounded-md border px-3 text-sm bg-white">
              <option value={7}>৭ দিন</option>
              <option value={30}>৩০ দিন</option>
              <option value={90}>৯০ দিন</option>
              <option value={365}>১ বছর</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">ন্যূনতম স্কোর %</label>
            <input type="number" min={0} max={100} value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="h-9 rounded-md border px-3 text-sm w-24" />
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border p-4">
            <h2 className="font-semibold mb-3">সাম্প্রতিক স্কোর প্রবণতা</h2>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={11} />
                <YAxis domain={[0, 100]} fontSize={11} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#16a34a" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <h2 className="font-semibold mb-3">বিষয়ভিত্তিক স্কোর</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={catData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={10} />
                <YAxis domain={[0, 100]} fontSize={11} />
                <Tooltip />
                <Bar dataKey="avg" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-4">
          <h2 className="font-semibold mb-3">পারফরম্যান্স রাডার</h2>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={catData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" fontSize={11} />
              <PolarRadiusAxis domain={[0, 100]} />
              <Radar dataKey="avg" stroke="#16a34a" fill="#16a34a" fillOpacity={0.4} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground mt-2">দুর্বল এলাকা (নিম্ন স্কোর) উন্নত করতে আরও কুইজ দিন।</p>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border p-4 overflow-x-auto">
          <h2 className="font-semibold mb-3">সম্পূর্ণ ইতিহাস ({toBn(filtered.length)})</h2>
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground border-b">
              <tr>
                <th className="py-2 pr-2">বিষয়</th>
                <th className="py-2 pr-2">তারিখ</th>
                <th className="py-2 pr-2">প্রশ্ন</th>
                <th className="py-2 pr-2">সঠিক</th>
                <th className="py-2 pr-2">ভুল</th>
                <th className="py-2 pr-2">স্কোর %</th>
                <th className="py-2 pr-2">সময়</th>
                <th className="py-2 pr-2">বিশ্লেষণ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const cat = categories?.find((c) => c.id === s.category_id);
                return (
                  <tr key={s.id} className="border-b last:border-0">
                    <td className="py-2 pr-2">{cat?.name_bn ?? "—"}</td>
                    <td className="py-2 pr-2">{s.completed_at ? new Date(s.completed_at).toLocaleDateString("en-GB") : "—"}</td>
                    <td className="py-2 pr-2">{toBn(s.total_questions ?? 0)}</td>
                    <td className="py-2 pr-2 text-green-700">{toBn(s.correct_answers ?? 0)}</td>
                    <td className="py-2 pr-2 text-red-600">{toBn(s.wrong_answers ?? 0)}</td>
                    <td className="py-2 pr-2 font-medium">{toBn(Math.round(Number(s.percentage ?? 0)))}%</td>
                    <td className="py-2 pr-2">{toBn(Math.round((s.time_taken_seconds ?? 0) / 60))} মি</td>
                    <td className="py-2 pr-2">
                      <Link to="/quiz/result/$sessionId" params={{ sessionId: s.id }} className="text-bd-green hover:underline">দেখুন</Link>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="py-6 text-center text-muted-foreground">কোনো রেকর্ড নেই</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}