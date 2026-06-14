
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.start_quiz(UUID, public.difficulty_level, INTEGER) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.approve_payment(UUID) FROM PUBLIC;

-- has_role is used inside RLS policies; needs to be callable by authed users
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;

-- start_quiz / approve_payment must be callable by signed-in users (rpc endpoints)
GRANT EXECUTE ON FUNCTION public.start_quiz(UUID, public.difficulty_level, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_payment(UUID) TO authenticated;
