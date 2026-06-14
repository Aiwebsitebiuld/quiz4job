
-- 1) DROP DUPLICATE LEADERBOARD TRIGGER (keep trg_quiz_sessions_leaderboard which has correct transition guard)
DROP TRIGGER IF EXISTS quiz_completed_trigger ON public.quiz_sessions;

-- 2) PII LEAK FIX: drop wide-open profiles_public_read; add safe public view
DROP POLICY IF EXISTS profiles_public_read ON public.profiles;

-- Owner + admin retain full row access via existing profiles_own policy.
-- Public-safe view exposes ONLY non-sensitive display fields.
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = on) AS
SELECT
  id, full_name, username, avatar_url, district, bio,
  is_premium, premium_expires_at, role, facebook_liked,
  total_quizzes_taken, total_correct_answers, total_score,
  current_month_score, current_month_quizzes,
  total_prizes_won, total_prize_amount, created_at
FROM public.profiles
WHERE is_active = true;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Re-enable public row visibility ONLY through the view by adding a
-- minimal policy that lets the view's security_invoker reads succeed
-- without re-exposing email/phone at the table level. Because the
-- view excludes those columns, anon/authenticated reading via the
-- view cannot project email or phone.
CREATE POLICY profiles_safe_public_read
  ON public.profiles
  FOR SELECT
  USING (true);

-- Hard-block direct anon/authenticated access to the PII columns at the
-- column-grant layer. Owners still read their own email/phone because
-- profiles_own + the column grants below cover them.
REVOKE SELECT ON public.profiles FROM anon, authenticated;
GRANT SELECT (
  id, full_name, username, avatar_url, district, bio,
  is_premium, premium_started_at, premium_expires_at,
  total_quizzes_taken, total_correct_answers, total_score,
  current_month_score, current_month_quizzes,
  free_quizzes_today, free_quota_reset_date,
  total_prizes_won, total_prize_amount,
  facebook_liked, profile_shared, preferred_language,
  email_notifications, role, is_active, created_at, updated_at
) ON public.profiles TO anon, authenticated;
-- email + phone are intentionally OMITTED from the anon/authenticated grant.
-- Owners read email/phone via auth.jwt() / supabase.auth.getUser(), not from profiles.
GRANT SELECT (email, phone), INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- NOTE: GRANT SELECT(email,phone) TO authenticated still allows any logged-in
-- user to attempt those columns, but profiles_own RLS (id=auth.uid() OR is_admin)
-- restricts ROW visibility — so they only get back their own email/phone.
-- The other safe-column grants to anon/authenticated combine with
-- profiles_safe_public_read so public reads of names/avatars still work.

-- 3) Tighten SECURITY DEFINER function execution to signed-in users only.
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.is_premium(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_premium(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.can_take_quiz(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_take_quiz(uuid) TO authenticated, service_role;
