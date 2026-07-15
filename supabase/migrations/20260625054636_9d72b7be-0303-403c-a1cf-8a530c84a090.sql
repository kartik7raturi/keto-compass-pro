
-- course_modules
CREATE TABLE public.course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.course_modules TO anon, authenticated;
GRANT ALL ON public.course_modules TO service_role;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "modules readable by all" ON public.course_modules FOR SELECT USING (is_published OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "modules admin write" ON public.course_modules FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- course_lessons
CREATE TABLE public.course_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  duration_sec INT NOT NULL DEFAULT 0,
  resources JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INT NOT NULL DEFAULT 0,
  is_preview BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(module_id, slug)
);
GRANT SELECT ON public.course_lessons TO anon, authenticated;
GRANT ALL ON public.course_lessons TO service_role;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
-- Anyone can see lesson metadata (so the sales page can list curriculum)
CREATE POLICY "lessons readable by all" ON public.course_lessons FOR SELECT USING (is_published OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "lessons admin write" ON public.course_lessons FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- course_access
CREATE TABLE public.course_access (
  user_id UUID PRIMARY KEY,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source TEXT NOT NULL DEFAULT 'jvzoo',
  jvzoo_order_id TEXT,
  jvzoo_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.course_access TO authenticated;
GRANT ALL ON public.course_access TO service_role;
ALTER TABLE public.course_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users see their own access" ON public.course_access FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin manage access" ON public.course_access FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- course_progress
CREATE TABLE public.course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  watched_seconds INT NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.course_progress TO authenticated;
GRANT ALL ON public.course_progress TO service_role;
ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own progress" ON public.course_progress FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Updated_at triggers
CREATE TRIGGER trg_course_modules_updated BEFORE UPDATE ON public.course_modules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_course_lessons_updated BEFORE UPDATE ON public.course_lessons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_course_progress_updated BEFORE UPDATE ON public.course_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Helper: does the current user have course access?
CREATE OR REPLACE FUNCTION public.user_has_course_access(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS(SELECT 1 FROM public.course_access WHERE user_id = p_user_id)
      OR EXISTS(SELECT 1 FROM public.user_subscriptions WHERE user_id = p_user_id
                AND is_active = true AND plan_type IN ('vip','vip_lifetime')
                AND (expires_at IS NULL OR expires_at > now()));
$$;

-- Grant course access via JVZoo (called by edge function)
CREATE OR REPLACE FUNCTION public.grant_course_access(p_email TEXT, p_order_id TEXT DEFAULT '')
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE LOWER(email) = LOWER(p_email) LIMIT 1;
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', true, 'pending', true, 'email', p_email);
  END IF;
  INSERT INTO public.course_access(user_id, source, jvzoo_order_id, jvzoo_email)
  VALUES (v_user_id, 'jvzoo', p_order_id, p_email)
  ON CONFLICT (user_id) DO UPDATE SET jvzoo_order_id = EXCLUDED.jvzoo_order_id, jvzoo_email = EXCLUDED.jvzoo_email;
  RETURN json_build_object('success', true, 'user_id', v_user_id);
END; $$;
