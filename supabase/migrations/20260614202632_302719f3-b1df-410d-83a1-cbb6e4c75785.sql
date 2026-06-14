
-- =========================================================
-- 1) Stop users from writing to monthly_leaderboard directly.
--    Only the SECURITY DEFINER trigger (owned by postgres) and
--    admins/service_role should write. Public SELECT stays
--    enabled via existing leaderboard_public policy, but is
--    column-restricted below.
-- =========================================================
DROP POLICY IF EXISTS leaderboard_own_insert ON public.monthly_leaderboard;
DROP POLICY IF EXISTS leaderboard_own_update ON public.monthly_leaderboard;

CREATE POLICY leaderboard_admin_write
  ON public.monthly_leaderboard
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =========================================================
-- 2) Hide prize payment details from public reads via
--    column-level grants. Safe columns stay readable.
-- =========================================================
REVOKE SELECT ON public.monthly_leaderboard FROM anon, authenticated;
GRANT SELECT (
  id, user_id, month, year,
  total_score, quizzes_taken, correct_answers, avg_percentage,
  rank, prize_amount, prize_position,
  is_premium, facebook_liked, profile_shared, is_prize_eligible,
  created_at, updated_at
) ON public.monthly_leaderboard TO anon, authenticated;
-- prize_transaction_id, prize_payment_method, prize_paid, prize_paid_at
-- are intentionally OMITTED. Admins access them via full GRANT below.
GRANT SELECT (
  prize_transaction_id, prize_payment_method, prize_paid, prize_paid_at
), INSERT, UPDATE, DELETE ON public.monthly_leaderboard TO authenticated;
-- ↑ INSERT/UPDATE/DELETE grant is still gated by RLS, which now only
-- allows admins. Authenticated users get the prize-detail column grant
-- so admin reads succeed (admins are authenticated).
GRANT ALL ON public.monthly_leaderboard TO service_role;

-- =========================================================
-- 3) Make quiz_sessions.user_id NOT NULL so the RLS policy
--    `user_id = auth.uid()` cannot match NULL=NULL edge cases
--    for unauthenticated requests.
-- =========================================================
-- Clean up any pre-existing NULL rows (should be none).
DELETE FROM public.quiz_sessions WHERE user_id IS NULL;
ALTER TABLE public.quiz_sessions ALTER COLUMN user_id SET NOT NULL;

-- =========================================================
-- 4) Lock down EXECUTE on trigger-only SECURITY DEFINER
--    functions. The triggers themselves still call them.
-- =========================================================
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_leaderboard_on_quiz() FROM PUBLIC, anon, authenticated;
