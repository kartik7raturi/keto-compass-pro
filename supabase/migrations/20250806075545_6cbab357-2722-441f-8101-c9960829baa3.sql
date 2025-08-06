-- Create meals table for storing meal information
CREATE TABLE public.meals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  ingredients TEXT[] NOT NULL DEFAULT '{}',
  instructions TEXT[] NOT NULL DEFAULT '{}',
  prep_time INTEGER,
  cook_time INTEGER,
  servings INTEGER DEFAULT 1,
  calories INTEGER,
  carbs NUMERIC DEFAULT 0,
  protein NUMERIC DEFAULT 0,
  fat NUMERIC DEFAULT 0,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  is_quick_meal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meal_plans table for storing user meal plans
CREATE TABLE public.meal_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  plan_type TEXT CHECK (plan_type IN ('weekly', 'custom')) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meal_plan_items table for storing individual meal assignments
CREATE TABLE public.meal_plan_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_plan_id UUID NOT NULL REFERENCES public.meal_plans(id) ON DELETE CASCADE,
  meal_id UUID NOT NULL REFERENCES public.meals(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday, 6 = Saturday
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')) NOT NULL,
  planned_date DATE,
  servings INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_items ENABLE ROW LEVEL SECURITY;

-- Create policies for meals (public read, admin write)
CREATE POLICY "Anyone can view meals" 
ON public.meals 
FOR SELECT 
USING (true);

-- Create policies for meal_plans (user-specific)
CREATE POLICY "Users can view their own meal plans" 
ON public.meal_plans 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own meal plans" 
ON public.meal_plans 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal plans" 
ON public.meal_plans 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal plans" 
ON public.meal_plans 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for meal_plan_items (user-specific through meal_plans)
CREATE POLICY "Users can view their own meal plan items" 
ON public.meal_plan_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.meal_plans 
    WHERE id = meal_plan_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own meal plan items" 
ON public.meal_plan_items 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.meal_plans 
    WHERE id = meal_plan_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own meal plan items" 
ON public.meal_plan_items 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.meal_plans 
    WHERE id = meal_plan_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own meal plan items" 
ON public.meal_plan_items 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.meal_plans 
    WHERE id = meal_plan_id AND user_id = auth.uid()
  )
);

-- Create triggers for updated_at
CREATE TRIGGER update_meals_updated_at
BEFORE UPDATE ON public.meals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at
BEFORE UPDATE ON public.meal_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample meals data
INSERT INTO public.meals (title, description, ingredients, instructions, prep_time, cook_time, servings, calories, carbs, protein, fat, difficulty, meal_type, is_quick_meal, image_url) VALUES
('Keto Scrambled Eggs', 'Quick and easy keto breakfast', ARRAY['3 eggs', '2 tbsp butter', '2 tbsp heavy cream', 'Salt and pepper'], ARRAY['Beat eggs with cream', 'Heat butter in pan', 'Scramble eggs on low heat', 'Season with salt and pepper'], 5, 5, 2, 320, 2, 18, 28, 'easy', 'breakfast', true, NULL),
('Avocado Chicken Salad', 'Refreshing keto lunch option', ARRAY['2 chicken breasts', '1 avocado', '2 cups mixed greens', '2 tbsp olive oil', '1 tbsp lemon juice'], ARRAY['Grill chicken and slice', 'Dice avocado', 'Mix greens with oil and lemon', 'Top with chicken and avocado'], 10, 15, 2, 480, 8, 35, 36, 'easy', 'lunch', true, NULL),
('Keto Beef Stir Fry', 'Quick dinner with vegetables', ARRAY['1 lb beef strips', '2 cups broccoli', '1 bell pepper', '3 tbsp coconut oil', '2 tbsp soy sauce'], ARRAY['Heat oil in wok', 'Stir fry beef until browned', 'Add vegetables and cook 5 minutes', 'Add soy sauce and serve'], 10, 10, 4, 380, 6, 28, 28, 'easy', 'dinner', true, NULL),
('Salmon with Asparagus', 'Elegant keto dinner', ARRAY['4 salmon fillets', '1 lb asparagus', '3 tbsp butter', '2 cloves garlic', 'Lemon juice'], ARRAY['Preheat oven to 400°F', 'Season salmon and asparagus', 'Roast for 15-20 minutes', 'Serve with garlic butter'], 15, 20, 4, 420, 4, 32, 30, 'medium', 'dinner', false, NULL),
('Keto Fat Bombs', 'Quick energy snack', ARRAY['1/2 cup coconut oil', '1/4 cup almond butter', '2 tbsp cocoa powder', 'Stevia to taste'], ARRAY['Melt coconut oil', 'Mix in almond butter and cocoa', 'Add stevia to taste', 'Pour into molds and freeze'], 10, 0, 8, 120, 2, 3, 12, 'easy', 'snack', true, NULL);