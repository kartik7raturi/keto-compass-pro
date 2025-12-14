-- Create user messages table for queries
CREATE TABLE public.user_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_messages
CREATE POLICY "Users can create their own messages"
ON public.user_messages FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own messages"
ON public.user_messages FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all messages"
ON public.user_messages FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can update messages"
ON public.user_messages FOR UPDATE
USING (is_admin());

-- Create challenge daily logs table for check-mark system
CREATE TABLE public.challenge_daily_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_challenge_id UUID NOT NULL REFERENCES public.user_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_challenge_id, log_date)
);

-- Enable RLS
ALTER TABLE public.challenge_daily_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for challenge_daily_logs
CREATE POLICY "Users can create their own daily logs"
ON public.challenge_daily_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own daily logs"
ON public.challenge_daily_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily logs"
ON public.challenge_daily_logs FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily logs"
ON public.challenge_daily_logs FOR DELETE
USING (auth.uid() = user_id);

-- Add reward column to challenges table
ALTER TABLE public.challenges 
ADD COLUMN IF NOT EXISTS reward_points INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS reward_badge_id UUID REFERENCES public.badges(id);

-- Create admin policies for challenges CRUD
CREATE POLICY "Admins can manage challenges"
ON public.challenges FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admins can delete challenges"
ON public.challenges FOR DELETE
USING (is_admin());