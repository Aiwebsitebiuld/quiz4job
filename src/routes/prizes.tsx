import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { bnCurrency, toBn } from "@/lib/bn";
import { MoneyParticles } from "@/components/money-particles";
import { Crown, Brain, Wallet, Trophy } from "lucide-react";

export const Route = createFileRoute("/prizes")({
  head: () => ({
    meta: [
      { title: "নগদ পুরস্কার জিতুন — Quiz4Job" },
      { name: "description", content: "প্রতিমাসে ৳৩,০০০ টাকা নগদ পুরস্কার। শীর্ষ ৩ জন bKash-এ পাবেন।" },
    ],
  }),
  component: PrizesPage,
});

const BN_MONTHS = ["জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"];

function PrizesPage() {
  const { data: winners = [] } = useQuery({
    queryKey: ["past-winners"],
    queryFn: async () => {
      const { data } = await supabase
        .from("monthly_leaderboard")
        .select("id,user_id,month,year,prize_amount,profile:profiles!monthly_leaderboard_user_id_fkey(full_name,username,avatar_url)")
        .gt("prize_amount", 0)
        .order("year", { ascending: false })
        .order("month", { ascending: false })
        .limit(12);
      return data ?? [];
    },
  });

  const faqs = [
    { q: "পুরস্কার কখন দেওয়া হয়?", a: "প্রতি মাসের ৩-৫ তারিখের মধ্যে পূর্ববর্তী মাসের পুরস্কার বিতরণ করা হয়।" },
    { q: "পুরস্কার কীভাবে পাঠানো হয়?", a: "bKash বা Nagad-এর মাধ্যমে সরাসরি আপনার মোবাইল নম্বরে পাঠানো হয়।" },
    { q: "পুরস্কার পেতে কী করতে হবে?", a: "প্রিমিয়াম সদস্য হতে হবে (৳১০/মাস) এবং আমাদের Facebook পেজ লাইক করতে হবে।" },
    { q: "ফ্রি ইউজাররা কি পুরস্কার পাবে?", a: "না, শুধু প্রিমিয়াম ব্যবহারকারীরা পুরস্কার পাওয়ার যোগ্য।" },
  ];

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-400 via-gold to-amber-600 text-amber-950">
        <MoneyParticles />
        <div className="relative max-w-5xl mx-auto px-4 py-16 sm:py-24 text-center">
          <Wallet className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl sm:text-6xl font-extrabold drop-shadow">নগদ পুরস্কার জিতুন! 💰</h1>
          <p className="mt-4 text-xl sm:text-2xl font-bold">প্রতিমাসে {bnCurrency(3000)} টাকা বিতরণ হচ্ছে!</p>
          <Link to="/signup" className="inline-block mt-8 px-8 py-4 rounded-xl bg-amber-950 text-gold font-extrabold text-lg shadow-2xl hover:scale-105 transition">
            এখনই শুরু করুন →
          </Link>
        </div>
      </section>

      {/* How to win */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-extrabold text-center mb-10">কীভাবে জিতবেন?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { i: <Crown className="w-10 h-10" />, n: 1, title: "প্রিমিয়াম হন", desc: "মাত্র ৳১০/মাসে প্রিমিয়াম সদস্য হোন।", to: "/signup" },
            { i: <Brain className="w-10 h-10" />, n: 2, title: "র‍্যান্ক কুইজ দিন", desc: "প্রতিদিন কুইজ দিয়ে পয়েন্ট সংগ্রহ করুন।", to: "/quiz" },
            { i: <Wallet className="w-10 h-10" />, n: 3, title: "পুরস্কার জিতুন", desc: "মাস শেষে শীর্ষ ৩ জন bKash-এ পাবেন।", to: "/leaderboard" },
          ].map((s) => (
            <Link key={s.n} to={s.to} className="rounded-2xl border-2 border-bd-green/20 bg-white p-6 hover:border-bd-green hover:shadow-xl transition group">
              <div className="w-16 h-16 rounded-full bg-bd-green-light text-bd-green grid place-items-center mb-4 group-hover:scale-110 transition">
                {s.i}
              </div>
              <div className="text-sm font-bold text-bd-green">ধাপ {toBn(s.n)}</div>
              <h3 className="text-xl font-bold mt-1">{s.title}</h3>
              <p className="text-muted-foreground mt-2">{s.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Prize breakdown */}
      <section className="bg-gradient-to-b from-bd-green-light/30 to-transparent py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-center mb-8">পুরস্কার বিভাজন</h2>
          <div className="overflow-x-auto rounded-2xl border-2 border-gold/40 bg-white shadow-lg">
            <table className="w-full">
              <thead className="bg-gold/20">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">স্থান</th>
                  <th className="px-6 py-4 text-center font-bold">পদক</th>
                  <th className="px-6 py-4 text-right font-bold">পুরস্কার</th>
                  <th className="px-6 py-4 text-right font-bold hidden sm:table-cell">পেমেন্ট</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { p: "১ম স্থান", e: "🥇", a: 1500 },
                  { p: "২য় স্থান", e: "🥈", a: 1000 },
                  { p: "৩য় স্থান", e: "🥉", a: 500 },
                ].map((r) => (
                  <tr key={r.p} className="border-t border-border">
                    <td className="px-6 py-5 font-bold text-lg">{r.p}</td>
                    <td className="px-6 py-5 text-center text-3xl">{r.e}</td>
                    <td className="px-6 py-5 text-right font-extrabold text-2xl text-gold">{bnCurrency(r.a)}</td>
                    <td className="px-6 py-5 text-right hidden sm:table-cell text-muted-foreground">সরাসরি bKash-এ</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Past winners */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-extrabold text-center mb-8">পূর্ববর্তী বিজয়ীরা 🏆</h2>
        {winners.length === 0 ? (
          <p className="text-center text-muted-foreground">শীঘ্রই বিজয়ীদের তালিকা প্রকাশিত হবে। আপনিই হতে পারেন প্রথম!</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {winners.map((w: any) => {
              const name = w.profile?.full_name || w.profile?.username || "—";
              const initial = name.trim().charAt(0).toUpperCase();
              return (
                <div key={w.id} className="rounded-2xl bg-gradient-to-br from-amber-50 to-white border-2 border-gold/40 p-5 text-center shadow">
                  {w.profile?.avatar_url ? (
                    <img src={w.profile.avatar_url} alt={name} className="w-20 h-20 rounded-full mx-auto object-cover" />
                  ) : (
                    <div className="w-20 h-20 rounded-full mx-auto bg-bd-green text-white grid place-items-center text-2xl font-bold">{initial}</div>
                  )}
                  <div className="mt-3 font-bold text-lg">{name}</div>
                  <div className="text-2xl font-extrabold text-gold mt-1">{bnCurrency(w.prize_amount)}</div>
                  <div className="text-sm text-muted-foreground mt-1">{BN_MONTHS[w.month - 1]} {toBn(w.year)}</div>
                  <Trophy className="w-6 h-6 text-gold mx-auto mt-2" />
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-extrabold text-center mb-8">প্রায়শই জিজ্ঞাসিত প্রশ্ন</h2>
        <div className="space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="rounded-xl border border-border bg-white p-5 group">
              <summary className="font-bold cursor-pointer flex justify-between items-center">
                <span>{f.q}</span>
                <span className="text-bd-green text-2xl group-open:rotate-45 transition">+</span>
              </summary>
              <p className="mt-3 text-muted-foreground leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 pb-20">
        <Link
          to="/signup"
          className="block text-center px-8 py-6 rounded-3xl bg-gradient-to-br from-gold via-amber-400 to-amber-600 text-amber-950 font-extrabold text-2xl shadow-2xl hover:scale-[1.02] transition border-2 border-amber-300"
        >
          এখনই প্রিমিয়াম হন — মাত্র {bnCurrency(10)} 👑
        </Link>
      </section>
    </div>
  );
}
