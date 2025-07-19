-- Create communities table
CREATE TABLE public.communities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community_challenges table
CREATE TABLE public.community_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_value NUMERIC,
  target_unit TEXT,
  duration_days INTEGER NOT NULL,
  participants_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community_posts table for discussions
CREATE TABLE public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community_comments table
CREATE TABLE public.community_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community_likes table
CREATE TABLE public.community_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Create community_members table
CREATE TABLE public.community_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, community_id)
);

-- Enable RLS
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for communities
CREATE POLICY "Anyone can view communities" ON public.communities FOR SELECT USING (true);

-- RLS Policies for community_challenges
CREATE POLICY "Anyone can view community challenges" ON public.community_challenges FOR SELECT USING (true);

-- RLS Policies for community_posts
CREATE POLICY "Anyone can view community posts" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON public.community_posts FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for community_comments
CREATE POLICY "Anyone can view comments" ON public.community_comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON public.community_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for community_likes
CREATE POLICY "Users can view likes" ON public.community_likes FOR SELECT USING (true);
CREATE POLICY "Users can manage their own likes" ON public.community_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own likes" ON public.community_likes FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for community_members
CREATE POLICY "Users can view memberships" ON public.community_members FOR SELECT USING (true);
CREATE POLICY "Users can join communities" ON public.community_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave communities" ON public.community_members FOR DELETE USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_communities_updated_at
  BEFORE UPDATE ON public.communities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_challenges_updated_at
  BEFORE UPDATE ON public.community_challenges
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample communities
INSERT INTO public.communities (name, description, image_url, member_count) VALUES
('Keto Beginners', 'A supportive community for those just starting their keto journey', 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 1250),
('Advanced Keto', 'For experienced keto practitioners sharing advanced tips and strategies', 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 875),
('Keto Athletes', 'Combining ketogenic lifestyle with athletic performance and fitness goals', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 650);

-- Insert community challenges
INSERT INTO public.community_challenges (community_id, title, description, target_value, target_unit, duration_days, participants_count) VALUES
((SELECT id FROM public.communities WHERE name = 'Keto Beginners'), '30-Day Keto Start Challenge', 'Complete your first 30 days on keto with daily check-ins and support', 30, 'days', 30, 89),
((SELECT id FROM public.communities WHERE name = 'Keto Beginners'), 'Track Your Macros Daily', 'Log your daily macros for consistent tracking habits', 7, 'days', 7, 156),
((SELECT id FROM public.communities WHERE name = 'Keto Beginners'), 'Cook 5 New Keto Recipes', 'Expand your keto cooking skills with new recipes', 5, 'recipes', 14, 78);

INSERT INTO public.community_challenges (community_id, title, description, target_value, target_unit, duration_days, participants_count) VALUES
((SELECT id FROM public.communities WHERE name = 'Advanced Keto'), 'Optimize Your Ketones', 'Maintain ketone levels above 1.5 mmol/L for 21 days', 21, 'days', 21, 45),
((SELECT id FROM public.communities WHERE name = 'Advanced Keto'), 'Intermittent Fasting Integration', 'Combine IF with keto for enhanced benefits', 14, 'days', 14, 67),
((SELECT id FROM public.communities WHERE name = 'Advanced Keto'), 'Keto Meal Prep Master', 'Prep all meals for a full week using advanced techniques', 1, 'week', 7, 34);

INSERT INTO public.community_challenges (community_id, title, description, target_value, target_unit, duration_days, participants_count) VALUES
((SELECT id FROM public.communities WHERE name = 'Keto Athletes'), 'Keto Endurance Challenge', 'Complete 10 workouts while maintaining ketosis', 10, 'workouts', 21, 23),
((SELECT id FROM public.communities WHERE name = 'Keto Athletes'), 'Pre-Workout Fuel Test', 'Track performance with different keto pre-workout strategies', 14, 'sessions', 14, 31),
((SELECT id FROM public.communities WHERE name = 'Keto Athletes'), 'Recovery Optimization', 'Implement keto-friendly recovery protocols for 2 weeks', 14, 'days', 14, 19);

-- Insert sample posts for each community (using placeholder UUIDs)
INSERT INTO public.community_posts (community_id, user_id, author_name, author_avatar, content, tags) VALUES
((SELECT id FROM public.communities WHERE name = 'Keto Beginners'), gen_random_uuid(), 'Sarah M.', 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80', 'Just completed my first week on keto! The energy boost is incredible. Anyone have tips for dealing with the initial cravings?', ARRAY['beginner', 'week1', 'energy']),
((SELECT id FROM public.communities WHERE name = 'Keto Beginners'), gen_random_uuid(), 'Mike R.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80', 'Made my first keto bread today! It actually tastes amazing. Recipe in comments 👇', ARRAY['recipe', 'bread', 'cooking']);

INSERT INTO public.community_posts (community_id, user_id, author_name, author_avatar, content, tags) VALUES
((SELECT id FROM public.communities WHERE name = 'Advanced Keto'), gen_random_uuid(), 'Dr. Lisa K.', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80', 'Interesting study on ketone variability throughout the day. Timing your measurements can make a big difference in tracking progress.', ARRAY['science', 'ketones', 'tracking']),
((SELECT id FROM public.communities WHERE name = 'Advanced Keto'), gen_random_uuid(), 'Tom H.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80', 'After 2 years on keto, here are my top 5 advanced strategies for maintaining ketosis during social events...', ARRAY['advanced', 'social', 'strategies']);

INSERT INTO public.community_posts (community_id, user_id, author_name, author_avatar, content, tags) VALUES
((SELECT id FROM public.communities WHERE name = 'Keto Athletes'), gen_random_uuid(), 'Coach Emma', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80', 'PRd my deadlift while fully keto-adapted! 💪 The sustained energy during long training sessions is a game-changer.', ARRAY['performance', 'PR', 'strength']),
((SELECT id FROM public.communities WHERE name = 'Keto Athletes'), gen_random_uuid(), 'Jake M.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80', 'Comparing my marathon times before and after keto adaptation. The results might surprise you! 🏃‍♂️', ARRAY['endurance', 'marathon', 'comparison']);