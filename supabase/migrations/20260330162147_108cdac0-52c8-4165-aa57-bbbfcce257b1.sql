-- User subscriptions table
CREATE TABLE public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type text NOT NULL DEFAULT 'free',
  payment_type text,
  amount_paid numeric DEFAULT 0,
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" ON public.user_subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscription" ON public.user_subscriptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscription" ON public.user_subscriptions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all subscriptions" ON public.user_subscriptions FOR SELECT TO authenticated USING (public.is_admin());

-- User survey responses table
CREATE TABLE public.user_survey_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  goal_weight numeric,
  current_weight numeric,
  height numeric,
  age integer,
  gender text,
  activity_level text,
  diet_experience text,
  exercise_frequency text,
  health_conditions text[],
  motivation text,
  daily_calorie_target integer,
  daily_carb_target integer,
  daily_protein_target integer,
  daily_fat_target integer,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own survey" ON public.user_survey_responses FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own survey" ON public.user_survey_responses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own survey" ON public.user_survey_responses FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Auto-create free subscription on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1))
  );
  INSERT INTO public.user_progress (user_id, total_points, current_level) VALUES (NEW.id, 0, 1);
  INSERT INTO public.user_subscriptions (user_id, plan_type) VALUES (NEW.id, 'free');
  RETURN NEW;
END;
$$;