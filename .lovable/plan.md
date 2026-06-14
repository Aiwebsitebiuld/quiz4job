# Quiz4Job — Build Plan

Bengali-first job quiz + job board for Bangladesh. Full v1, manual bKash/Nagad premium, Email + Google auth, AI-seeded MCQ bank.

## 1. Foundation

- Enable Lovable Cloud (Supabase) + Lovable AI Gateway.
- Configure Google OAuth via `supabase--configure_social_auth`; email/password on.
- Fonts: load Hind Siliguri + Inter via `<link>` in `__root.tsx`.
- Design tokens in `src/styles.css`: BD green/red, gold prize, premium purple, prize/hero gradients, shimmer + confetti-friendly utilities.
- Install: `react-hook-form`, `zod`, `@hookform/resolvers`, `react-helmet-async` (use TanStack `head()` instead where possible), `recharts`, `canvas-confetti`, `react-confetti`, `date-fns`, `framer-motion`.

## 2. Database schema (migration)

Tables (all with GRANTs + RLS):
- `profiles` (id→auth.users, full_name, phone, district, language, avatar_url, created_at) — auto-created via trigger.
- `user_roles` (user_id, role enum: admin|user) + `has_role()` SECURITY DEFINER fn.
- `subscriptions` (user_id, status: free|pending|active|expired, started_at, expires_at, payment_method, trx_id, amount).
- `payment_submissions` (user_id, method: bkash|nagad, sender_number, trx_id, amount, status: pending|approved|rejected, admin_note, reviewed_by, created_at).
- `categories` (slug, name_bn, name_en, icon).
- `questions` (category_id, difficulty, question_bn, question_en, options jsonb [{bn,en}x4], correct_index, explanation_bn, source, created_by, approved).
- `quizzes` (user_id, category_id, started_at, finished_at, score, total, time_taken, is_premium_attempt).
- `quiz_answers` (quiz_id, question_id, selected_index, is_correct, time_ms).
- `daily_quiz_counters` (user_id, date, count) — enforces 5/day for free.
- `leaderboard_monthly` materialized view OR scheduled aggregation table (user_id, month, total_score, total_quizzes, avg_accuracy, rank).
- `prize_winners` (month, rank 1-3, user_id, amount, payout_status, payout_trx).
- `jobs` (title_bn, title_en, organization, sector: govt|bank|ngo|private, location, salary_range, deadline, description_bn, description_en, apply_url, source_url, posted_at, created_by, published).
- `job_saves` (user_id, job_id).

RLS:
- Profiles: user reads/updates own; admin all.
- Questions/jobs: anyone authenticated SELECT approved/published; admin write.
- Quizzes/answers/counters/subscriptions/saves: owner-only; admin read.
- Payment submissions: owner insert + own select; admin all.
- Leaderboard view: SELECT to authenticated.

## 3. Server functions (`src/lib/*.functions.ts`)

- `quiz.functions`: `startQuiz` (enforces daily limit unless premium), `submitAnswer`, `finishQuiz` (writes score, updates monthly aggregate).
- `questions.functions`: `getQuestions(category, count, difficulty)` — pulls approved random sample.
- `ai-seed.functions` (admin): `generateQuestions(category, count)` → Lovable AI Gateway → inserts as `approved=false` for admin review.
- `payments.functions`: `submitPayment`, `myPaymentStatus`; admin: `approvePayment` (activates 30-day subscription), `rejectPayment`.
- `leaderboard.functions`: `currentMonth`, `myRank`.
- `jobs.functions`: `listJobs(filters)`, `saveJob`, `myJobs`; admin: `createJob`, `updateJob`.
- `admin.functions`: dashboard stats, user list, payout marking.
- All privileged fns: `requireSupabaseAuth` + `has_role('admin')` check.

## 4. Routes (TanStack Start, file-based)

Public:
- `/` landing — hero with floating cash animation, prize countdown, category grid, leaderboard preview, CTA.
- `/auth` — email/password + Google.
- `/jobs` + `/jobs/$id` — public listings, SEO `head()` per job.
- `/leaderboard` — current month + winners gallery.
- `/pricing` — ৳10 premium pitch + prize tiers.
- `/about`, `/contact`.

Authenticated (`_authenticated/`):
- `/dashboard` — daily quota, streak, recent quizzes, rank card, subscription status.
- `/quiz` — category picker.
- `/quiz/$category` — difficulty + start.
- `/quiz/play/$quizId` — quiz runner: animated progress, timer, confetti on correct, result screen.
- `/history` — past attempts + per-question review.
- `/premium` — bKash/Nagad instructions (merchant number, amount, copy-trx form), submission status timeline.
- `/saved-jobs`.
- `/profile`.

Admin (`_authenticated/_admin/`):
- `/admin` overview.
- `/admin/payments` — pending submissions, approve/reject.
- `/admin/questions` — list, AI-generate batch, edit, approve.
- `/admin/jobs` — CRUD.
- `/admin/leaderboard` — finalize month, set winners, mark payouts.
- `/admin/users`.

## 5. Quiz engine UX

- Pre-quiz: rules + start button. Free users see "X of 5 today".
- Runner: one question at a time, 60s timer per question, animated progress bar, Bengali+English toggle, locked answer + immediate feedback with `canvas-confetti` burst on correct.
- Finish: score, accuracy, time, XP gain, share card, "back to dashboard".
- Daily limit hit → upsell modal to `/premium`.

## 6. Premium + prize flow

- `/premium` shows merchant bKash + Nagad numbers (stored in `app_settings` table, editable by admin), amount ৳10, form for TrxID + sender number.
- After submit → `payment_submissions.pending`; admin approves → subscription active 30 days → premium badge + unlimited quizzes + leaderboard eligibility.
- Monthly cron-style server fn (manual admin trigger v1): freeze leaderboard, write top-3 premium users into `prize_winners`, admin records payout TrxID.
- Animated countdown to month end on landing + leaderboard.

## 7. Job board

- Filters: sector, location, deadline. Card list + detail page with apply CTA.
- Bilingual title/description toggle. Save button (auth required).
- Admin CRUD; future: importer.

## 8. Design system specifics

- Components: `PrizeBadge`, `PremiumBadge`, `CountdownTimer`, `QuizProgressBar`, `TrophyIcon`, `CashFloat` (framer-motion floating taka notes in hero), `ShimmerCard` for leaderboard top 3.
- Tailwind tokens map to CSS vars; never hardcode colors.
- Dark mode optional later; v1 light.

## 9. SEO

Per-route `head()`: BN+EN titles, descriptions, OG. JSON-LD on `/jobs/$id` (JobPosting schema). Sitemap-friendly static routes.

## 10. Build order (single pass)

1. Enable Cloud + AI, configure Google.
2. Migration: all tables, RLS, roles, triggers, seed categories + app_settings.
3. Design tokens + fonts + base layout (header with language toggle, footer).
4. Auth (`/auth`) + protected layout.
5. Server fns: questions, quiz, AI seed (run once to seed ~200 questions across BCS/Bank/Primary/General, BN+EN).
6. Quiz engine routes + UX.
7. Dashboard + history.
8. Premium flow + admin payment review.
9. Leaderboard + prize winners + countdown.
10. Job board (public + admin CRUD).
11. Admin shell + remaining tools.
12. Landing + pricing + about/contact polish.
13. SEO `head()` pass, run security scan, fix findings.

## Technical notes

- Use TanStack `createServerFn` everywhere; never Edge Functions.
- AI question generation uses Lovable AI Gateway (`LOVABLE_API_KEY`); inserts go to admin-review queue, not live, to keep quality high.
- Daily limit enforced server-side via `daily_quiz_counters` upsert inside `startQuiz` transaction — not trustable from client.
- Leaderboard ranking: server fn aggregates from `quizzes` filtered by month + `is_premium_attempt=true` for prize ranking; non-premium shown but not eligible.
- Use `framer-motion` for cash float / trophy; `canvas-confetti` for celebrations.
- `react-helmet-async` not needed — use TanStack `head()`.
- No `@import` of Google Fonts in CSS; use `<link>` in root head.
