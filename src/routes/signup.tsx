import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AuthHero } from "@/components/auth-hero";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { DISTRICTS_BD } from "@/lib/districts";
import { Loader2, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "নিবন্ধন করুন — Quiz4Job" },
      { name: "description", content: "Quiz4Job-এ ফ্রি অ্যাকাউন্ট তৈরি করুন। দৈনিক ৫টি কুইজ ফ্রি।" },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [district, setDistrict] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) return setError("পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে");
    if (password !== confirm) return setError("পাসওয়ার্ড মিলছে না");

    setLoading(true);
    const { data, error: signErr } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + "/dashboard",
        data: { full_name: fullName, username },
      },
    });
    if (signErr) {
      setLoading(false);
      return setError(signErr.message);
    }

    // Update district on profile (trigger created the row)
    if (data.user && district) {
      await supabase.from("profiles").update({ district, username }).eq("id", data.user.id);
    }

    setLoading(false);
    if (data.session) {
      window.location.href = "/dashboard";
    } else {
      // auto-confirm should yield a session; fall back to login if not
      window.location.href = "/login";
    }
  };

  const onGoogle = async () => {
    setError(null);
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (res.error) setError("Google সাইন-আপ ব্যর্থ হয়েছে");
  };

  if (done) {
    return (
      <div className="min-h-screen grid lg:grid-cols-2 bg-white">
        <div className="hidden lg:block"><AuthHero /></div>
        <div className="flex items-center justify-center p-8">
          <div className="max-w-md text-center">
            <CheckCircle2 className="w-14 h-14 text-bd-green mx-auto" />
            <h2 className="mt-4 text-2xl font-extrabold">ইমেইল চেক করুন</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {email}-এ একটি ভেরিফিকেশন লিংক পাঠানো হয়েছে। লিংকে ক্লিক করে অ্যাকাউন্ট সক্রিয় করুন।
            </p>
            <Link to="/login" className="mt-6 inline-flex px-4 py-2 rounded-lg bg-bd-green text-white text-sm font-bold">লগ ইন পেজে যান</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      <div className="hidden lg:block"><AuthHero /></div>
      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Link to="/" className="text-sm text-muted-foreground hover:text-bd-green">← হোম পেজ</Link>
          <h1 className="mt-6 text-3xl font-extrabold text-foreground">নতুন অ্যাকাউন্ট তৈরি করুন</h1>
          <p className="mt-1 text-sm text-muted-foreground">ফ্রি — দৈনিক ৫টি কুইজ পান</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-3.5">
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm px-3 py-2">{error}</div>
            )}

            <Field label="পুরো নাম *">
              <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} placeholder="আপনার পুরো নাম" />
            </Field>

            <div className="grid sm:grid-cols-2 gap-3.5">
              <Field label="ইউজারনেম *">
                <input required value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())} className={inputCls} placeholder="username" pattern="[a-z0-9_]{3,20}" />
              </Field>
              <Field label="জেলা">
                <select value={district} onChange={(e) => setDistrict(e.target.value)} className={inputCls}>
                  <option value="">নির্বাচন করুন</option>
                  {DISTRICTS_BD.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
            </div>

            <Field label="ইমেইল *">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="you@example.com" autoComplete="email" />
            </Field>

            <div className="grid sm:grid-cols-2 gap-3.5">
              <Field label="পাসওয়ার্ড *">
                <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="৬+ অক্ষর" autoComplete="new-password" />
              </Field>
              <Field label="নিশ্চিত করুন *">
                <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputCls} placeholder="••••••••" autoComplete="new-password" />
              </Field>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-bd-green text-white font-bold py-2.5 hover:bg-bd-green-dark transition disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />} অ্যাকাউন্ট তৈরি করুন
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px bg-border flex-1" /> অথবা <div className="h-px bg-border flex-1" />
          </div>

          <button
            onClick={onGoogle}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-white py-2.5 text-sm font-semibold hover:bg-muted transition"
          >
            <GoogleIcon /> Google দিয়ে সাইন আপ
          </button>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
            <Link to="/login" className="text-bd-green font-semibold hover:underline">লগ ইন করুন</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-input bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-bd-green/40 focus:border-bd-green";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.12A6.98 6.98 0 0 1 5.48 12c0-.74.13-1.46.36-2.12V7.04H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.96l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.07.56 4.21 1.65l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  );
}