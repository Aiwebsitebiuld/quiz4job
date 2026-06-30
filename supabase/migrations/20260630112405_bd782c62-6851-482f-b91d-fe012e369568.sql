GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT (id, full_name, username, avatar_url, district, is_premium, premium_tier) ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;