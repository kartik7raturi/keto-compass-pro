-- Add dessert and drinks recipes
INSERT INTO recipes (
  title, description, ingredients, instructions, prep_time, cook_time, servings, 
  difficulty, category, carbs, protein, fat, calories
) VALUES
-- Dessert recipes
('Keto Chocolate Avocado Mousse', 'Rich and creamy chocolate mousse made with avocados', 
 ARRAY['2 ripe avocados', '1/4 cup cocoa powder', '1/4 cup erythritol', '1/4 cup heavy cream', '1 tsp vanilla extract'], 
 ARRAY['Blend all ingredients until smooth', 'Chill for 2 hours', 'Serve with whipped cream'], 
 15, 0, 4, 'easy', 'dessert', 4, 3, 18, 200),

('Keto Cheesecake Fat Bombs', 'Creamy cheesecake bites perfect for dessert', 
 ARRAY['8 oz cream cheese', '1/4 cup butter', '1/4 cup powdered erythritol', '1 tsp vanilla'], 
 ARRAY['Mix all ingredients', 'Form into balls', 'Freeze for 1 hour'], 
 10, 0, 12, 'easy', 'dessert', 2, 2, 8, 85),

('Sugar-Free Chocolate Chip Cookies', 'Delicious keto-friendly chocolate chip cookies', 
 ARRAY['2 cups almond flour', '1/3 cup erythritol', '1/4 cup butter', '1 egg', '1/2 cup sugar-free chocolate chips'], 
 ARRAY['Mix dry ingredients', 'Add wet ingredients', 'Bake at 350°F for 12 minutes'], 
 15, 12, 24, 'medium', 'dessert', 3, 6, 12, 140),

('Keto Panna Cotta', 'Silky smooth Italian dessert', 
 ARRAY['1 cup heavy cream', '1/4 cup erythritol', '1 packet gelatin', '1 tsp vanilla'], 
 ARRAY['Heat cream with sweetener', 'Dissolve gelatin', 'Pour into molds', 'Chill 4 hours'], 
 10, 5, 6, 'medium', 'dessert', 3, 3, 22, 220),

('Chocolate Keto Brownies', 'Fudgy brownies with only 2g net carbs', 
 ARRAY['1 cup almond flour', '1/2 cup cocoa powder', '1/2 cup erythritol', '3 eggs', '1/3 cup butter'], 
 ARRAY['Mix dry ingredients', 'Add wet ingredients', 'Bake 25 minutes at 325°F'], 
 15, 25, 16, 'medium', 'dessert', 2, 5, 14, 160),

-- Drinks recipes
('Keto Bulletproof Coffee', 'High-fat coffee to fuel your morning', 
 ARRAY['1 cup black coffee', '1 tbsp MCT oil', '1 tbsp grass-fed butter', '1 tsp vanilla extract'], 
 ARRAY['Brew coffee', 'Add MCT oil and butter', 'Blend until frothy'], 
 5, 0, 1, 'easy', 'drinks', 1, 1, 25, 230),

('Electrolyte Keto Lemonade', 'Refreshing drink to replenish electrolytes', 
 ARRAY['2 cups water', '1/4 cup lemon juice', '1/4 tsp sea salt', '2 tbsp erythritol', 'Ice cubes'], 
 ARRAY['Mix all ingredients', 'Stir until dissolved', 'Serve over ice'], 
 5, 0, 2, 'easy', 'drinks', 2, 0, 0, 10),

('Keto Green Smoothie', 'Nutrient-packed green smoothie', 
 ARRAY['1 cup spinach', '1/2 avocado', '1 cup unsweetened almond milk', '1 tbsp MCT oil', '1 tsp stevia'], 
 ARRAY['Blend all ingredients until smooth', 'Add ice if desired', 'Serve immediately'], 
 5, 0, 1, 'easy', 'drinks', 4, 3, 15, 150),

('Sugar-Free Iced Tea', 'Refreshing iced tea with keto sweetener', 
 ARRAY['4 tea bags', '4 cups water', '1/4 cup erythritol', 'Lemon slices', 'Ice'], 
 ARRAY['Brew tea and let cool', 'Add sweetener', 'Serve over ice with lemon'], 
 10, 0, 4, 'easy', 'drinks', 1, 0, 0, 5),

('Keto Hot Chocolate', 'Rich and creamy hot chocolate', 
 ARRAY['1 cup unsweetened almond milk', '2 tbsp cocoa powder', '2 tbsp erythritol', '1 tbsp heavy cream'], 
 ARRAY['Heat almond milk', 'Whisk in cocoa and sweetener', 'Top with cream'], 
 5, 5, 1, 'easy', 'drinks', 4, 2, 8, 80);