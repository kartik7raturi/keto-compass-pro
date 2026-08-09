
-- 1. PROFILES ------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.is_admin());

CREATE OR REPLACE VIEW public.public_profiles
WITH (security_barrier) AS
SELECT
  user_id,
  display_name,
  username,
  avatar_url,
  follower_count,
  following_count,
  diet_type,
  diet_preference,
  country,
  state,
  city,
  town,
  share_progress_publicly,
  CASE WHEN share_progress_publicly THEN current_weight END AS current_weight,
  created_at
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- 2. FOOD LISTINGS -------------------------------------------------------
REVOKE SELECT (contact_email, contact_whatsapp) ON public.food_listings FROM anon;

-- 3. USER BADGES ---------------------------------------------------------
DROP POLICY IF EXISTS "Users can view all user badges" ON public.user_badges;
CREATE POLICY "Signed-in users can view badges"
ON public.user_badges FOR SELECT TO authenticated
USING (true);

-- 4. STORAGE -------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can upload food images" ON storage.objects;
CREATE POLICY "Authenticated users can upload food images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'recipe-media'
  AND (storage.foldername(name))[1] = 'food'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

DROP POLICY IF EXISTS "Anyone can read recipe-media" ON storage.objects;
DROP POLICY IF EXISTS "Public read for recipe media" ON storage.objects;
DROP POLICY IF EXISTS "Public read for community media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view advertisement images" ON storage.objects;

CREATE POLICY "Users can list their own media"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id IN ('recipe-media','community-media','product-images','advertisements')
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR (storage.foldername(name))[2] = auth.uid()::text
    OR public.is_admin()
  )
);

-- 5. SECURITY DEFINER FUNCTION EXECUTION ---------------------------------
REVOKE ALL ON FUNCTION public.grant_ketopia_subscription(text, text, numeric, text, text) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.grant_course_access(text, text) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.generate_referral_code(uuid) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.ensure_recipe_of_the_day() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.increment_recipe_upvotes(uuid) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.decrement_recipe_upvotes(uuid) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.check_recipe_approval() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.lock_story_moderation_fields() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.mark_message_read() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.update_group_member_count() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.set_recipes_updated_at() FROM anon, authenticated;

-- Signed-in-only helpers: no anonymous execution
REVOKE ALL ON FUNCTION public.award_points(integer) FROM anon;
REVOKE ALL ON FUNCTION public.get_user_plan(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.user_has_feature(uuid, text) FROM anon;
REVOKE ALL ON FUNCTION public.user_has_course_access(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE ALL ON FUNCTION public.is_admin() FROM anon;
