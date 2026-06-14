
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.sub_status AS ENUM ('free', 'pending', 'active', 'expired');
CREATE TYPE public.payment_method AS ENUM ('bkash', 'nagad');
CREATE TYPE public.payment_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.job_sector AS ENUM ('govt', 'bank', 'ngo', 'private');
CREATE TYPE public.difficulty_level AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE public.payout_status AS ENUM ('pending', 'paid');

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT, phone TEXT, district TEXT,
  language TEXT NOT NULL DEFAULT 'bn', avatar_url TEXT,
  total_xp INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles read authed" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Profiles read anon" ON public.profiles FOR SELECT TO anon USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE TABLE public.subscriptions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  status sub_status NOT NULL DEFAULT 'free',
  started_at TIMESTAMPTZ, expires_at TIMESTAMPTZ,
  payment_method payment_method, last_trx_id TEXT, amount INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own sub" ON public.subscriptions FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admin modify subs" ON public.subscriptions FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER subs_updated BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  ) ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  INSERT INTO public.subscriptions (user_id, status) VALUES (NEW.id, 'free') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.payment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  method payment_method NOT NULL,
  sender_number TEXT NOT NULL, trx_id TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 10,
  status payment_status NOT NULL DEFAULT 'pending',
  admin_note TEXT, reviewed_by UUID REFERENCES auth.users(id), reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.payment_submissions TO authenticated;
GRANT ALL ON public.payment_submissions TO service_role;
ALTER TABLE public.payment_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own payments" ON public.payment_submissions FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users insert payment" ON public.payment_submissions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admin update payments" ON public.payment_submissions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name_bn TEXT NOT NULL, name_en TEXT NOT NULL,
  description_bn TEXT, description_en TEXT,
  icon TEXT, sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories public read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admin manage categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.categories (slug, name_bn, name_en, description_bn, description_en, icon, sort_order) VALUES
('bcs', 'বিসিএস', 'BCS', 'বিসিএস পরীক্ষার প্রস্তুতি', 'BCS exam preparation', '🎯', 1),
('bank', 'ব্যাংক জব', 'Bank Jobs', 'ব্যাংক নিয়োগ পরীক্ষা', 'Bank recruitment exam', '🏦', 2),
('primary', 'প্রাইমারি', 'Primary Teacher', 'প্রাইমারি শিক্ষক নিয়োগ', 'Primary teacher recruitment', '📚', 3),
('general', 'সাধারণ জ্ঞান', 'General Knowledge', 'সাধারণ জ্ঞান ও কারেন্ট অ্যাফেয়ার্স', 'General knowledge & current affairs', '🧠', 4);

CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  difficulty difficulty_level NOT NULL DEFAULT 'medium',
  question_bn TEXT NOT NULL, question_en TEXT,
  options JSONB NOT NULL,
  correct_index SMALLINT NOT NULL CHECK (correct_index BETWEEN 0 AND 3),
  explanation_bn TEXT, explanation_en TEXT, source TEXT,
  created_by UUID REFERENCES auth.users(id),
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX questions_cat_approved_idx ON public.questions(category_id, approved);
GRANT SELECT ON public.questions TO authenticated;
GRANT ALL ON public.questions TO service_role;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authed read approved questions" ON public.questions FOR SELECT TO authenticated USING (approved = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admin manage questions" ON public.questions FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id),
  difficulty difficulty_level NOT NULL DEFAULT 'medium',
  total_questions INTEGER NOT NULL DEFAULT 10,
  score INTEGER NOT NULL DEFAULT 0,
  time_taken_seconds INTEGER,
  is_premium_attempt BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ
);
CREATE INDEX quizzes_user_idx ON public.quizzes(user_id, started_at DESC);
CREATE INDEX quizzes_started_idx ON public.quizzes(started_at);
GRANT SELECT, INSERT, UPDATE ON public.quizzes TO authenticated;
GRANT ALL ON public.quizzes TO service_role;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see quizzes" ON public.quizzes FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users insert quiz" ON public.quizzes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update quiz" ON public.quizzes FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id),
  selected_index SMALLINT,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  time_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX quiz_answers_quiz_idx ON public.quiz_answers(quiz_id);
GRANT SELECT, INSERT ON public.quiz_answers TO authenticated;
GRANT ALL ON public.quiz_answers TO service_role;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own answers" ON public.quiz_answers FOR SELECT TO authenticated USING (EXISTS(SELECT 1 FROM public.quizzes q WHERE q.id = quiz_id AND (q.user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));
CREATE POLICY "Users insert answers" ON public.quiz_answers FOR INSERT TO authenticated WITH CHECK (EXISTS(SELECT 1 FROM public.quizzes q WHERE q.id = quiz_id AND q.user_id = auth.uid()));

CREATE TABLE public.daily_quiz_counters (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day)
);
GRANT SELECT ON public.daily_quiz_counters TO authenticated;
GRANT ALL ON public.daily_quiz_counters TO service_role;
ALTER TABLE public.daily_quiz_counters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own counter" ON public.daily_quiz_counters FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.prize_winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month DATE NOT NULL,
  rank SMALLINT NOT NULL CHECK (rank BETWEEN 1 AND 3),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  amount INTEGER NOT NULL,
  total_score INTEGER NOT NULL DEFAULT 0,
  payout_status payout_status NOT NULL DEFAULT 'pending',
  payout_trx TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(month, rank)
);
GRANT SELECT ON public.prize_winners TO anon, authenticated;
GRANT ALL ON public.prize_winners TO service_role;
ALTER TABLE public.prize_winners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Prize winners public read" ON public.prize_winners FOR SELECT USING (true);
CREATE POLICY "Admin manage winners" ON public.prize_winners FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_bn TEXT NOT NULL, title_en TEXT,
  organization TEXT NOT NULL,
  sector job_sector NOT NULL,
  location TEXT, salary_range TEXT, vacancies INTEGER,
  deadline DATE,
  description_bn TEXT, description_en TEXT,
  apply_url TEXT, source_url TEXT,
  posted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX jobs_published_idx ON public.jobs(published, deadline DESC);
GRANT SELECT ON public.jobs TO anon, authenticated;
GRANT ALL ON public.jobs TO service_role;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Jobs read published" ON public.jobs FOR SELECT USING (published = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admin manage jobs" ON public.jobs FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER jobs_updated BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.job_saves (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, job_id)
);
GRANT SELECT, INSERT, DELETE ON public.job_saves TO authenticated;
GRANT ALL ON public.job_saves TO service_role;
ALTER TABLE public.job_saves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage saves" ON public.job_saves FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.app_settings (
  key TEXT PRIMARY KEY, value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Settings public read" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Admin manage settings" ON public.app_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.app_settings (key, value) VALUES
('bkash_number', '01XXXXXXXXX'),
('nagad_number', '01XXXXXXXXX'),
('premium_price', '10'),
('prize_first', '1500'),
('prize_second', '1000'),
('prize_third', '500');

CREATE OR REPLACE FUNCTION public.start_quiz(_category_id UUID, _difficulty difficulty_level, _total INTEGER)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _user UUID := auth.uid();
  _is_premium BOOLEAN := false;
  _today DATE := (now() AT TIME ZONE 'Asia/Dhaka')::date;
  _count INTEGER := 0;
  _quiz_id UUID;
BEGIN
  IF _user IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT (status = 'active' AND (expires_at IS NULL OR expires_at > now())) INTO _is_premium FROM public.subscriptions WHERE user_id = _user;
  _is_premium := COALESCE(_is_premium, false);
  IF NOT _is_premium THEN
    SELECT count INTO _count FROM public.daily_quiz_counters WHERE user_id = _user AND day = _today;
    IF COALESCE(_count, 0) >= 5 THEN RAISE EXCEPTION 'DAILY_LIMIT_REACHED'; END IF;
  END IF;
  INSERT INTO public.daily_quiz_counters (user_id, day, count) VALUES (_user, _today, 1)
  ON CONFLICT (user_id, day) DO UPDATE SET count = public.daily_quiz_counters.count + 1;
  INSERT INTO public.quizzes (user_id, category_id, difficulty, total_questions, is_premium_attempt)
  VALUES (_user, _category_id, _difficulty, _total, _is_premium) RETURNING id INTO _quiz_id;
  RETURN _quiz_id;
END; $$;
GRANT EXECUTE ON FUNCTION public.start_quiz(UUID, difficulty_level, INTEGER) TO authenticated;

CREATE OR REPLACE FUNCTION public.approve_payment(_payment_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _p RECORD;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  SELECT * INTO _p FROM public.payment_submissions WHERE id = _payment_id AND status = 'pending';
  IF NOT FOUND THEN RAISE EXCEPTION 'Payment not found'; END IF;
  UPDATE public.payment_submissions SET status='approved', reviewed_by=auth.uid(), reviewed_at=now() WHERE id=_payment_id;
  INSERT INTO public.subscriptions (user_id, status, started_at, expires_at, payment_method, last_trx_id, amount)
  VALUES (_p.user_id, 'active', now(), now() + INTERVAL '30 days', _p.method, _p.trx_id, _p.amount)
  ON CONFLICT (user_id) DO UPDATE SET
    status='active',
    started_at=COALESCE(public.subscriptions.started_at, now()),
    expires_at=GREATEST(COALESCE(public.subscriptions.expires_at, now()), now()) + INTERVAL '30 days',
    payment_method=EXCLUDED.payment_method,
    last_trx_id=EXCLUDED.last_trx_id,
    amount=EXCLUDED.amount;
END; $$;
GRANT EXECUTE ON FUNCTION public.approve_payment(UUID) TO authenticated;
