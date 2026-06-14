import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AuthHero } from "@/components/auth-hero";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "লগ ইন — Quiz4Job" },
      { name: "description", content: "Quiz4Job-এ লগ ইন করুন। কুইজ দিন, চাকরি পান, পুরস্কার জিতুন।" },
    ],
  }),
  component: LoginPage,
});

async function routeByRole() {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return;
  const { data: p } = await supabase.from("profiles").select("role").eq("id", u.user.id).maybeSingle();
  const role = (p as { role?: string } | null)?.role;
  window.location.href = role === "admin" ? "/admin/dashboard" : "/dashboard";
}

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message === "Invalid login credentials" ? "ভুল ইমেইল বা পাসওয়ার্ড" : error.message);
      return;
    }
    await routeByRole();
  };

  const onGoogle = async () => {
    setError(null);
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (res.error) setError("Google সাইন-ইন ব্যর্থ হয়েছে");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      <div className="hidden lg:block"><AuthHero /></div>
      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Link to="/" className="text-sm text-muted-foreground hover:text-bd-green">← হোম পেজ</Link>
          <h1 className="mt-6 text-3xl font-extrabold text-foreground">লগ ইন করুন</h1>
          <p className="mt-1 text-sm text-muted-foreground">আপনার Quiz4Job অ্যাকাউন্টে প্রবেশ করুন</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm px-3 py-2">{error}</div>
            )}
            <div>
              <label className="block text-sm font-semibold mb-1.5">ইমেইল *</label>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-input bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-bd-green/40 focus:border-bd-green"
                placeholder="you@example.com" autoComplete="email"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold">পাসওয়ার্ড *</label>
                <Link to="/forgot-password" className="text-xs text-bd-green hover:underline">পাসওয়ার্ড ভুলে গেছেন?</Link>
              </div>
              <input
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-input bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-bd-green/40 focus:border-bd-green"
                placeholder="••••••••" autoComplete="current-password"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-bd-green text-white font-bold py-2.5 hover:bg-bd-green-dark transition disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />} লগ ইন করুন
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px bg-border flex-1" /> অথবা <div className="h-px bg-border flex-1" />
          </div>

          <button
            onClick={onGoogle}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-white py-2.5 text-sm font-semibold hover:bg-muted transition"
          >
            <GoogleIcon /> Google দিয়ে লগ ইন
          </button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            নতুন এখানে?{" "}
            <Link to="/signup" className="text-bd-green font-semibold hover:underline">নতুন অ্যাকাউন্ট তৈরি করুন</Link>
          </p>
        </div>
      </div>
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