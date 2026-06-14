-- Promote specific admin email to admin role on signup (idempotent trigger update)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_role text := 'user';
BEGIN
  IF new.email = 'seoexpertmaznur@gmail.com' THEN
    v_role := 'admin';
  END IF;
  INSERT INTO profiles (id, full_name, email, username, role) VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name',''),
    coalesce(new.email,''),
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    v_role
  );
  RETURN new;
END; $$;

-- Promote if already exists
UPDATE public.profiles SET role = 'admin' WHERE email = 'seoexpertmaznur@gmail.com';

-- Seed default site settings if missing
INSERT INTO public.site_settings (setting_key, setting_value) VALUES
  ('app_name', 'Quiz4Job'),
  ('app_tagline', 'কুইজ দিন, চাকরি পান, পুরস্কার জিতুন!'),
  ('facebook_url', 'https://facebook.com/quiz4job'),
  ('youtube_url', ''),
  ('prize_first', '1500'),
  ('prize_second', '1000'),
  ('prize_third', '500'),
  ('bkash_number', '01XXXXXXXXX'),
  ('nagad_number', '01XXXXXXXXX'),
  ('free_daily_limit', '5'),
  ('min_quizzes_for_prize', '20')
ON CONFLICT (setting_key) DO NOTHING;