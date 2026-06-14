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
  free_quizzes_today: number;
  free_quota_reset_date: string | null;
  facebook_liked: boolean;
  role: "user" | "admin" | "moderator";
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadProfile = async (uid: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, username, email, avatar_url, district, is_premium, premium_expires_at, free_quizzes_today, free_quota_reset_date, facebook_liked, role")
        .eq("id", uid)
        .maybeSingle();
      if (active) setProfile((data as Profile | null) ?? null);
    };

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const u = data.session?.user ?? null;
      setUser(u);
      if (u) loadProfile(u.id);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        setTimeout(() => loadProfile(u.id), 0);
      } else {
        setProfile(null);
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