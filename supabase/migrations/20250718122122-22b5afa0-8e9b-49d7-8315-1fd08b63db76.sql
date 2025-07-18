-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  current_weight DECIMAL(5,2),
  goal_weight DECIMAL(5,2),
  height DECIMAL(5,2),
  age INTEGER,
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create recipes table
CREATE TABLE public.recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  ingredients TEXT[] NOT NULL,
  instructions TEXT[] NOT NULL,
  prep_time INTEGER, -- in minutes
  cook_time INTEGER, -- in minutes
  servings INTEGER,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  category TEXT CHECK (category IN ('breakfast', 'lunch', 'dinner', 'snacks', 'desserts', 'drinks')),
  image_url TEXT,
  carbs DECIMAL(5,2),
  protein DECIMAL(5,2),
  fat DECIMAL(5,2),
  calories INTEGER,
  is_keto_friendly BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create challenges table
CREATE TABLE public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  duration_days INTEGER NOT NULL,
  challenge_type TEXT CHECK (challenge_type IN ('keto_30_days', 'sugar_free', '10k_steps', 'weight_loss', 'custom')),
  target_value DECIMAL(10,2), -- for step goals, weight goals, etc.
  target_unit TEXT, -- 'steps', 'kg', 'lbs', etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_challenges table (many-to-many relationship)
CREATE TABLE public.user_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_completed BOOLEAN DEFAULT false,
  current_progress DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id, start_date)
);

-- Create weight_logs table
CREATE TABLE public.weight_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  weight DECIMAL(5,2) NOT NULL,
  unit TEXT CHECK (unit IN ('kg', 'lbs')) DEFAULT 'kg',
  notes TEXT,
  logged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create macro_logs table
CREATE TABLE public.macro_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  carbs DECIMAL(6,2) DEFAULT 0,
  protein DECIMAL(6,2) DEFAULT 0,
  fat DECIMAL(6,2) DEFAULT 0,
  calories INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create recipe_favorites table
CREATE TABLE public.recipe_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, recipe_id)
);

-- Insert sample challenges
INSERT INTO public.challenges (title, description, duration_days, challenge_type, target_value, target_unit) VALUES
('30-Day Keto Challenge', 'Complete 30 days of strict ketogenic diet', 30, 'keto_30_days', 20, 'carbs_per_day'),
('Sugar-Free Challenge', 'Eliminate added sugars for 30 days', 30, 'sugar_free', 0, 'grams_sugar'),
('10K Steps Daily', 'Walk 10,000 steps every day for 30 days', 30, '10k_steps', 10000, 'steps');

-- Insert sample recipes
INSERT INTO public.recipes (title, description, ingredients, instructions, prep_time, cook_time, servings, difficulty, category, carbs, protein, fat, calories) VALUES
('Keto Avocado Eggs', 'Creamy baked avocado with eggs', ARRAY['2 avocados', '4 eggs', 'salt', 'pepper', 'bacon bits'], ARRAY['Preheat oven to 425°F', 'Cut avocados in half and remove pit', 'Crack egg into each avocado half', 'Season with salt and pepper', 'Bake for 15-20 minutes', 'Top with bacon bits'], 10, 20, 4, 'easy', 'breakfast', 6.0, 14.0, 28.0, 320),
('Cauliflower Mac and Cheese', 'Low-carb comfort food', ARRAY['1 head cauliflower', '2 cups cheddar cheese', '1/2 cup heavy cream', 'butter', 'garlic powder'], ARRAY['Steam cauliflower until tender', 'Make cheese sauce with cream and cheese', 'Combine cauliflower with sauce', 'Bake until golden'], 15, 25, 6, 'medium', 'dinner', 8.0, 18.0, 22.0, 280);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.macro_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_favorites ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for recipes (public read, authenticated users only)
CREATE POLICY "Anyone can view recipes" ON public.recipes
  FOR SELECT USING (true);

-- Create RLS policies for challenges (public read)
CREATE POLICY "Anyone can view challenges" ON public.challenges
  FOR SELECT USING (true);

-- Create RLS policies for user_challenges
CREATE POLICY "Users can view their own challenges" ON public.user_challenges
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can join challenges" ON public.user_challenges
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own challenges" ON public.user_challenges
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for weight_logs
CREATE POLICY "Users can view their own weight logs" ON public.weight_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own weight logs" ON public.weight_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own weight logs" ON public.weight_logs
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own weight logs" ON public.weight_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for macro_logs
CREATE POLICY "Users can view their own macro logs" ON public.macro_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own macro logs" ON public.macro_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own macro logs" ON public.macro_logs
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for recipe_favorites
CREATE POLICY "Users can view their own favorites" ON public.recipe_favorites
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add favorites" ON public.recipe_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove favorites" ON public.recipe_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_macro_logs_updated_at
  BEFORE UPDATE ON public.macro_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();