import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  full_name: string;
  username: string | null;
  email: string | null;
  avatar_url: string | null;
  district: string | null;
  is_premium: boolean;
  premium_expires_at: string | null;
  premium_tier: "free" | "basic" | "pro";
  free_quizzes_today: number;
  free_quota_reset_date: string | null;
  free_quizzes_week: number;
  free_week_reset_date: string | null;
  facebook_liked: boolean;
  role: "user" | "admin" | "moderator";
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadProfile = async (uid: string, email: string | null) => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url, district, is_premium, premium_expires_at, premium_tier, free_quizzes_today, free_quota_reset_date, free_quizzes_week, free_week_reset_date, facebook_liked, role")
        .eq("id", uid)
        .maybeSingle();
      if (!active) return;
      if (error) {
        console.error("loadProfile error", error);
        setProfile(null);
        return;
      }
      setProfile(data ? ({ ...(data as object), email } as Profile) : null);
    };

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      const u = data.session?.user ?? null;
      setUser(u);
      if (u) await loadProfile(u.id, u.email ?? null);
      if (!active) return;
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        setLoading(true);
        setTimeout(async () => {
          await loadProfile(u.id, u.email ?? null);
          if (active) setLoading(false);
        }, 0);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const isPremium = !!(
    profile?.is_premium &&
    profile?.premium_expires_at &&
    new Date(profile.premium_expires_at).getTime() > Date.now()
  );

  return { user, profile, loading, isPremium, isAdmin: profile?.role === "admin" };
}