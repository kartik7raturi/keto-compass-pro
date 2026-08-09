
REVOKE ALL ON FUNCTION public.grant_ketopia_subscription(text, text, numeric, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.grant_course_access(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.generate_referral_code(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.ensure_recipe_of_the_day() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_recipe_upvotes(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.decrement_recipe_upvotes(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.check_recipe_approval() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.lock_story_moderation_fields() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.mark_message_read() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_group_member_count() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_recipes_updated_at() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.award_points(integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_user_plan(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.user_has_feature(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.user_has_course_access(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;

-- Helpers the signed-in app genuinely needs
GRANT EXECUTE ON FUNCTION public.award_points(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_plan(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_feature(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_course_access(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Service role keeps full access for edge functions / triggers
GRANT EXECUTE ON FUNCTION public.grant_ketopia_subscription(text, text, numeric, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.grant_course_access(text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.ensure_recipe_of_the_day() TO service_role;
GRANT EXECUTE ON FUNCTION public.generate_referral_code(uuid) TO service_role;
