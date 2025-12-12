-- Create badges table
CREATE TABLE public.badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text NOT NULL DEFAULT 'award',
  badge_type text NOT NULL DEFAULT 'achievement',
  requirement_type text,
  requirement_value integer,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user_badges table
CREATE TABLE public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  badge_id uuid NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Create notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  is_read boolean NOT NULL DEFAULT false,
  link text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Badges policies (anyone can view)
CREATE POLICY "Anyone can view badges" ON public.badges FOR SELECT USING (true);

-- User badges policies
CREATE POLICY "Users can view all user badges" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "Users can earn badges" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications policies (private to user)
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert default badges
INSERT INTO public.badges (name, description, icon, badge_type, requirement_type, requirement_value) VALUES
('First Steps', 'Completed your first challenge', 'footprints', 'challenge', 'challenges_completed', 1),
('Challenge Warrior', 'Completed 5 challenges', 'sword', 'challenge', 'challenges_completed', 5),
('Challenge Master', 'Completed 10 challenges', 'crown', 'challenge', 'challenges_completed', 10),
('Keto Starter', 'Logged your first keto day', 'leaf', 'keto', 'keto_days', 1),
('Keto Enthusiast', 'Logged 7 keto days in a row', 'flame', 'keto', 'keto_streak', 7),
('Keto Pro', 'Logged 30 keto days in a row', 'star', 'keto', 'keto_streak', 30),
('Fast Beginner', 'Completed your first fast', 'timer', 'fasting', 'fasts_completed', 1),
('Fasting Expert', 'Completed 10 fasts', 'hourglass', 'fasting', 'fasts_completed', 10),
('Workout Starter', 'Logged your first workout', 'dumbbell', 'workout', 'workouts_completed', 1),
('Fitness Buff', 'Logged 20 workouts', 'medal', 'workout', 'workouts_completed', 20),
('Hydration Hero', 'Met water goal 7 days in a row', 'droplet', 'water', 'water_streak', 7),
('Community Star', 'Created 10 community posts', 'users', 'community', 'posts_created', 10);

-- Fix security: Update community tables to require authentication for viewing
DROP POLICY IF EXISTS "Users can view likes" ON public.community_likes;
CREATE POLICY "Authenticated users can view likes" ON public.community_likes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can view memberships" ON public.community_members;
CREATE POLICY "Authenticated users can view memberships" ON public.community_members FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can view votes" ON public.recipe_votes;
CREATE POLICY "Authenticated users can view votes" ON public.recipe_votes FOR SELECT TO authenticated USING (true);