import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toBn, bnCurrency } from "@/lib/bn";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";

export const Route = createFileRoute("/admin/dashboard")({ component: Dashboard });

function Dashboard() {
  const [stats, setStats] = useState({ users: 0, premium: 0, todayQuiz: 0, pendingPay: 0, revenue: 0 });
  const [signups, setSignups] = useState<{ d: string; n: number }[]>([]);
  const [quizPerDay, setQuizPerDay] = useState<{ d: string; n: number }[]>([]);
  const [revenue, setRevenue] = useState<{ d: string; n: number }[]>([]);

  useEffect(() => {
    (async () => {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const todayIso = today.toISOString();
      const start = new Date(); start.setDate(start.getDate() - 13); start.setHours(0,0,0,0);
      const startIso = start.toISOString();

      const [u, p, tq, pp, rev, su, qs, rv] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_premium", true),
        supabase.from("quiz_sessions").select("id", { count: "exact", head: true }).gte("created_at", todayIso),
        supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("subscriptions").select("amount").eq("status", "verified"),
        supabase.from("profiles").select("created_at").gte("created_at", startIso),
        supabase.from("quiz_sessions").select("created_at").gte("created_at", startIso),
        supabase.from("subscriptions").select("amount,created_at").eq("status", "verified").gte("created_at", startIso),
      ]);

      const totalRev = (rev.data ?? []).reduce((s, r: any) => s + (r.amount ?? 0), 0);
      setStats({
        users: u.count ?? 0, premium: p.count ?? 0, todayQuiz: tq.count ?? 0,
        pendingPay: pp.count ?? 0, revenue: totalRev,
      });

      const bucket = (rows: any[] | null, field = "created_at") => {
        const map: Record<string, number> = {};
        for (let i = 13; i >= 0; i--) {
          const d = new Date(); d.setDate(d.getDate() - i);
          map[d.toISOString().slice(0, 10)] = 0;
        }
        (rows ?? []).forEach((r) => {
          const k = (r[field] as string).slice(0, 10);
          if (k in map) map[k]++;
        });
        return Object.entries(map).map(([d, n]) => ({ d: d.slice(5), n }));
      };
      const bucketSum = (rows: any[] | null) => {
        const map: Record<string, number> = {};
        for (let i = 13; i >= 0; i--) {
          const d = new Date(); d.setDate(d.getDate() - i);
          map[d.toISOString().slice(0, 10)] = 0;
        }
        (rows ?? []).forEach((r) => {
          const k = (r.created_at as string).slice(0, 10);
          if (k in map) map[k] += r.amount ?? 0;
        });
        return Object.entries(map).map(([d, n]) => ({ d: d.slice(5), n }));
      };
      setSignups(bucket(su.data));
      setQuizPerDay(bucket(qs.data));
      setRevenue(bucketSum(rv.data));
    })();
  }, []);

  const pieData = [
    { name: "প্রিমিয়াম", value: stats.premium },
    { name: "ফ্রি", value: Math.max(0, stats.users - stats.premium) },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ড্যাশবোর্ড</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Stat title="মোট ব্যবহারকারী" value={toBn(stats.users)} />
        <Stat title="প্রিমিয়াম সদস্য" value={toBn(stats.premium)} />
        <Stat title="আজকের কুইজ" value={toBn(stats.todayQuiz)} />
        <Stat title="অপেক্ষামাণ পেমেন্ট" value={toBn(stats.pendingPay)} highlight />
        <Stat title="মোট রাজস্ব" value={bnCurrency(stats.revenue)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="দৈনিক সাইনআপ">
          <LineChart data={signups}><XAxis dataKey="d" /><YAxis /><Tooltip /><Line type="monotone" dataKey="n" stroke="#16a34a" /></LineChart>
        </ChartCard>
        <ChartCard title="প্রতিদিনের কুইজ">
          <BarChart data={quizPerDay}><XAxis dataKey="d" /><YAxis /><Tooltip /><Bar dataKey="n" fill="#0ea5e9" /></BarChart>
        </ChartCard>
        <ChartCard title="প্রিমিয়াম বনাম ফ্রি">
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80} label>
              <Cell fill="#eab308" /><Cell fill="#94a3b8" />
            </Pie>
            <Legend /><Tooltip />
          </PieChart>
        </ChartCard>
        <ChartCard title="রাজস্ব ট্রেন্ড (১৪ দিন)">
          <LineChart data={revenue}><XAxis dataKey="d" /><YAxis /><Tooltip /><Line type="monotone" dataKey="n" stroke="#eab308" /></LineChart>
        </ChartCard>
      </div>

      <Card className="p-4">
        <h2 className="font-semibold mb-3">দ্রুত ক্রিয়া</h2>
        <div className="flex flex-wrap gap-2">
          <Button asChild><Link to="/admin/subscriptions">পেমেন্ট যাচাই করুন</Link></Button>
          <Button asChild variant="secondary"><Link to="/admin/questions/new">প্রশ্ন যোগ করুন</Link></Button>
          <Button asChild variant="secondary"><Link to="/admin/jobs">চাকরি যোগ করুন</Link></Button>
          <Button asChild variant="secondary"><Link to="/admin/leaderboard">পুরস্কার বিতরণ করুন</Link></Button>
        </div>
      </Card>
    </div>
  );
}

function Stat({ title, value, highlight }: { title: string; value: string; highlight?: boolean }) {
  return (
    <Card className="p-4">
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className={`text-2xl font-bold mt-1 ${highlight ? "text-red-600" : ""}`}>{value}</div>
    </Card>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactElement }) {
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-2">{title}</h3>
      <div className="h-64"><ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer></div>
    </Card>
  );
}