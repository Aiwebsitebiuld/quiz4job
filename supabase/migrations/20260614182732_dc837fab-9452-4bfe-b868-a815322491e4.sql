-- ════════════════════════════════
-- DROP EVERYTHING FROM PRIOR SCHEMA
-- ════════════════════════════════
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role) CASCADE;
DROP FUNCTION IF EXISTS public.start_quiz(uuid, public.difficulty_level, integer) CASCADE;
DROP FUNCTION IF EXISTS public.approve_payment(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_premium(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.can_take_quiz(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.update_leaderboard_on_quiz() CASCADE;

DROP TABLE IF EXISTS public.quiz_answers CASCADE;
DROP TABLE IF EXISTS public.quizzes CASCADE;
DROP TABLE IF EXISTS public.quiz_sessions CASCADE;
DROP TABLE IF EXISTS public.daily_quiz_counters CASCADE;
DROP TABLE IF EXISTS public.leaderboard_monthly CASCADE;
DROP TABLE IF EXISTS public.monthly_leaderboard CASCADE;
DROP TABLE IF EXISTS public.prize_winners CASCADE;
DROP TABLE IF EXISTS public.prize_records CASCADE;
DROP TABLE IF EXISTS public.payment_submissions CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.job_saves CASCADE;
DROP TABLE IF EXISTS public.saved_jobs CASCADE;
DROP TABLE IF EXISTS public.jobs CASCADE;
DROP TABLE IF EXISTS public.questions CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.quiz_categories CASCADE;
DROP TABLE IF EXISTS public.blog_posts CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.site_settings CASCADE;
DROP TABLE IF EXISTS public.app_settings CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP TYPE IF EXISTS public.app_role CASCADE;
DROP TYPE IF EXISTS public.difficulty_level CASCADE;
DROP TYPE IF EXISTS public.subscription_status CASCADE;
DROP TYPE IF EXISTS public.payment_status CASCADE;

-- ════════════════════════════════
-- EXTENSIONS
-- ════════════════════════════════
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ════════════════════════════════
-- PROFILES
-- ════════════════════════════════
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  username text unique,
  phone text default '',
  email text default '',
  avatar_url text default '',
  district text default '',
  bio text default '',
  is_premium boolean default false,
  premium_started_at timestamptz,
  premium_expires_at timestamptz,
  total_quizzes_taken integer default 0,
  total_correct_answers integer default 0,
  total_score integer default 0,
  current_month_score integer default 0,
  current_month_quizzes integer default 0,
  free_quizzes_today integer default 0,
  free_quota_reset_date date default current_date,
  total_prizes_won integer default 0,
  total_prize_amount integer default 0,
  facebook_liked boolean default false,
  profile_shared boolean default false,
  preferred_language text default 'bn',
  email_notifications boolean default true,
  role text default 'user' check (role in ('user','admin','moderator')),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT ON public.profiles TO anon;
alter table profiles enable row level security;

-- ════════════════════════════════
-- HELPER FUNCTIONS (defined early; SECURITY DEFINER bypasses RLS to avoid recursion)
-- ════════════════════════════════
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.is_premium(user_uuid uuid default auth.uid()) returns boolean
language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from profiles
    where id = user_uuid and is_premium = true and premium_expires_at > now()
  );
$$;

create or replace function public.can_take_quiz(user_uuid uuid default auth.uid()) returns boolean
language plpgsql security definer set search_path = public as $$
declare
  v_free_count integer;
  v_is_premium boolean;
  v_reset_date date;
begin
  select free_quizzes_today, is_premium, free_quota_reset_date
  into v_free_count, v_is_premium, v_reset_date
  from profiles where id = user_uuid;

  if v_is_premium then return true; end if;

  if v_reset_date < current_date then
    update profiles set free_quizzes_today = 0, free_quota_reset_date = current_date
    where id = user_uuid;
    return true;
  end if;

  return v_free_count < 5;
end; $$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, email, username) values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name',''),
    coalesce(new.email,''),
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8))
  );
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ════════════════════════════════
-- QUIZ CATEGORIES
-- ════════════════════════════════
create table quiz_categories (
  id uuid primary key default gen_random_uuid(),
  name_bn text not null,
  name_en text not null,
  slug text unique not null,
  icon text default '📚',
  color text default '#006A4E',
  description_bn text default '',
  parent_category text default '',
  display_order integer default 0,
  question_count integer default 0,
  is_active boolean default true,
  is_premium_only boolean default false,
  created_at timestamptz default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_categories TO authenticated;
GRANT ALL ON public.quiz_categories TO service_role;
GRANT SELECT ON public.quiz_categories TO anon;
alter table quiz_categories enable row level security;

-- ════════════════════════════════
-- QUESTIONS
-- ════════════════════════════════
create table questions (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references quiz_categories(id),
  question_text_bn text not null,
  question_text_en text default '',
  option_a_bn text not null,
  option_a_en text default '',
  option_b_bn text not null,
  option_b_en text default '',
  option_c_bn text not null,
  option_c_en text default '',
  option_d_bn text not null,
  option_d_en text default '',
  correct_option text not null check (correct_option in ('a','b','c','d')),
  explanation_bn text default '',
  explanation_en text default '',
  difficulty text default 'medium' check (difficulty in ('easy','medium','hard')),
  exam_type text default 'general',
  year_appeared text default '',
  is_active boolean default true,
  times_appeared integer default 0,
  times_correct integer default 0,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.questions TO authenticated;
GRANT ALL ON public.questions TO service_role;
GRANT SELECT ON public.questions TO anon;
alter table questions enable row level security;

-- ════════════════════════════════
-- QUIZ SESSIONS
-- ════════════════════════════════
create table quiz_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  category_id uuid references quiz_categories(id),
  session_type text default 'practice' check (session_type in ('practice','ranked','challenge')),
  language text default 'bn',
  total_questions integer default 10,
  time_limit_seconds integer default 600,
  questions_attempted integer default 0,
  correct_answers integer default 0,
  wrong_answers integer default 0,
  skipped integer default 0,
  score integer default 0,
  max_possible_score integer default 0,
  percentage decimal(5,2) default 0,
  time_taken_seconds integer default 0,
  status text default 'in_progress' check (status in ('in_progress','completed','abandoned','timed_out')),
  is_ranked boolean default false,
  started_at timestamptz default now(),
  completed_at timestamptz,
  created_at timestamptz default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_sessions TO authenticated;
GRANT ALL ON public.quiz_sessions TO service_role;
alter table quiz_sessions enable row level security;

-- ════════════════════════════════
-- QUIZ ANSWERS
-- ════════════════════════════════
create table quiz_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references quiz_sessions(id) on delete cascade,
  question_id uuid references questions(id),
  selected_option text check (selected_option in ('a','b','c','d','skipped')),
  is_correct boolean default false,
  time_taken_seconds integer default 0,
  created_at timestamptz default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_answers TO authenticated;
GRANT ALL ON public.quiz_answers TO service_role;
alter table quiz_answers enable row level security;

-- ════════════════════════════════
-- MONTHLY LEADERBOARD
-- ════════════════════════════════
create table monthly_leaderboard (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  month integer not null,
  year integer not null,
  total_score integer default 0,
  quizzes_taken integer default 0,
  correct_answers integer default 0,
  avg_percentage decimal(5,2) default 0,
  rank integer,
  prize_amount integer default 0,
  prize_position text default '',
  prize_paid boolean default false,
  prize_paid_at timestamptz,
  prize_payment_method text default '',
  prize_transaction_id text default '',
  is_premium boolean default false,
  facebook_liked boolean default false,
  profile_shared boolean default false,
  is_prize_eligible boolean generated always as (is_premium and facebook_liked) stored,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, month, year)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.monthly_leaderboard TO authenticated;
GRANT ALL ON public.monthly_leaderboard TO service_role;
GRANT SELECT ON public.monthly_leaderboard TO anon;
alter table monthly_leaderboard enable row level security;

-- ════════════════════════════════
-- PRIZE RECORDS
-- ════════════════════════════════
create table prize_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  month integer not null,
  year integer not null,
  position integer not null check (position in (1,2,3)),
  prize_amount integer not null,
  payment_method text default 'bkash',
  payment_number text default '',
  transaction_id text default '',
  paid_by uuid references profiles(id),
  paid_at timestamptz,
  status text default 'pending' check (status in ('pending','processing','paid','failed')),
  notes text default '',
  created_at timestamptz default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prize_records TO authenticated;
GRANT ALL ON public.prize_records TO service_role;
alter table prize_records enable row level security;

-- ════════════════════════════════
-- SUBSCRIPTIONS
-- ════════════════════════════════
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  amount integer not null default 10,
  payment_method text default 'bkash' check (payment_method in ('bkash','nagad','rocket','card')),
  transaction_id text not null,
  payment_screenshot_url text default '',
  bkash_number text default '',
  payment_month integer not null,
  payment_year integer not null,
  status text default 'pending' check (status in ('pending','verified','rejected')),
  verified_by uuid references profiles(id),
  verified_at timestamptz,
  premium_starts timestamptz,
  premium_expires timestamptz,
  admin_notes text default '',
  created_at timestamptz default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
alter table subscriptions enable row level security;

-- ════════════════════════════════
-- JOBS
-- ════════════════════════════════
create table jobs (
  id uuid primary key default gen_random_uuid(),
  title_bn text not null,
  title_en text default '',
  slug text unique not null,
  organization_name text not null,
  organization_type text default 'government'
    check (organization_type in ('government','bank','ngo','private','university','army','police','other')),
  organization_logo text default '',
  location_bn text default 'বাংলাদেশ',
  location_en text default 'Bangladesh',
  district text default '',
  job_type text default 'full_time'
    check (job_type in ('full_time','part_time','contract','intern')),
  vacancy_count integer default 1,
  salary_min integer,
  salary_max integer,
  salary_text text default '',
  application_deadline date,
  published_date date default current_date,
  experience_required text default '',
  education_required text default '',
  description_bn text default '',
  description_en text default '',
  application_url text default '',
  source_url text default '',
  is_featured boolean default false,
  is_active boolean default true,
  views_count integer default 0,
  posted_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO authenticated;
GRANT ALL ON public.jobs TO service_role;
GRANT SELECT ON public.jobs TO anon;
alter table jobs enable row level security;

-- ════════════════════════════════
-- SAVED JOBS
-- ════════════════════════════════
create table saved_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  job_id uuid references jobs(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, job_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_jobs TO authenticated;
GRANT ALL ON public.saved_jobs TO service_role;
alter table saved_jobs enable row level security;

-- ════════════════════════════════
-- BLOG POSTS
-- ════════════════════════════════
create table blog_posts (
  id uuid primary key default gen_random_uuid(),
  title_bn text not null,
  title_en text default '',
  slug text unique not null,
  content_bn text default '',
  content_en text default '',
  excerpt_bn text default '',
  category text default 'career'
    check (category in ('career','bcs','bank','exam_tips','motivation','news')),
  featured_image text default '',
  author_id uuid references profiles(id),
  views_count integer default 0,
  is_published boolean default false,
  published_at timestamptz,
  seo_title_bn text default '',
  seo_desc_bn text default '',
  created_at timestamptz default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;
GRANT SELECT ON public.blog_posts TO anon;
alter table blog_posts enable row level security;

-- ════════════════════════════════
-- NOTIFICATIONS
-- ════════════════════════════════
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  type text default 'info',
  title_bn text not null,
  message_bn text not null,
  is_read boolean default false,
  link text default '',
  created_at timestamptz default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
alter table notifications enable row level security;

-- ════════════════════════════════
-- SITE SETTINGS
-- ════════════════════════════════
create table site_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text unique not null,
  setting_value text default '',
  updated_at timestamptz default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
GRANT SELECT ON public.site_settings TO anon;
alter table site_settings enable row level security;

-- ════════════════════════════════
-- RLS POLICIES
-- ════════════════════════════════
create policy "profiles_own" on profiles for all using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());
create policy "profiles_public_read" on profiles for select using (true);

create policy "questions_public" on questions for select using (is_active = true);
create policy "questions_admin" on questions for all using (public.is_admin()) with check (public.is_admin());

create policy "categories_public" on quiz_categories for select using (is_active = true);
create policy "categories_admin" on quiz_categories for all using (public.is_admin()) with check (public.is_admin());

create policy "sessions_own" on quiz_sessions for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

create policy "answers_own" on quiz_answers for all using (
  session_id in (select id from quiz_sessions where user_id = auth.uid()) or public.is_admin()
) with check (
  session_id in (select id from quiz_sessions where user_id = auth.uid()) or public.is_admin()
);

create policy "leaderboard_public" on monthly_leaderboard for select using (true);
create policy "leaderboard_own_insert" on monthly_leaderboard for insert with check (user_id = auth.uid() or public.is_admin());
create policy "leaderboard_own_update" on monthly_leaderboard for update using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

create policy "subs_own" on subscriptions for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

create policy "saved_jobs_own" on saved_jobs for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "jobs_public" on jobs for select using (is_active = true);
create policy "jobs_admin" on jobs for all using (public.is_admin()) with check (public.is_admin());

create policy "blog_public" on blog_posts for select using (is_published = true);
create policy "blog_admin" on blog_posts for all using (public.is_admin()) with check (public.is_admin());

create policy "notifs_own" on notifications for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "prizes_own_read" on prize_records for select using (user_id = auth.uid() or public.is_admin());
create policy "prizes_admin" on prize_records for all using (public.is_admin()) with check (public.is_admin());

create policy "settings_public" on site_settings for select using (true);
create policy "settings_admin" on site_settings for all using (public.is_admin()) with check (public.is_admin());

-- ════════════════════════════════
-- LEADERBOARD UPDATE TRIGGER
-- ════════════════════════════════
create or replace function public.update_leaderboard_on_quiz() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'completed' and new.is_ranked = true then
    insert into monthly_leaderboard (user_id, month, year, total_score, quizzes_taken, correct_answers)
    values (
      new.user_id,
      extract(month from now())::integer,
      extract(year from now())::integer,
      new.score,
      1,
      new.correct_answers
    )
    on conflict (user_id, month, year) do update set
      total_score = monthly_leaderboard.total_score + new.score,
      quizzes_taken = monthly_leaderboard.quizzes_taken + 1,
      correct_answers = monthly_leaderboard.correct_answers + new.correct_answers,
      updated_at = now();
  end if;
  return new;
end; $$;

create trigger quiz_completed_trigger
  after update of status on quiz_sessions
  for each row
  when (new.status = 'completed')
  execute procedure public.update_leaderboard_on_quiz();

-- ════════════════════════════════
-- SEED: SITE SETTINGS
-- ════════════════════════════════
insert into site_settings (setting_key, setting_value) values
  ('app_name', 'Quiz4Job'),
  ('app_name_bn', 'কুইজ ফর জব'),
  ('tagline_bn', 'কুইজ দিন, চাকরি পান, পুরস্কার জিতুন!'),
  ('subscription_fee', '10'),
  ('free_daily_quiz_limit', '5'),
  ('prize_1st_amount', '1500'),
  ('prize_2nd_amount', '1000'),
  ('prize_3rd_amount', '500'),
  ('prize_currency', 'BDT'),
  ('bkash_number', '01700-000000'),
  ('nagad_number', '01700-000000'),
  ('facebook_page_url', 'https://facebook.com/quiz4job'),
  ('monthly_prize_pool', '3000'),
  ('current_month_prize_winner_1', ''),
  ('current_month_prize_winner_2', ''),
  ('current_month_prize_winner_3', '')
on conflict (setting_key) do nothing;

-- ════════════════════════════════
-- SEED: CATEGORIES
-- ════════════════════════════════
insert into quiz_categories (name_bn, name_en, slug, icon, color, display_order) values
  ('বিসিএস প্রস্তুতি', 'BCS Preparation', 'bcs', '🏛️', '#006A4E', 1),
  ('ব্যাংক জব প্রস্তুতি', 'Bank Job', 'bank', '🏦', '#2563EB', 2),
  ('প্রাথমিক শিক্ষক', 'Primary Teacher', 'primary-teacher', '📖', '#7C3AED', 3),
  ('ইংরেজি', 'English', 'english', '🔤', '#0EA5E9', 4),
  ('গণিত', 'Mathematics', 'math', '🔢', '#EA580C', 5),
  ('সাধারণ জ্ঞান', 'General Knowledge', 'general-knowledge', '🌍', '#16A34A', 6),
  ('আন্তর্জাতিক বিষয়াবলি', 'International Affairs', 'international', '🌐', '#DC2626', 7),
  ('বাংলা', 'Bangla', 'bangla', '📝', '#F59E0B', 8),
  ('কম্পিউটার ও তথ্যপ্রযুক্তি', 'Computer & ICT', 'computer-ict', '💻', '#6366F1', 9),
  ('বাংলাদেশ বিষয়াবলি', 'Bangladesh Affairs', 'bangladesh-affairs', '🇧🇩', '#006A4E', 10),
  ('নৈতিকতা ও মূল্যবোধ', 'Ethics & Values', 'ethics', '⚖️', '#0F766E', 11),
  ('পোস্ট অফিস', 'Post Office', 'post-office', '📮', '#7E22CE', 12)
on conflict (slug) do nothing;

-- ════════════════════════════════
-- SEED: SAMPLE QUESTIONS (General Knowledge)
-- ════════════════════════════════
insert into questions (category_id, question_text_bn, option_a_bn, option_b_bn, option_c_bn, option_d_bn, correct_option, explanation_bn, difficulty, exam_type)
select c.id, q.qtxt, q.oa, q.ob, q.oc, q.od, q.correct, q.exp, q.diff, q.etype
from quiz_categories c,
(values
  ('বাংলাদেশের জাতীয় সংগীতের রচয়িতা কে?', 'রবীন্দ্রনাথ ঠাকুর', 'কাজী নজরুল ইসলাম', 'জসীমউদ্দীন', 'মাইকেল মধুসূদন দত্ত', 'a', 'আমার সোনার বাংলা রবীন্দ্রনাথ ঠাকুর রচিত।', 'easy', 'general'),
  ('বাংলাদেশের স্বাধীনতা দিবস কত তারিখে?', '২৫ মার্চ', '২৬ মার্চ', '১৬ ডিসেম্বর', '৭ মার্চ', 'b', 'বাংলাদেশের স্বাধীনতা দিবস ২৬ মার্চ।', 'easy', 'general'),
  ('বাংলাদেশের জাতীয় ফুল কী?', 'গোলাপ', 'শাপলা', 'কদম', 'বকুল', 'b', 'বাংলাদেশের জাতীয় ফুল শাপলা।', 'easy', 'general'),
  ('বাংলাদেশের প্রথম রাষ্ট্রপতি কে ছিলেন?', 'শেখ মুজিবুর রহমান', 'জিয়াউর রহমান', 'বিচারপতি আবু সাঈদ চৌধুরী', 'সৈয়দ নজরুল ইসলাম', 'c', 'বাংলাদেশের প্রথম রাষ্ট্রপতি ছিলেন বিচারপতি আবু সাঈদ চৌধুরী।', 'medium', 'general'),
  ('বাংলাদেশের মুদ্রার নাম কী?', 'রুপি', 'টাকা', 'পাউন্ড', 'ডলার', 'b', 'বাংলাদেশের মুদ্রার নাম টাকা।', 'easy', 'general')
) as q(qtxt, oa, ob, oc, od, correct, exp, diff, etype)
where c.slug = 'general-knowledge';