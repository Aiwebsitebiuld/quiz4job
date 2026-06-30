import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { bnCurrency, toBn } from "@/lib/bn";
import { CountdownTimer } from "@/components/countdown-timer";
import { Crown, Check, Copy, Upload, Smartphone, ShieldCheck, Trophy } from "lucide-react";

export const Route = createFileRoute("/premium")({
  head: () => ({
    meta: [
      { title: "প্রিমিয়াম সদস্যতা — Quiz4Job" },
      { name: "description", content: "মাত্র ৳৩০/মাসে প্রিমিয়াম হয়ে নগদ পুরস্কার জেতার সুযোগ পান।" },
    ],
  }),
  component: PremiumPage,
});

const METHODS = [
  { id: "bkash", label: "bKash", tag: "সবচেয়ে সহজ", color: "bg-pink-500" },
  { id: "nagad", label: "Nagad", tag: "", color: "bg-orange-500" },
  { id: "rocket", label: "Rocket", tag: "", color: "bg-purple-600" },
] as const;

const PAY_NUMBER = "01767091490";
const PAY_NUMBER_FMT = "01767-091490";

const TIERS = [
  {
    id: "basic" as const,
    name: "Basic",
    price: 30,
    accent: "from-emerald-300 via-emerald-400 to-emerald-600",
    features: [
      "প্রতিদিন ৫টি কুইজ",
      "প্রতি কুইজে সর্বোচ্চ ৪০ প্রশ্ন",
      "র‍্যাংকড কুইজ অংশগ্রহণ",
      "মাসিক ৳৩,০০০ পুরস্কারের সুযোগ",
      "লিডারবোর্ডে স্থান",
      "বিজ্ঞাপন মুক্ত অভিজ্ঞতা",
    ],
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: 50,
    accent: "from-amber-300 via-gold to-amber-600",
    features: [
      "প্রতিদিন ১০টি কুইজ",
      "প্রতি কুইজে সর্বোচ্চ ৬০ প্রশ্ন",
      "র‍্যাংকড কুইজ অংশগ্রহণ",
      "মাসিক ৳৩,০০০ পুরস্কারের সুযোগ",
      "প্রিমিয়াম ব্যাজ + অগ্রাধিকার সাপোর্ট",
      "বিজ্ঞাপন মুক্ত অভিজ্ঞতা",
    ],
  },
];

const BN_MONTHS = ["জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"];

function formatBnDate(iso: string) {
  const d = new Date(iso);
  return `${toBn(d.getDate())} ${BN_MONTHS[d.getMonth()]} ${toBn(d.getFullYear())}`;
}

function PremiumPage() {
  const { user, profile, isPremium, loading } = useAuth();
  const navigate = useNavigate();

  const [method, setMethod] = useState<typeof METHODS[number]["id"] | null>(null);
  const [tier, setTier] = useState<"basic" | "pro">("basic");
  const [txn, setTxn] = useState("");
  const [payerNumber, setPayerNumber] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingSub, setPendingSub] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setPendingSub(data));
  }, [user, submitted]);

  const copyNumber = async () => {
    await navigator.clipboard.writeText(PAY_NUMBER);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { navigate({ to: "/login" }); return; }
    if (!method || !txn.trim() || !payerNumber.trim()) {
      setError("সব প্রয়োজনীয় ফিল্ড পূরণ করুন");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      let screenshotUrl = "";
      if (file) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("payment-screenshots")
          .upload(path, file, { upsert: false });
        if (upErr) throw upErr;
        screenshotUrl = path;
      }
      const now = new Date();
      const amount = tier === "pro" ? 50 : 30;
      const { error: insErr } = await supabase.from("subscriptions").insert({
        user_id: user.id,
        amount,
        tier,
        payment_method: method,
        transaction_id: txn.trim(),
        bkash_number: payerNumber.trim(),
        payment_screenshot_url: screenshotUrl,
        payment_month: now.getMonth() + 1,
        payment_year: now.getFullYear(),
        status: "pending",
      });
      if (insErr) throw insErr;
      await supabase.from("notifications").insert({
        user_id: user.id,
        type: "info",
        title_bn: "পেমেন্ট জমা হয়েছে",
        message_bn: "আপনার পেমেন্ট যাচাইয়ের অপেক্ষায় আছে। সাধারণত ২৪ ঘণ্টার মধ্যে সক্রিয় হয়।",
        link: "/premium",
      });
      setSubmitted(true);
      setMethod(null); setTxn(""); setPayerNumber(""); setFile(null);
    } catch (err: any) {
      setError(err.message || "সাবমিট করতে সমস্যা হয়েছে");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-background">
      {/* Prize hook banner */}
      <section className="bg-gradient-to-r from-amber-400 via-gold to-amber-500 text-amber-950">
        <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="font-bold text-base sm:text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5" /> এই মাসের পুরস্কার: {bnCurrency(3000)} টাকা অপেক্ষা করছে!
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span>মাস শেষ হতে বাকি:</span>
            <CountdownTimer />
          </div>
        </div>
      </section>

      {/* Hero */}
      <section className="bg-gradient-to-b from-bd-green to-bd-green-dark text-white">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <Crown className="w-14 h-14 mx-auto mb-3 text-gold" />
          <h1 className="text-4xl sm:text-5xl font-extrabold">প্রিমিয়াম সদস্যতা</h1>
          <h2 className="mt-3 text-xl sm:text-2xl text-white/90">৳৩০ অথবা ৳৫০/মাসে প্রিমিয়াম হোন এবং পুরস্কার জিতুন!</h2>
          <p className="mt-2 text-sm text-white/70">ফ্রি প্ল্যান: সপ্তাহে মাত্র ৫টি কুইজ, প্রতি কুইজে সর্বোচ্চ ২০ প্রশ্ন।</p>
        </div>
      </section>

      {/* Premium active state */}
      {isPremium && profile?.premium_expires_at && (
        <section className="max-w-3xl mx-auto px-4 -mt-6">
          <div className="rounded-2xl bg-green-50 border-2 border-green-400 p-6 text-center shadow">
            <div className="text-green-700 font-bold text-lg">✅ আপনি প্রিমিয়াম সদস্য</div>
            <p className="mt-1 text-green-900">মেয়াদ শেষ: {formatBnDate(profile.premium_expires_at)}</p>
            <p className="mt-3 text-sm text-green-800">পরবর্তী মাসের জন্য রিনিউ করতে নিচের ফর্ম পূরণ করুন।</p>
          </div>
        </section>
      )}

      {/* Pending state */}
      {pendingSub && !isPremium && (
        <section className="max-w-3xl mx-auto px-4 -mt-6">
          <div className="rounded-2xl bg-amber-50 border-2 border-amber-400 p-6 text-center shadow">
            <ShieldCheck className="w-10 h-10 text-amber-600 mx-auto mb-2" />
            <div className="font-bold text-amber-900">আপনার পেমেন্ট যাচাইয়ের অপেক্ষায় আছে</div>
            <p className="mt-1 text-sm text-amber-800">সাধারণত ২৪ ঘণ্টার মধ্যে সক্রিয় হয়। ট্রানজেকশন: <b>{pendingSub.transaction_id}</b></p>
          </div>
        </section>
      )}

      {/* Pricing cards */}
      <section className="max-w-5xl mx-auto px-4 mt-10 grid sm:grid-cols-2 gap-6">
        {TIERS.map((t) => {
          const selected = tier === t.id;
          return (
            <div
              key={t.id}
              onClick={() => setTier(t.id)}
              className={`rounded-3xl p-1 bg-gradient-to-br ${t.accent} shadow-xl cursor-pointer transition ${selected ? "scale-[1.02] shadow-2xl ring-2 ring-bd-green" : "opacity-90"}`}
            >
              <div className="rounded-[22px] bg-white p-6 sm:p-8 h-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-lg">
                    <Crown className={`w-5 h-5 ${t.id === "pro" ? "text-gold" : "text-emerald-600"}`} /> {t.name}
                  </div>
                  {selected && <span className="text-xs px-2 py-1 rounded-full bg-bd-green text-white font-bold">নির্বাচিত</span>}
                </div>
                <div className="mt-3">
                  <span className="text-5xl font-extrabold">{bnCurrency(t.price)}</span>
                  <span className="text-muted-foreground">/মাস</span>
                </div>
                <ul className="mt-6 space-y-2.5">
                  {t.features.map((f) => (
                    <li key={f} className="flex gap-2 text-sm">
                      <Check className="w-5 h-5 text-bd-green shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#pay"
                  onClick={() => setTier(t.id)}
                  className={`mt-6 block text-center px-6 py-3 rounded-xl text-white font-bold shadow hover:scale-[1.02] transition bg-gradient-to-r ${t.accent}`}
                >
                  {t.name} নিন — ৳{t.price}
                </a>
              </div>
            </div>
          );
        })}
      </section>

      {/* Payment */}
      <section id="pay" className="max-w-3xl mx-auto px-4 mt-12">
        <h2 className="text-2xl font-extrabold text-center">পেমেন্ট করুন</h2>
        <p className="text-center text-muted-foreground mt-1">পছন্দের পদ্ধতি বেছে নিন</p>

        {!user && (
          <div className="mt-4 rounded-xl bg-amber-50 border border-amber-300 p-4 text-center">
            পেমেন্ট জমা দিতে <Link to="/login" className="text-bd-green font-bold underline">লগ ইন</Link> করুন।
          </div>
        )}

        <div className="grid sm:grid-cols-3 gap-3 mt-6">
          {METHODS.map((m) => {
            const active = method === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`rounded-2xl border-2 p-4 text-left transition ${active ? "border-bd-green bg-bd-green-light/40 shadow-lg" : "border-border bg-white hover:border-bd-green/50"}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg grid place-items-center text-white ${m.color}`}>
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold">{m.label}</div>
                    {m.tag && <div className="text-xs text-bd-green font-semibold">{m.tag}</div>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {method && (
          <>
            <div className="mt-8 rounded-2xl bg-white border border-border p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4">{METHODS.find(m => m.id === method)!.label} দিয়ে পেমেন্ট</h3>

              <div className="rounded-xl bg-bd-green-light/40 border-2 border-dashed border-bd-green p-5 flex items-center justify-between gap-4 mb-5">
                <div>
                  <div className="text-xs font-semibold text-bd-green-dark uppercase tracking-wide">আমাদের নম্বর</div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-bd-green-dark tabular-nums">{PAY_NUMBER_FMT}</div>
                </div>
                <button
                  onClick={copyNumber}
                  className="px-4 py-2 rounded-lg bg-bd-green text-white font-semibold text-sm flex items-center gap-2 hover:bg-bd-green-dark"
                >
                  <Copy className="w-4 h-4" /> {copied ? "কপি হয়েছে!" : "কপি করুন"}
                </button>
              </div>

              <ol className="space-y-3 text-sm">
                {[
                  `আপনার ${METHODS.find(m => m.id === method)!.label} অ্যাপ অথবা *247# ডায়াল করুন`,
                  `Send Money → ${PAY_NUMBER_FMT} নম্বরে ${bnCurrency(tier === "pro" ? 50 : 30)} পাঠান (${tier === "pro" ? "Pro" : "Basic"} প্ল্যান)`,
                  `Reference-এ আপনার ইমেইল বা ইউজারনেম লিখুন`,
                  `ট্রানজেকশন ID কপি করে নিচের ফর্মে দিন`,
                ].map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="w-7 h-7 rounded-full bg-bd-green text-white grid place-items-center font-bold shrink-0">{toBn(i + 1)}</span>
                    <span className="pt-1">{s}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Verification form */}
            <form onSubmit={onSubmit} className="mt-6 rounded-2xl bg-white border border-border p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-lg">পেমেন্ট যাচাই ফর্ম</h3>

              <div>
                <label className="text-sm font-semibold">পেমেন্ট পদ্ধতি</label>
                <input
                  value={METHODS.find(m => m.id === method)!.label}
                  readOnly
                  className="mt-1 w-full px-3 py-2.5 rounded-lg border border-border bg-muted/50"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">ট্রানজেকশন ID <span className="text-red-500">*</span></label>
                <input
                  value={txn}
                  onChange={(e) => setTxn(e.target.value)}
                  required
                  maxLength={50}
                  placeholder="যেমন: 9XJ7K2L3M"
                  className="mt-1 w-full px-3 py-2.5 rounded-lg border border-border focus:border-bd-green focus:outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">পেমেন্ট করা নম্বর <span className="text-red-500">*</span></label>
                <input
                  value={payerNumber}
                  onChange={(e) => setPayerNumber(e.target.value)}
                  required
                  maxLength={20}
                  inputMode="tel"
                  placeholder="যেমন: 01XXXXXXXXX"
                  className="mt-1 w-full px-3 py-2.5 rounded-lg border border-border focus:border-bd-green focus:outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-semibold flex items-center gap-2"><Upload className="w-4 h-4" /> পেমেন্ট স্ক্রিনশট (ঐচ্ছিক)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="mt-1 w-full text-sm file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-bd-green-light file:text-bd-green-dark file:font-semibold"
                />
                {file && <div className="text-xs text-muted-foreground mt-1">{file.name}</div>}
              </div>

              {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>}
              {submitted && (
                <div className="text-sm text-green-800 bg-green-50 border border-green-300 rounded-lg p-3">
                  ✅ আপনার পেমেন্ট জমা হয়েছে। সাধারণত ২৪ ঘণ্টার মধ্যে সক্রিয় হয়।
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !user || loading}
                className="w-full px-6 py-3 rounded-xl bg-bd-green text-white font-bold hover:bg-bd-green-dark disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "জমা হচ্ছে…" : "সাবমিট করুন"}
              </button>
            </form>
          </>
        )}
      </section>

      <div className="h-16" />
    </div>
  );
}
