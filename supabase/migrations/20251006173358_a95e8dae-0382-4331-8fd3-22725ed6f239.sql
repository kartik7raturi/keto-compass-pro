-- Create recipe reviews table
CREATE TABLE IF NOT EXISTS public.recipe_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL,
  user_id UUID NOT NULL,
  comment TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recipe_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recipe_reviews
CREATE POLICY "Anyone can view reviews"
  ON public.recipe_reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own reviews"
  ON public.recipe_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON public.recipe_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON public.recipe_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_recipe_reviews_updated_at
  BEFORE UPDATE ON public.recipe_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert 25 PCOS recipes (5 for each category: breakfast, lunch, dinner, snacks, drinks)

-- PCOS Breakfast Recipes
INSERT INTO public.recipes (title, description, ingredients, instructions, prep_time, cook_time, servings, difficulty, category, carbs, protein, fat, calories, diet_type) VALUES
('PCOS Power Smoothie Bowl', 'Nutrient-dense smoothie bowl with low glycemic fruits and seeds', 
 ARRAY['1 cup spinach', '1/2 cup frozen berries', '1/4 avocado', '1 scoop protein powder', '2 tbsp chia seeds', '1/4 cup unsweetened almond milk', 'Toppings: sliced almonds, hemp seeds'],
 ARRAY['Blend spinach, berries, avocado, protein powder, and almond milk until smooth', 'Pour into a bowl', 'Top with chia seeds, sliced almonds, and hemp seeds', 'Serve immediately'],
 5, 0, 1, 'easy', 'breakfast', 15, 25, 18, 320, 'pcos'),

('Anti-Inflammatory Oatmeal', 'Steel-cut oats with cinnamon and walnuts to reduce inflammation',
 ARRAY['1/2 cup steel-cut oats', '1 cup water', '1/4 tsp cinnamon', '1 tbsp ground flaxseed', '2 tbsp walnuts, chopped', '1/2 apple, diced', 'Pinch of sea salt'],
 ARRAY['Bring water to boil in a small pot', 'Add oats and salt, reduce heat to low', 'Cook for 20 minutes, stirring occasionally', 'Add cinnamon and flaxseed', 'Top with walnuts and diced apple', 'Serve warm'],
 5, 20, 1, 'easy', 'breakfast', 32, 10, 16, 310, 'pcos'),

('Hormone-Balancing Eggs', 'Omega-3 rich eggs with vegetables and turmeric',
 ARRAY['2 omega-3 eggs', '1/4 cup spinach', '1/4 cup mushrooms, sliced', '1/4 tsp turmeric', '1/4 avocado, sliced', '1 tsp olive oil', 'Salt and pepper to taste'],
 ARRAY['Heat olive oil in a pan over medium heat', 'Sauté mushrooms for 2 minutes', 'Add spinach and cook until wilted', 'Whisk eggs with turmeric, salt, and pepper', 'Pour eggs into pan and scramble gently', 'Serve with sliced avocado on the side'],
 5, 7, 1, 'easy', 'breakfast', 6, 18, 22, 290, 'pcos'),

('Greek Yogurt Parfait', 'Probiotic-rich parfait with low-sugar fruits and nuts',
 ARRAY['1 cup plain Greek yogurt', '1/4 cup blueberries', '2 tbsp almonds, sliced', '1 tbsp pumpkin seeds', '1 tsp honey', '1/4 tsp vanilla extract', 'Dash of cinnamon'],
 ARRAY['In a glass or bowl, layer half the Greek yogurt', 'Add half the blueberries and nuts', 'Layer remaining yogurt', 'Top with remaining blueberries, almonds, and pumpkin seeds', 'Drizzle with honey and sprinkle cinnamon', 'Serve chilled'],
 5, 0, 1, 'easy', 'breakfast', 18, 22, 12, 280, 'pcos'),

('Spearmint Green Tea Pancakes', 'Anti-androgen spearmint-infused protein pancakes',
 ARRAY['1/2 cup almond flour', '2 eggs', '1/4 cup spearmint tea (cooled)', '1 scoop vanilla protein powder', '1/4 tsp baking powder', '1 tbsp coconut oil for cooking', '2 tbsp almond butter for topping'],
 ARRAY['Brew spearmint tea and let cool', 'Mix almond flour, protein powder, and baking powder', 'Whisk eggs and spearmint tea together', 'Combine wet and dry ingredients', 'Heat coconut oil in a pan over medium heat', 'Pour batter to form small pancakes', 'Cook 2-3 minutes per side until golden', 'Top with almond butter'],
 10, 10, 2, 'medium', 'breakfast', 12, 28, 24, 360, 'pcos');

-- PCOS Lunch Recipes
INSERT INTO public.recipes (title, description, ingredients, instructions, prep_time, cook_time, servings, difficulty, category, carbs, protein, fat, calories, diet_type) VALUES
('Mediterranean Quinoa Bowl', 'Protein-rich quinoa with anti-inflammatory vegetables',
 ARRAY['1/2 cup cooked quinoa', '1/2 cup chickpeas', '1/2 cup cucumber, diced', '1/4 cup cherry tomatoes', '1/4 cup red onion, diced', '2 tbsp feta cheese', '2 tbsp olive oil', '1 tbsp lemon juice', 'Fresh parsley'],
 ARRAY['Cook quinoa according to package directions and let cool', 'In a large bowl, combine quinoa, chickpeas, cucumber, tomatoes, and onion', 'Whisk together olive oil and lemon juice', 'Drizzle dressing over bowl', 'Top with feta cheese and fresh parsley', 'Toss gently and serve'],
 10, 15, 2, 'easy', 'lunch', 38, 16, 18, 380, 'pcos'),

('Turmeric Chicken Salad', 'Anti-inflammatory chicken salad with turmeric dressing',
 ARRAY['6 oz grilled chicken breast, sliced', '2 cups mixed greens', '1/4 cup carrots, shredded', '1/4 cup red cabbage, shredded', '2 tbsp pumpkin seeds', '2 tbsp olive oil', '1 tbsp apple cider vinegar', '1/2 tsp turmeric', '1/4 tsp black pepper'],
 ARRAY['Grill or cook chicken breast until done, slice into strips', 'Combine mixed greens, carrots, and cabbage in a bowl', 'Whisk together olive oil, vinegar, turmeric, and pepper', 'Arrange chicken on top of greens', 'Drizzle with turmeric dressing', 'Sprinkle with pumpkin seeds', 'Serve immediately'],
 10, 12, 2, 'easy', 'lunch', 8, 38, 20, 360, 'pcos'),

('Lentil & Veggie Soup', 'Fiber-rich lentil soup with blood sugar-stabilizing vegetables',
 ARRAY['1 cup red lentils', '4 cups vegetable broth', '1 cup spinach', '1/2 cup carrots, diced', '1/2 cup celery, diced', '1/2 onion, diced', '2 cloves garlic, minced', '1 tsp cumin', '1/2 tsp coriander', '1 tbsp olive oil'],
 ARRAY['Heat olive oil in a large pot over medium heat', 'Sauté onion, carrots, and celery for 5 minutes', 'Add garlic, cumin, and coriander, cook 1 minute', 'Add lentils and vegetable broth', 'Bring to boil, then reduce heat and simmer 20 minutes', 'Add spinach and cook until wilted', 'Season with salt and pepper', 'Serve hot'],
 10, 25, 4, 'easy', 'lunch', 42, 18, 8, 310, 'pcos'),

('Salmon & Asparagus Sheet Pan', 'Omega-3 rich salmon with roasted vegetables',
 ARRAY['6 oz wild salmon fillet', '1 cup asparagus', '1/2 cup cherry tomatoes', '2 tbsp olive oil', '1 lemon, sliced', '2 cloves garlic, minced', 'Fresh dill', 'Salt and pepper'],
 ARRAY['Preheat oven to 400°F (200°C)', 'Place salmon on a baking sheet', 'Arrange asparagus and tomatoes around salmon', 'Drizzle everything with olive oil', 'Sprinkle with garlic, salt, and pepper', 'Top salmon with lemon slices and dill', 'Bake for 15-18 minutes', 'Serve immediately'],
 10, 18, 2, 'easy', 'lunch', 10, 34, 22, 370, 'pcos'),

('Zucchini Noodle Primavera', 'Low-carb zucchini noodles with colorful vegetables',
 ARRAY['2 medium zucchinis, spiralized', '1/2 cup bell peppers, sliced', '1/2 cup mushrooms, sliced', '1/4 cup sun-dried tomatoes', '2 cloves garlic, minced', '2 tbsp olive oil', '1/4 cup pine nuts', 'Fresh basil', 'Parmesan cheese (optional)'],
 ARRAY['Heat 1 tbsp olive oil in a large pan', 'Sauté bell peppers and mushrooms for 5 minutes', 'Add garlic and sun-dried tomatoes, cook 1 minute', 'Push vegetables to side, add remaining oil and zucchini noodles', 'Toss everything together and cook 3-4 minutes', 'Top with pine nuts and fresh basil', 'Serve with parmesan if desired'],
 15, 10, 2, 'easy', 'lunch', 18, 12, 24, 320, 'pcos');

-- PCOS Dinner Recipes
INSERT INTO public.recipes (title, description, ingredients, instructions, prep_time, cook_time, servings, difficulty, category, carbs, protein, fat, calories, diet_type) VALUES
('Herb-Crusted Cod', 'Lean protein with anti-inflammatory herbs',
 ARRAY['6 oz cod fillet', '2 tbsp fresh parsley, chopped', '1 tbsp fresh dill', '2 cloves garlic, minced', '2 tbsp almond flour', '1 tbsp olive oil', '1 lemon', 'Salt and pepper', '1 cup steamed broccoli for serving'],
 ARRAY['Preheat oven to 375°F (190°C)', 'Mix parsley, dill, garlic, and almond flour', 'Brush cod with olive oil', 'Press herb mixture onto fish', 'Place on baking sheet and bake 15-18 minutes', 'Squeeze lemon juice over fish', 'Serve with steamed broccoli'],
 10, 18, 2, 'easy', 'dinner', 12, 32, 14, 290, 'pcos'),

('Turkey & Vegetable Stir-Fry', 'Lean ground turkey with chromium-rich broccoli',
 ARRAY['8 oz ground turkey', '2 cups broccoli florets', '1 cup snap peas', '1 bell pepper, sliced', '2 cloves garlic, minced', '1 tbsp ginger, grated', '2 tbsp coconut aminos', '1 tbsp sesame oil', '1 tbsp sesame seeds'],
 ARRAY['Heat sesame oil in a wok or large pan', 'Add ground turkey and cook until browned', 'Add garlic and ginger, stir for 30 seconds', 'Add broccoli, snap peas, and bell pepper', 'Stir-fry for 5-7 minutes', 'Add coconut aminos and toss', 'Sprinkle with sesame seeds', 'Serve hot'],
 15, 12, 2, 'easy', 'dinner', 16, 36, 18, 360, 'pcos'),

('Cauliflower Rice Buddha Bowl', 'Low-carb bowl with hormone-balancing ingredients',
 ARRAY['2 cups cauliflower rice', '1 cup chickpeas', '1/2 avocado, sliced', '1/2 cup purple cabbage, shredded', '1/4 cup carrots, shredded', '2 tbsp tahini', '1 tbsp lemon juice', '1 tsp cumin', 'Fresh cilantro'],
 ARRAY['Sauté cauliflower rice in a pan for 5 minutes', 'Roast chickpeas with cumin until crispy', 'Arrange cauliflower rice in a bowl', 'Top with chickpeas, avocado, cabbage, and carrots', 'Mix tahini with lemon juice and a bit of water', 'Drizzle tahini sauce over bowl', 'Garnish with fresh cilantro'],
 15, 15, 2, 'easy', 'dinner', 32, 16, 22, 380, 'pcos'),

('Baked Chicken with Sweet Potato', 'Balanced meal with complex carbs and lean protein',
 ARRAY['6 oz chicken breast', '1 medium sweet potato', '1 cup Brussels sprouts', '2 tbsp olive oil', '1 tsp paprika', '1 tsp garlic powder', '1/2 tsp cinnamon', 'Salt and pepper'],
 ARRAY['Preheat oven to 400°F (200°C)', 'Dice sweet potato and halve Brussels sprouts', 'Toss vegetables with 1 tbsp olive oil, salt, and pepper', 'Season chicken with paprika, garlic powder, and cinnamon', 'Place chicken and vegetables on baking sheet', 'Drizzle chicken with remaining olive oil', 'Bake for 25-30 minutes', 'Serve hot'],
 10, 30, 2, 'easy', 'dinner', 28, 38, 16, 390, 'pcos'),

('Spiced Lentil Curry', 'Anti-inflammatory curry with blood sugar-stabilizing lentils',
 ARRAY['1 cup brown lentils', '1 can coconut milk', '1 cup spinach', '1 onion, diced', '2 cloves garlic, minced', '1 tbsp curry powder', '1 tsp turmeric', '1 tsp ginger, grated', '2 cups vegetable broth', '1 tbsp coconut oil'],
 ARRAY['Heat coconut oil in a large pot', 'Sauté onion until translucent', 'Add garlic, ginger, curry powder, and turmeric', 'Add lentils and vegetable broth', 'Bring to boil, then simmer 25 minutes', 'Add coconut milk and spinach', 'Cook until spinach wilts', 'Serve over cauliflower rice or alone'],
 10, 30, 4, 'medium', 'dinner', 36, 18, 22, 410, 'pcos');

-- PCOS Snacks
INSERT INTO public.recipes (title, description, ingredients, instructions, prep_time, cook_time, servings, difficulty, category, carbs, protein, fat, calories, diet_type) VALUES
('Cinnamon Roasted Chickpeas', 'Blood sugar-stabilizing crunchy snack',
 ARRAY['1 can chickpeas, drained', '1 tbsp olive oil', '1 tsp cinnamon', '1/4 tsp sea salt', 'Pinch of cayenne pepper'],
 ARRAY['Preheat oven to 400°F (200°C)', 'Pat chickpeas dry with paper towel', 'Toss with olive oil, cinnamon, salt, and cayenne', 'Spread on baking sheet', 'Roast for 30-35 minutes, shaking pan every 10 minutes', 'Let cool before serving', 'Store in airtight container'],
 5, 35, 4, 'easy', 'snacks', 22, 8, 6, 170, 'pcos'),

('Anti-Inflammatory Energy Balls', 'No-bake snack with omega-3s and antioxidants',
 ARRAY['1 cup rolled oats', '1/2 cup almond butter', '1/4 cup ground flaxseed', '2 tbsp chia seeds', '2 tbsp honey', '1/4 cup dark chocolate chips', '1 tsp vanilla extract', 'Pinch of sea salt'],
 ARRAY['Mix all ingredients in a bowl', 'Refrigerate mixture for 15 minutes', 'Roll into 12 balls', 'Store in refrigerator up to 1 week', 'Enjoy as a quick snack'],
 10, 0, 12, 'easy', 'snacks', 14, 4, 8, 140, 'pcos'),

('Veggie Sticks with Hummus', 'Fiber-rich vegetables with protein-packed hummus',
 ARRAY['1 cup carrots, cut into sticks', '1 cup celery, cut into sticks', '1 cup bell peppers, sliced', '1/2 cup cucumber, sliced', '1/2 cup hummus'],
 ARRAY['Wash and cut all vegetables into sticks or slices', 'Arrange on a plate', 'Serve with hummus for dipping', 'Store leftover vegetables in water in the fridge'],
 10, 0, 2, 'easy', 'snacks', 18, 8, 10, 190, 'pcos'),

('Almond Butter Apple Slices', 'Simple snack with healthy fats and fiber',
 ARRAY['1 medium apple', '2 tbsp almond butter', '1 tbsp hemp seeds', 'Dash of cinnamon'],
 ARRAY['Wash and slice apple', 'Spread almond butter on apple slices', 'Sprinkle with hemp seeds and cinnamon', 'Serve immediately'],
 5, 0, 1, 'easy', 'snacks', 22, 6, 18, 260, 'pcos'),

('Greek Yogurt with Berries', 'Probiotic snack with low-glycemic berries',
 ARRAY['1/2 cup plain Greek yogurt', '1/4 cup mixed berries', '1 tbsp walnuts, chopped', '1 tsp honey', 'Fresh mint for garnish'],
 ARRAY['Place Greek yogurt in a bowl', 'Top with mixed berries', 'Sprinkle with chopped walnuts', 'Drizzle with honey', 'Garnish with fresh mint', 'Serve chilled'],
 3, 0, 1, 'easy', 'snacks', 16, 14, 8, 190, 'pcos');

-- PCOS Drinks
INSERT INTO public.recipes (title, description, ingredients, instructions, prep_time, cook_time, servings, difficulty, category, carbs, protein, fat, calories, diet_type) VALUES
('Spearmint Tea Latte', 'Anti-androgen tea that helps reduce excess testosterone',
 ARRAY['2 spearmint tea bags', '1 cup hot water', '1/4 cup unsweetened almond milk', '1/2 tsp honey', '1/4 tsp vanilla extract', 'Dash of cinnamon'],
 ARRAY['Steep spearmint tea bags in hot water for 5 minutes', 'Remove tea bags', 'Warm almond milk and froth if desired', 'Add honey and vanilla to tea', 'Pour frothed milk over tea', 'Sprinkle with cinnamon', 'Serve hot'],
 2, 5, 1, 'easy', 'drinks', 6, 1, 1, 30, 'pcos'),

('Golden Turmeric Latte', 'Anti-inflammatory drink to reduce PCOS symptoms',
 ARRAY['1 cup unsweetened coconut milk', '1/2 tsp turmeric', '1/4 tsp cinnamon', '1/4 tsp ginger powder', 'Pinch of black pepper', '1/2 tsp honey', '1/4 tsp vanilla extract'],
 ARRAY['Heat coconut milk in a small pot', 'Whisk in turmeric, cinnamon, ginger, and black pepper', 'Simmer for 3-4 minutes', 'Remove from heat and add honey and vanilla', 'Pour into a mug', 'Optional: froth before serving', 'Drink warm'],
 2, 5, 1, 'easy', 'drinks', 4, 1, 5, 70, 'pcos'),

('Green Detox Smoothie', 'Hormone-balancing green smoothie',
 ARRAY['1 cup spinach', '1/2 cucumber', '1/2 green apple', '1/2 lemon, juiced', '1 tbsp chia seeds', '1 cup coconut water', '1/4 avocado', '1/2 inch fresh ginger'],
 ARRAY['Add all ingredients to blender', 'Blend on high until smooth', 'Add more coconut water if too thick', 'Pour into glass', 'Serve immediately'],
 5, 0, 1, 'easy', 'drinks', 18, 3, 8, 140, 'pcos'),

('Cinnamon Apple Cider Vinegar Drink', 'Blood sugar-regulating tonic',
 ARRAY['1 tbsp apple cider vinegar', '1 cup warm water', '1/2 tsp cinnamon', '1/2 tsp honey', '1 lemon slice'],
 ARRAY['Mix apple cider vinegar with warm water', 'Add cinnamon and honey', 'Stir well', 'Add lemon slice', 'Drink on empty stomach in the morning'],
 2, 0, 1, 'easy', 'drinks', 4, 0, 0, 15, 'pcos'),

('Berry Protein Shake', 'Hormone-balancing shake with antioxidants',
 ARRAY['1 scoop vanilla protein powder', '1/2 cup mixed berries', '1 cup unsweetened almond milk', '1 tbsp ground flaxseed', '1/4 cup ice', '1 tbsp almond butter', 'Handful of spinach'],
 ARRAY['Add all ingredients to blender', 'Blend on high until smooth and creamy', 'Add more almond milk if too thick', 'Pour into glass', 'Serve immediately'],
 5, 0, 1, 'easy', 'drinks', 12, 28, 12, 260, 'pcos');