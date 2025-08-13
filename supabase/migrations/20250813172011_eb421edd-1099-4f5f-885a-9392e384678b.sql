-- Create keto streak tracking table
CREATE TABLE public.keto_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create fasting sessions table
CREATE TABLE public.fasting_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  target_duration_hours INTEGER NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workout logs table (separate from existing workout tracker)
CREATE TABLE public.workout_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  workout_type TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create water intake logs table
CREATE TABLE public.water_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  cups_consumed INTEGER NOT NULL DEFAULT 0,
  daily_goal INTEGER NOT NULL DEFAULT 8,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.keto_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fasting_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for keto_streaks
CREATE POLICY "Users can view their own keto streaks"
ON public.keto_streaks
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own keto streaks"
ON public.keto_streaks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own keto streaks"
ON public.keto_streaks
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own keto streaks"
ON public.keto_streaks
FOR DELETE
USING (auth.uid() = user_id);

-- Create RLS policies for fasting_sessions
CREATE POLICY "Users can view their own fasting sessions"
ON public.fasting_sessions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own fasting sessions"
ON public.fasting_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fasting sessions"
ON public.fasting_sessions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fasting sessions"
ON public.fasting_sessions
FOR DELETE
USING (auth.uid() = user_id);

-- Create RLS policies for workout_logs
CREATE POLICY "Users can view their own workout logs"
ON public.workout_logs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workout logs"
ON public.workout_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout logs"
ON public.workout_logs
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout logs"
ON public.workout_logs
FOR DELETE
USING (auth.uid() = user_id);

-- Create RLS policies for water_logs
CREATE POLICY "Users can view their own water logs"
ON public.water_logs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own water logs"
ON public.water_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own water logs"
ON public.water_logs
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own water logs"
ON public.water_logs
FOR DELETE
USING (auth.uid() = user_id);

-- Create unique constraints to prevent duplicate entries per day
CREATE UNIQUE INDEX unique_keto_streak_per_user_date ON public.keto_streaks(user_id, date);
CREATE UNIQUE INDEX unique_water_log_per_user_date ON public.water_logs(user_id, date);

-- Create trigger for water_logs updated_at
CREATE TRIGGER update_water_logs_updated_at
BEFORE UPDATE ON public.water_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();