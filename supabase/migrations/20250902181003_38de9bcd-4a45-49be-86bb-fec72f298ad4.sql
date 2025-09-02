-- Create user progress table for points and levels
CREATE TABLE public.user_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  total_points integer NOT NULL DEFAULT 0,
  current_level integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for user progress
CREATE POLICY "Users can view their own progress" 
ON public.user_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress" 
ON public.user_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
ON public.user_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_progress_updated_at
BEFORE UPDATE ON public.user_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to award points to users
CREATE OR REPLACE FUNCTION public.award_points(points_to_add integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_total integer;
  new_level integer;
BEGIN
  -- Insert or update user progress
  INSERT INTO public.user_progress (user_id, total_points, current_level)
  VALUES (auth.uid(), points_to_add, 1)
  ON CONFLICT (user_id)
  DO UPDATE SET 
    total_points = user_progress.total_points + points_to_add,
    updated_at = now();
  
  -- Get the new total
  SELECT total_points INTO new_total
  FROM public.user_progress
  WHERE user_id = auth.uid();
  
  -- Calculate new level (every 100 points = 1 level)
  new_level := GREATEST(1, (new_total / 100) + 1);
  
  -- Update level
  UPDATE public.user_progress
  SET current_level = new_level
  WHERE user_id = auth.uid();
END;
$$;

-- Add unique constraint on user_id to prevent duplicates
ALTER TABLE public.user_progress ADD CONSTRAINT user_progress_user_id_unique UNIQUE (user_id);

-- Update profiles table to ensure display_name is populated from handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name', 
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      SPLIT_PART(NEW.email, '@', 1)
    )
  );
  
  -- Initialize user progress
  INSERT INTO public.user_progress (user_id, total_points, current_level)
  VALUES (NEW.id, 0, 1);
  
  RETURN NEW;
END;
$$;