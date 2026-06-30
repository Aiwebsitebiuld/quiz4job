import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { CheckCircle2, Mail, Loader2, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/verify-email")({
  head: () => ({
    meta: [
      { title: "ইমেইল ভেরিফাই করুন — Quiz4Job" },
      { name: "description", content: "আপনার ইমেইল ঠিকানা ভেরিফাই করুন এবং কুইজ চালিয়ে যান।" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { user, profile, loading } = useAuth();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [marking, setMarking] = useState(false);
  const [verified, setVerified] = useState(false);

  const overdue =
    !!profile?.created_at &&
    !profile.email_verified &&
    Date.now() - new Date(profile.created_at).getTime() > 2 * 24 * 60 * 60 * 1000;

  useEffect(() => {
    // If user lands here after clicking magic link (?confirmed=1) and is signed in, mark verified.
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("confirmed") !== "1") return;
    if (!user || !profile || profile.email_verified || marking) return;
    setMarking(true);
    supabase
      .from("profiles")
      .update({ email_verified: true })
      .eq("id", user.id)
      .then(({ error: e }) => {
        if (e) setError(e.message);
        else setVerified(true);
        setMarking(false);
      });
  }, [user, profile, marking]);

  const sendLink = async () => {
    if (!user?.email) return;
    setError(null);
    setSending(true);
    const { error: e } = await supabase.auth.signInWithOtp({
      email: user.email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: window.location.origin + "/verify-email?confirmed=1",
      },
    });
    setSending(false);
    if (e) setError(e.message);
    else setSent(true);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <Loader2 className="w-6 h-6 animate-spin text-bd-green" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-extrabold">প্রথমে লগ ইন করুন</h1>
        <Link to="/login" className="mt-4 inline-flex px-4 py-2 rounded-lg bg-bd-green text-white font-bold">লগ ইন</Link>
      </div>
    );
  }

  if (profile?.email_verified || verified) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <CheckCircle2 className="w-14 h-14 text-bd-green mx-auto" />
        <h1 className="mt-4 text-2xl font-extrabold">ইমেইল ভেরিফাইড ✅</h1>
        <p className="mt-2 text-sm text-muted-foreground">ধন্যবাদ! এখন আপনি সব কুইজ ও ফিচার ব্যবহার করতে পারবেন।</p>
        <Link to="/dashboard" className="mt-6 inline-flex px-4 py-2 rounded-lg bg-bd-green text-white font-bold">ড্যাশবোর্ডে যান</Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="rounded-2xl border border-border bg-white p-6 sm:p-8 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-bd-green/10 text-bd-green grid place-items-center mb-4">
          <Mail className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold">ইমেইল ভেরিফাই করুন</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          আপনার ইমেইল <span className="font-semibold text-foreground">{user.email}</span>-এ একটি ভেরিফিকেশন লিংক পাঠানো হবে। লিংকে ক্লিক করে অ্যাকাউন্ট ভেরিফাই করুন।
        </p>

        {overdue && (
          <div className="mt-4 rounded-lg bg-orange-50 border border-orange-200 text-orange-900 text-sm px-3 py-2 flex gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>২ দিনের গ্রেস পিরিয়ড শেষ। ভেরিফাই না করা পর্যন্ত কুইজ দেওয়া বন্ধ থাকবে।</span>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm px-3 py-2">{error}</div>
        )}

        {sent ? (
          <div className="mt-5 rounded-lg bg-bd-green/10 border border-bd-green/30 text-bd-green-dark text-sm px-3 py-3">
            ✉️ লিংক পাঠানো হয়েছে। ইনবক্স/স্প্যাম ফোল্ডার চেক করুন।
            <button onClick={sendLink} disabled={sending} className="ml-2 underline font-semibold">আবার পাঠান</button>
          </div>
        ) : (
          <button
            onClick={sendLink}
            disabled={sending}
            className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-bd-green text-white font-bold py-2.5 hover:bg-bd-green-dark transition disabled:opacity-60"
          >
            {sending && <Loader2 className="w-4 h-4 animate-spin" />} ভেরিফিকেশন লিংক পাঠান
          </button>
        )}

        <p className="mt-4 text-xs text-muted-foreground text-center">
          ইমেইল পাল্টাতে চান? <Link to="/profile" className="text-bd-green underline">প্রোফাইলে যান</Link>
        </p>
      </div>
    </div>
  );
}