
-- Course content: public sees published only; admins (signed in) see everything
DROP POLICY IF EXISTS "modules readable by all" ON public.course_modules;
CREATE POLICY "Published modules are public"
ON public.course_modules FOR SELECT TO anon, authenticated
USING (is_published);
CREATE POLICY "Admins can view all modules"
ON public.course_modules FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "lessons readable by all" ON public.course_lessons;
CREATE POLICY "Published lessons are public"
ON public.course_lessons FOR SELECT TO anon, authenticated
USING (is_published);
CREATE POLICY "Admins can view all lessons"
ON public.course_lessons FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin management policies: signed-in admins only
DROP POLICY IF EXISTS "Admins can manage advertisements" ON public.advertisements;
CREATE POLICY "Admins can manage advertisements" ON public.advertisements FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can view all messages" ON public.user_messages;
CREATE POLICY "Admins can view all messages" ON public.user_messages FOR SELECT TO authenticated USING (public.is_admin());
DROP POLICY IF EXISTS "Admins can update messages" ON public.user_messages;
CREATE POLICY "Admins can update messages" ON public.user_messages FOR UPDATE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage challenges" ON public.challenges;
CREATE POLICY "Admins can manage challenges" ON public.challenges FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins can delete challenges" ON public.challenges;
CREATE POLICY "Admins can delete challenges" ON public.challenges FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert badges" ON public.badges;
CREATE POLICY "Admins can insert badges" ON public.badges FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins can update badges" ON public.badges;
CREATE POLICY "Admins can update badges" ON public.badges FOR UPDATE TO authenticated USING (public.is_admin());
DROP POLICY IF EXISTS "Admins can delete badges" ON public.badges;
CREATE POLICY "Admins can delete badges" ON public.badges FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage all challenge posts" ON public.challenge_posts;
CREATE POLICY "Admins can manage all challenge posts" ON public.challenge_posts FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage all reports" ON public.user_reports;
CREATE POLICY "Admins can manage all reports" ON public.user_reports FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage all bans" ON public.user_bans;
CREATE POLICY "Admins can manage all bans" ON public.user_bans FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Storage admin policies
DROP POLICY IF EXISTS "Admins can upload advertisement images" ON storage.objects;
CREATE POLICY "Admins can upload advertisement images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'advertisements' AND public.is_admin());
DROP POLICY IF EXISTS "Admins can update advertisement images" ON storage.objects;
CREATE POLICY "Admins can update advertisement images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'advertisements' AND public.is_admin());
DROP POLICY IF EXISTS "Admins can delete advertisement images" ON storage.objects;
CREATE POLICY "Admins can delete advertisement images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'advertisements' AND public.is_admin());
