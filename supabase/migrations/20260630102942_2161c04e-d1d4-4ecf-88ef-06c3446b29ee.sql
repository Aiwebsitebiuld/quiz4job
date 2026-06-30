
-- Add premium tier + weekly free quota tracking
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS premium_tier text NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS free_quizzes_week integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS free_week_reset_date date NOT NULL DEFAULT current_date;

-- Backfill tier for existing premium users
UPDATE public.profiles SET premium_tier = 'basic'
  WHERE is_premium = true AND premium_tier = 'free';

-- Add tier to subscriptions so admins/users know what they paid for
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS tier text NOT NULL DEFAULT 'basic';

UPDATE public.subscriptions SET tier = CASE
  WHEN amount >= 50 THEN 'pro'
  WHEN amount >= 30 THEN 'basic'
  ELSE 'basic'
END WHERE tier = 'basic';

-- Replace can_take_quiz to handle three tiers with proper buckets.
-- Returns jsonb { allowed, remaining, max_questions, tier, period }
CREATE OR REPLACE FUNCTION public.quiz_quota(user_uuid uuid DEFAULT auth.uid())
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tier text;
  v_is_prem boolean;
  v_expires timestamptz;
  v_today integer;
  v_today_reset date;
  v_week integer;
  v_week_reset date;
  v_limit integer;
  v_max_q integer;
  v_used integer;
  v_period text;
  v_week_start date := date_trunc('week', current_date)::date;
BEGIN
  SELECT premium_tier, is_premium, premium_expires_at,
         free_quizzes_today, free_quota_reset_date,
         free_quizzes_week, free_week_reset_date
    INTO v_tier, v_is_prem, v_expires,
         v_today, v_today_reset,
         v_week, v_week_reset
  FROM profiles WHERE id = user_uuid;

  -- Expire premium if past expiry
  IF v_is_prem AND v_expires IS NOT NULL AND v_expires < now() THEN
    UPDATE profiles SET is_premium = false, premium_tier = 'free' WHERE id = user_uuid;
    v_tier := 'free'; v_is_prem := false;
  END IF;

  IF v_tier = 'pro' AND v_is_prem THEN
    v_limit := 10; v_max_q := 60; v_period := 'day';
  ELSIF v_tier = 'basic' AND v_is_prem THEN
    v_limit := 5; v_max_q := 40; v_period := 'day';
  ELSE
    v_tier := 'free'; v_limit := 5; v_max_q := 20; v_period := 'week';
  END IF;

  IF v_period = 'day' THEN
    IF v_today_reset < current_date THEN
      UPDATE profiles SET free_quizzes_today = 0, free_quota_reset_date = current_date WHERE id = user_uuid;
      v_used := 0;
    ELSE
      v_used := COALESCE(v_today, 0);
    END IF;
  ELSE
    IF v_week_reset < v_week_start THEN
      UPDATE profiles SET free_quizzes_week = 0, free_week_reset_date = v_week_start WHERE id = user_uuid;
      v_used := 0;
    ELSE
      v_used := COALESCE(v_week, 0);
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'allowed', v_used < v_limit,
    'remaining', GREATEST(v_limit - v_used, 0),
    'limit', v_limit,
    'max_questions', v_max_q,
    'tier', v_tier,
    'period', v_period,
    'used', v_used
  );
END; $$;

GRANT EXECUTE ON FUNCTION public.quiz_quota(uuid) TO authenticated;

-- Keep can_take_quiz aligned with new tiers
CREATE OR REPLACE FUNCTION public.can_take_quiz(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$ SELECT (public.quiz_quota(user_uuid)->>'allowed')::boolean; $$;

-- Atomic counter increment used after a session is created
CREATE OR REPLACE FUNCTION public.increment_quiz_quota(user_uuid uuid DEFAULT auth.uid())
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tier text; v_is_prem boolean;
BEGIN
  SELECT premium_tier, is_premium INTO v_tier, v_is_prem FROM profiles WHERE id = user_uuid;
  IF v_is_prem AND v_tier IN ('basic','pro') THEN
    UPDATE profiles SET free_quizzes_today = COALESCE(free_quizzes_today,0) + 1 WHERE id = user_uuid;
  ELSE
    UPDATE profiles SET free_quizzes_week = COALESCE(free_quizzes_week,0) + 1 WHERE id = user_uuid;
  END IF;
END; $$;

GRANT EXECUTE ON FUNCTION public.increment_quiz_quota(uuid) TO authenticated;
