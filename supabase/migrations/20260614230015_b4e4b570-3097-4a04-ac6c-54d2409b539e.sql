
REVOKE SELECT (email, phone) ON public.profiles FROM anon, authenticated;
REVOKE SELECT (prize_transaction_id, prize_payment_method, prize_paid_at) ON public.monthly_leaderboard FROM anon, authenticated;
