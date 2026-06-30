
-- Add email_verified flag to profiles; existing users default verified=true so they're not locked out, new users default false.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT false;

-- Existing users get grandfathered as verified
UPDATE public.profiles SET email_verified = true WHERE created_at < now();

-- Update handle_new_user so new accounts start with email_verified=false
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_role text := 'user';
BEGIN
  IF new.email = 'seoexpertmaznur@gmail.com' THEN
    v_role := 'admin';
  END IF;
  INSERT INTO profiles (id, full_name, email, username, role, email_verified) VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name',''),
    coalesce(new.email,''),
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    v_role,
    false
  );
  RETURN new;
END; $function$;

-- Grant read of the new column to anon (matches existing anon SELECT scope on profiles)
GRANT SELECT (email_verified) ON public.profiles TO anon;

-- Block quiz quota when verification overdue (>2 days unverified)
CREATE OR REPLACE FUNCTION public.quiz_quota(user_uuid uuid DEFAULT auth.uid())
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  v_email_verified boolean;
  v_created timestamptz;
BEGIN
  SELECT premium_tier, is_premium, premium_expires_at,
         free_quizzes_today, free_quota_reset_date,
         free_quizzes_week, free_week_reset_date,
         email_verified, created_at
    INTO v_tier, v_is_prem, v_expires,
         v_today, v_today_reset,
         v_week, v_week_reset,
         v_email_verified, v_created
  FROM profiles WHERE id = user_uuid;

  -- Verification grace: after 2 days, block until verified
  IF NOT COALESCE(v_email_verified, false) AND v_created < now() - interval '2 days' THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'remaining', 0,
      'limit', 0,
      'max_questions', 0,
      'tier', COALESCE(v_tier,'free'),
      'period', 'week',
      'used', 0,
      'reason', 'email_verification_required'
    );
  END IF;

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
    IF v_week_reset IS NULL OR v_week_reset < v_week_start THEN
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
END; $function$;
