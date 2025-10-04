-- Add diet type to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS diet_type TEXT DEFAULT 'keto' CHECK (diet_type IN ('keto', 'pcos'));

-- Add diet type to recipes
ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS diet_type TEXT DEFAULT 'keto' CHECK (diet_type IN ('keto', 'pcos'));

-- Create user recipes table for people contributions
CREATE TABLE IF NOT EXISTS public.user_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  ingredients TEXT[] NOT NULL,
  instructions TEXT[] NOT NULL,
  prep_time INTEGER,
  cook_time INTEGER,
  servings INTEGER DEFAULT 1,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  category TEXT,
  diet_type TEXT DEFAULT 'keto' CHECK (diet_type IN ('keto', 'pcos')),
  calories INTEGER,
  carbs NUMERIC,
  protein NUMERIC,
  fat NUMERIC,
  image_url TEXT,
  upvotes INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved user recipes"
  ON public.user_recipes FOR SELECT
  USING (is_approved = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own recipes"
  ON public.user_recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes"
  ON public.user_recipes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipes"
  ON public.user_recipes FOR DELETE
  USING (auth.uid() = user_id);

-- Create recipe votes table
CREATE TABLE IF NOT EXISTS public.recipe_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES public.user_recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, recipe_id)
);

ALTER TABLE public.recipe_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view votes"
  ON public.recipe_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can add their own votes"
  ON public.recipe_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
  ON public.recipe_votes FOR DELETE
  USING (auth.uid() = user_id);

-- Create period tracker table
CREATE TABLE IF NOT EXISTS public.period_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  flow_intensity TEXT CHECK (flow_intensity IN ('light', 'medium', 'heavy')),
  symptoms TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.period_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own period logs"
  ON public.period_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own period logs"
  ON public.period_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own period logs"
  ON public.period_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own period logs"
  ON public.period_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to auto-approve recipes with 10+ upvotes
CREATE OR REPLACE FUNCTION public.check_recipe_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.recipe_votes WHERE recipe_id = NEW.recipe_id) >= 10 THEN
    UPDATE public.user_recipes 
    SET is_approved = true 
    WHERE id = NEW.recipe_id AND is_approved = false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER recipe_approval_trigger
  AFTER INSERT ON public.recipe_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.check_recipe_approval();

-- Add trigger for updated_at on user_recipes
CREATE TRIGGER update_user_recipes_updated_at
  BEFORE UPDATE ON public.user_recipes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for updated_at on period_logs
CREATE TRIGGER update_period_logs_updated_at
  BEFORE UPDATE ON public.period_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert 10 PCOS recipes
INSERT INTO public.recipes (title, description, ingredients, instructions, prep_time, cook_time, servings, difficulty, category, diet_type, calories, carbs, protein, fat) VALUES
('PCOS-Friendly Cinnamon Almond Smoothie', 'Anti-inflammatory breakfast smoothie with cinnamon to help regulate blood sugar', 
ARRAY['1 cup unsweetened almond milk', '1 scoop protein powder', '1 tbsp almond butter', '1 tsp cinnamon', 'Handful of spinach', 'Ice cubes', '1/4 avocado'], 
ARRAY['Add all ingredients to blender', 'Blend until smooth', 'Serve immediately'], 
5, 0, 1, 'easy', 'breakfast', 'pcos', 280, 12, 20, 18),

('Spearmint Chia Pudding', 'Hormone-balancing breakfast with spearmint, known to help with PCOS symptoms', 
ARRAY['3 tbsp chia seeds', '1 cup coconut milk', '1 tsp spearmint extract', '1 tbsp maple syrup', 'Fresh berries for topping'], 
ARRAY['Mix chia seeds with coconut milk', 'Add spearmint extract and maple syrup', 'Refrigerate overnight', 'Top with fresh berries'], 
5, 0, 2, 'easy', 'breakfast', 'pcos', 220, 15, 6, 14),

('Turmeric Lentil Soup', 'Anti-inflammatory lunch with turmeric and protein-rich lentils', 
ARRAY['1 cup red lentils', '1 onion, diced', '2 cloves garlic', '1 tsp turmeric', '4 cups vegetable broth', '1 can coconut milk', 'Spinach'], 
ARRAY['Sauté onion and garlic', 'Add lentils, turmeric, and broth', 'Simmer 20 minutes', 'Add coconut milk and spinach', 'Blend partially for creamy texture'], 
10, 25, 4, 'easy', 'lunch', 'pcos', 320, 38, 16, 10),

('Salmon with Asparagus', 'Omega-3 rich dinner to support hormone balance', 
ARRAY['6 oz wild salmon', '1 bunch asparagus', '2 tbsp olive oil', 'Lemon juice', 'Garlic', 'Herbs'], 
ARRAY['Preheat oven to 400°F', 'Season salmon with herbs and garlic', 'Arrange asparagus around salmon', 'Drizzle with olive oil', 'Bake 15-18 minutes', 'Squeeze lemon before serving'], 
10, 18, 2, 'easy', 'dinner', 'pcos', 380, 8, 36, 24),

('Anti-Inflammatory Golden Milk', 'Turmeric drink to reduce inflammation and improve insulin sensitivity', 
ARRAY['1 cup unsweetened almond milk', '1 tsp turmeric', '1/2 tsp cinnamon', '1/4 tsp ginger', 'Pinch black pepper', '1 tsp honey'], 
ARRAY['Heat almond milk in saucepan', 'Whisk in all spices', 'Simmer 5 minutes', 'Strain and serve warm'], 
5, 5, 1, 'easy', 'drinks', 'pcos', 80, 10, 2, 3),

('Quinoa Power Bowl', 'Balanced lunch with complex carbs and lean protein', 
ARRAY['1 cup cooked quinoa', '4 oz grilled chicken', 'Mixed greens', 'Cherry tomatoes', 'Cucumber', 'Avocado', 'Lemon tahini dressing'], 
ARRAY['Cook quinoa according to package', 'Grill chicken breast', 'Arrange greens in bowl', 'Top with quinoa and sliced chicken', 'Add vegetables', 'Drizzle with dressing'], 
10, 15, 2, 'easy', 'lunch', 'pcos', 420, 35, 32, 18),

('Berry Flaxseed Muffins', 'Low-glycemic snack with fiber-rich flaxseed', 
ARRAY['1 cup almond flour', '1/4 cup ground flaxseed', '2 eggs', '1/4 cup berries', '1/4 cup honey', '1 tsp baking powder', '1/4 cup coconut oil'], 
ARRAY['Preheat oven to 350°F', 'Mix dry ingredients', 'Beat eggs with honey and oil', 'Combine wet and dry ingredients', 'Fold in berries', 'Bake 20 minutes'], 
10, 20, 12, 'easy', 'snacks', 'pcos', 180, 12, 6, 14),

('Walnut Crusted Chicken', 'Protein-rich dinner with omega-3 from walnuts', 
ARRAY['4 chicken breasts', '1 cup crushed walnuts', '1/4 cup parmesan', '1 egg', 'Italian herbs', 'Olive oil'], 
ARRAY['Preheat oven to 375°F', 'Mix walnuts, parmesan, and herbs', 'Dip chicken in beaten egg', 'Coat with walnut mixture', 'Bake 25 minutes'], 
15, 25, 4, 'medium', 'dinner', 'pcos', 440, 8, 42, 28),

('Cinnamon Apple Oatmeal', 'Blood sugar-friendly breakfast with cinnamon', 
ARRAY['1/2 cup steel-cut oats', '1 small apple, diced', '1 tsp cinnamon', '1 tbsp almond butter', '1 cup water', 'Walnuts for topping'], 
ARRAY['Cook oats in water', 'Add diced apple and cinnamon', 'Simmer until creamy', 'Top with almond butter and walnuts'], 
5, 15, 1, 'easy', 'breakfast', 'pcos', 340, 42, 10, 14),

('Green Detox Smoothie', 'Hormone-balancing smoothie with cruciferous vegetables', 
ARRAY['1 cup kale', '1/2 cucumber', '1/2 green apple', '1 tbsp flaxseed', '1 cup coconut water', 'Juice of 1/2 lemon', 'Fresh mint'], 
ARRAY['Wash all vegetables', 'Add all ingredients to blender', 'Blend until smooth', 'Add ice if desired', 'Serve immediately'], 
5, 0, 1, 'easy', 'drinks', 'pcos', 120, 22, 4, 3);
