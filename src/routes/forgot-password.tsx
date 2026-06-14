import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AuthHero } from "@/components/auth-hero";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, MailCheck } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "পাসওয়ার্ড রিসেট — Quiz4Job" }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });
    setLoading(false);
    if (error) return setError(error.message);
    setSent(true);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      <div className="hidden lg:block"><AuthHero /></div>
      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Link to="/login" className="text-sm text-muted-foreground hover:text-bd-green">← লগ ইন পেজ</Link>
          {sent ? (
            <div className="mt-8 text-center">
              <MailCheck className="w-14 h-14 text-bd-green mx-auto" />
              <h2 className="mt-4 text-2xl font-extrabold">ইমেইল পাঠানো হয়েছে</h2>
              <p className="mt-2 text-sm text-muted-foreground">{email}-এ পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে।</p>
            </div>
          ) : (
            <>
              <h1 className="mt-6 text-3xl font-extrabold">পাসওয়ার্ড ভুলে গেছেন?</h1>
              <p className="mt-1 text-sm text-muted-foreground">ইমেইল দিন, রিসেট লিংক পাঠাবো।</p>
              <form onSubmit={onSubmit} className="mt-8 space-y-4">
                {error && <div className="rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm px-3 py-2">{error}</div>}
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-input bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-bd-green/40 focus:border-bd-green"
                  placeholder="you@example.com"
                />
                <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-bd-green text-white font-bold py-2.5 hover:bg-bd-green-dark transition disabled:opacity-60">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />} রিসেট লিংক পাঠান
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}