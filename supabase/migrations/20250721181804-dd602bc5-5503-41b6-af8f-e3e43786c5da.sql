-- Add sample recipes (30 per category)
INSERT INTO public.recipes (title, description, ingredients, instructions, category, prep_time, cook_time, servings, calories, protein, fat, carbs, difficulty, image_url, is_keto_friendly) VALUES

-- Breakfast Category (30 recipes)
('Keto Avocado Scrambled Eggs', 'Creamy scrambled eggs with avocado and herbs', ARRAY['4 eggs', '1 avocado', '2 tbsp butter', '1 tbsp chives', 'Salt and pepper'], ARRAY['Scramble eggs in butter', 'Add diced avocado', 'Season with herbs', 'Serve immediately'], 'breakfast', 10, 5, 2, 320, 18, 28, 4, 'easy', 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400', true),

('Coconut Flour Pancakes', 'Fluffy keto pancakes made with coconut flour', ARRAY['1/4 cup coconut flour', '6 eggs', '1/4 cup cream cheese', '1 tsp vanilla', '1/2 tsp baking powder'], ARRAY['Blend all ingredients', 'Cook on medium heat', 'Flip when bubbles form', 'Serve with butter'], 'breakfast', 15, 10, 4, 180, 12, 14, 5, 'easy', 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400', true),

('Bacon and Egg Cups', 'Baked eggs in crispy bacon cups', ARRAY['12 bacon strips', '6 eggs', '1/4 cup cheese', 'Chives for garnish'], ARRAY['Line muffin tin with bacon', 'Crack egg into each cup', 'Bake at 375°F for 15 minutes', 'Garnish with chives'], 'breakfast', 10, 15, 6, 220, 16, 18, 2, 'medium', 'https://images.unsplash.com/photo-1582049833898-b0c3b7a2b5e8?w=400', true),

('Keto Breakfast Bowl', 'Protein-packed breakfast bowl with sausage and vegetables', ARRAY['2 sausages', '2 eggs', '1/2 avocado', '1 cup spinach', '1/4 cup cheese'], ARRAY['Cook sausages and slice', 'Sauté spinach', 'Fry eggs', 'Assemble in bowl with avocado'], 'breakfast', 15, 10, 2, 450, 25, 38, 6, 'easy', 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400', true),

('Chia Seed Pudding', 'Overnight chia pudding with coconut milk', ARRAY['1/4 cup chia seeds', '1 cup coconut milk', '1 tbsp sweetener', '1 tsp vanilla', 'Berries for topping'], ARRAY['Mix chia with coconut milk', 'Add sweetener and vanilla', 'Refrigerate overnight', 'Top with berries'], 'breakfast', 10, 0, 2, 280, 8, 24, 8, 'easy', 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400', true),

('Bulletproof Coffee', 'High-fat coffee for sustained energy', ARRAY['1 cup coffee', '1 tbsp MCT oil', '1 tbsp butter', '1 tsp vanilla'], ARRAY['Brew strong coffee', 'Add MCT oil and butter', 'Blend until frothy', 'Serve immediately'], 'breakfast', 5, 0, 1, 230, 1, 25, 1, 'easy', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400', true),

('Keto Breakfast Casserole', 'Make-ahead breakfast casserole with sausage and cheese', ARRAY['1 lb sausage', '12 eggs', '1 cup heavy cream', '2 cups cheese', '1 bell pepper'], ARRAY['Brown sausage and vegetables', 'Whisk eggs with cream', 'Combine in baking dish', 'Bake at 350°F for 45 minutes'], 'breakfast', 20, 45, 8, 380, 22, 32, 4, 'medium', 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400', true),

('Almond Flour Muffins', 'Low-carb blueberry muffins', ARRAY['2 cups almond flour', '6 eggs', '1/3 cup coconut oil', '1/2 cup blueberries', '1 tsp baking powder'], ARRAY['Mix dry ingredients', 'Combine wet ingredients', 'Fold in blueberries', 'Bake at 350°F for 20 minutes'], 'breakfast', 15, 20, 12, 190, 8, 16, 5, 'medium', 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400', true),

('Cream Cheese Waffles', 'Crispy keto waffles with cream cheese', ARRAY['4 oz cream cheese', '4 eggs', '2 tbsp coconut flour', '1 tsp vanilla'], ARRAY['Blend all ingredients', 'Cook in waffle maker', 'Serve with sugar-free syrup', 'Top with berries'], 'breakfast', 10, 10, 4, 160, 10, 13, 3, 'easy', 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=400', true),

('Spinach and Feta Omelet', 'Greek-style omelet with spinach and feta', ARRAY['3 eggs', '1 cup spinach', '1/4 cup feta cheese', '2 tbsp olive oil', 'Herbs'], ARRAY['Sauté spinach in oil', 'Beat eggs and pour over spinach', 'Add feta cheese', 'Fold omelet and serve'], 'breakfast', 10, 8, 2, 280, 18, 22, 4, 'medium', 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400', true),

('Keto Granola', 'Crunchy low-carb granola with nuts and seeds', ARRAY['1 cup almonds', '1/2 cup walnuts', '1/4 cup pumpkin seeds', '2 tbsp coconut oil', '1 tsp cinnamon'], ARRAY['Mix all ingredients', 'Spread on baking sheet', 'Bake at 300°F for 20 minutes', 'Cool and store'], 'breakfast', 10, 20, 8, 220, 8, 20, 4, 'easy', 'https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=400', true),

('Sausage and Pepper Scramble', 'Hearty scramble with Italian sausage', ARRAY['1/2 lb Italian sausage', '6 eggs', '1 bell pepper', '1 onion', '1/2 cup cheese'], ARRAY['Brown sausage', 'Add vegetables', 'Scramble in eggs', 'Top with cheese'], 'breakfast', 15, 15, 4, 420, 24, 34, 6, 'medium', 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400', true),

('Coconut Yogurt Parfait', 'Layered parfait with coconut yogurt and nuts', ARRAY['1 cup coconut yogurt', '1/4 cup mixed nuts', '2 tbsp chia seeds', '1 tbsp coconut flakes', 'Stevia to taste'], ARRAY['Layer yogurt with nuts', 'Add chia seeds', 'Top with coconut flakes', 'Sweeten if desired'], 'breakfast', 5, 0, 2, 250, 6, 22, 8, 'easy', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400', true),

('Ham and Cheese Roll-ups', 'Quick protein-rich breakfast roll-ups', ARRAY['8 slices ham', '4 slices cheese', '4 eggs', '1 tbsp butter'], ARRAY['Scramble eggs in butter', 'Place eggs on ham slices', 'Add cheese', 'Roll up and secure'], 'breakfast', 10, 5, 4, 290, 22, 20, 2, 'easy', 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400', true),

('Mushroom and Herb Frittata', 'Baked egg dish with mushrooms and fresh herbs', ARRAY['8 eggs', '2 cups mushrooms', '1/4 cup heavy cream', '2 tbsp fresh herbs', '1/2 cup cheese'], ARRAY['Sauté mushrooms', 'Whisk eggs with cream', 'Pour over mushrooms', 'Bake at 375°F for 25 minutes'], 'breakfast', 15, 25, 6, 220, 16, 16, 4, 'medium', 'https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=400', true),

('Keto Smoothie Bowl', 'Thick smoothie bowl with avocado and berries', ARRAY['1/2 avocado', '1/2 cup coconut milk', '1/4 cup berries', '1 tbsp almond butter', 'Coconut flakes'], ARRAY['Blend avocado with coconut milk', 'Pour into bowl', 'Top with berries', 'Garnish with coconut'], 'breakfast', 10, 0, 2, 320, 6, 28, 10, 'easy', 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400', true),

('Zucchini Hash Browns', 'Crispy low-carb hash browns made with zucchini', ARRAY['2 zucchini', '1 egg', '2 tbsp almond flour', '1 tsp garlic powder', 'Oil for frying'], ARRAY['Grate and drain zucchini', 'Mix with egg and flour', 'Form patties', 'Fry until crispy'], 'breakfast', 15, 10, 4, 120, 5, 9, 4, 'medium', 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400', true),

('Cauliflower Hash', 'Seasoned cauliflower hash with herbs', ARRAY['1 head cauliflower', '2 tbsp olive oil', '1 onion', '2 cloves garlic', 'Fresh herbs'], ARRAY['Rice cauliflower', 'Sauté onion and garlic', 'Add cauliflower', 'Season with herbs'], 'breakfast', 10, 15, 4, 100, 4, 7, 6, 'easy', 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400', true),

('Pork Rind Cereal', 'Crunchy keto cereal alternative', ARRAY['2 oz pork rinds', '1/2 cup unsweetened almond milk', '1 tbsp heavy cream', 'Stevia to taste'], ARRAY['Crush pork rinds lightly', 'Add to bowl', 'Pour almond milk', 'Add cream and sweetener'], 'breakfast', 5, 0, 1, 180, 12, 14, 2, 'easy', 'https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=400', true),

('Avocado Deviled Eggs', 'Creamy deviled eggs with avocado filling', ARRAY['6 hard-boiled eggs', '1 avocado', '2 tbsp mayo', '1 tsp mustard', 'Paprika'], ARRAY['Halve boiled eggs', 'Mix yolks with avocado', 'Add mayo and mustard', 'Pipe into egg whites'], 'breakfast', 15, 0, 6, 160, 8, 14, 2, 'easy', 'https://images.unsplash.com/photo-1582049833898-b0c3b7a2b5e8?w=400', true),

('Keto Breakfast Pizza', 'Low-carb pizza with egg and cheese base', ARRAY['6 eggs', '1/2 cup mozzarella', '1/4 cup parmesan', '4 slices bacon', 'Pizza toppings'], ARRAY['Beat eggs with cheese', 'Bake as crust at 375°F', 'Add toppings', 'Bake 10 more minutes'], 'breakfast', 15, 20, 4, 380, 26, 28, 4, 'medium', 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400', true),

('Cottage Cheese Bowl', 'High-protein breakfast bowl with cottage cheese', ARRAY['1 cup cottage cheese', '1/4 cup nuts', '2 tbsp seeds', '1 tbsp olive oil', 'Herbs and spices'], ARRAY['Place cottage cheese in bowl', 'Top with nuts and seeds', 'Drizzle with olive oil', 'Season to taste'], 'breakfast', 5, 0, 2, 280, 24, 18, 6, 'easy', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400', true),

('Salmon and Cream Cheese Bagel', 'Keto bagel with smoked salmon', ARRAY['2 keto bagels', '4 oz cream cheese', '4 oz smoked salmon', '1 tbsp capers', 'Red onion'], ARRAY['Toast keto bagels', 'Spread cream cheese', 'Layer with salmon', 'Top with capers and onion'], 'breakfast', 10, 5, 2, 420, 28, 32, 6, 'easy', 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400', true),

('Turkey Sausage Patties', 'Homemade turkey breakfast sausages', ARRAY['1 lb ground turkey', '1 tsp sage', '1 tsp fennel', '1/2 tsp red pepper flakes', 'Salt and pepper'], ARRAY['Mix turkey with spices', 'Form into patties', 'Cook in skillet', 'Serve hot'], 'breakfast', 10, 15, 8, 180, 20, 10, 1, 'easy', 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400', true),

('Green Goddess Smoothie', 'Nutrient-packed green smoothie', ARRAY['1 cup spinach', '1/2 avocado', '1 cup coconut milk', '1 tbsp MCT oil', 'Lemon juice'], ARRAY['Blend all ingredients', 'Add ice if desired', 'Adjust consistency', 'Serve immediately'], 'breakfast', 5, 0, 2, 260, 4, 24, 6, 'easy', 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400', true),

('Eggplant Breakfast Hash', 'Mediterranean-style breakfast hash', ARRAY['1 eggplant', '3 eggs', '1/4 cup olive oil', '1 tomato', 'Fresh basil'], ARRAY['Dice and salt eggplant', 'Sauté until tender', 'Add tomatoes', 'Top with fried eggs'], 'breakfast', 20, 15, 3, 290, 12, 24, 8, 'medium', 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400', true),

('Macadamia Nut Butter Toast', 'Keto bread with macadamia nut butter', ARRAY['2 slices keto bread', '2 tbsp macadamia butter', '1 tbsp coconut flakes', 'Cinnamon'], ARRAY['Toast keto bread', 'Spread nut butter', 'Sprinkle coconut', 'Dust with cinnamon'], 'breakfast', 5, 3, 2, 320, 8, 30, 4, 'easy', 'https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=400', true),

('Breakfast Stuffed Peppers', 'Bell peppers stuffed with eggs and sausage', ARRAY['4 bell peppers', '6 eggs', '1/2 lb sausage', '1/2 cup cheese', 'Herbs'], ARRAY['Hollow out peppers', 'Brown sausage', 'Mix with scrambled eggs', 'Stuff peppers and bake'], 'breakfast', 20, 30, 4, 350, 22, 26, 8, 'medium', 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400', true),

('Keto Breakfast Burrito', 'Low-carb burrito with cauliflower tortilla', ARRAY['1 cauliflower tortilla', '3 eggs', '2 slices bacon', '1/4 cup cheese', '1/4 avocado'], ARRAY['Scramble eggs', 'Cook bacon', 'Warm tortilla', 'Fill and roll up'], 'breakfast', 15, 10, 2, 380, 20, 32, 6, 'medium', 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400', true),

('Nut Butter Fat Bombs', 'High-fat breakfast energy bombs', ARRAY['1/2 cup almond butter', '1/4 cup coconut oil', '2 tbsp cocoa powder', '1 tbsp sweetener'], ARRAY['Melt coconut oil', 'Mix with nut butter', 'Add cocoa and sweetener', 'Pour into molds and chill'], 'breakfast', 10, 0, 12, 150, 4, 14, 3, 'easy', 'https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=400', true),

-- Lunch Category (30 recipes)
('Chicken Caesar Salad', 'Classic Caesar salad with grilled chicken', ARRAY['2 chicken breasts', '4 cups romaine lettuce', '1/4 cup parmesan', '2 tbsp olive oil', 'Caesar dressing'], ARRAY['Grill seasoned chicken', 'Chop romaine lettuce', 'Toss with dressing', 'Top with chicken and parmesan'], 'lunch', 15, 20, 2, 420, 35, 28, 6, 'easy', 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', true),

('Zucchini Noodle Carbonara', 'Low-carb carbonara with zucchini noodles', ARRAY['3 zucchini', '4 eggs', '1/2 cup heavy cream', '6 slices bacon', '1/2 cup parmesan'], ARRAY['Spiralize zucchini', 'Cook bacon until crispy', 'Whisk eggs with cream', 'Toss hot zucchini with egg mixture'], 'lunch', 15, 15, 4, 380, 22, 32, 8, 'medium', 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400', true),

('Avocado Tuna Salad', 'Creamy tuna salad with avocado instead of mayo', ARRAY['2 cans tuna', '2 avocados', '2 celery stalks', '1 red onion', 'Lemon juice'], ARRAY['Drain tuna', 'Mash avocados', 'Dice vegetables', 'Mix all ingredients'], 'lunch', 10, 0, 4, 320, 28, 20, 6, 'easy', 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', true),

('Cauliflower Mac and Cheese', 'Low-carb mac and cheese with cauliflower', ARRAY['1 head cauliflower', '1 cup heavy cream', '2 cups cheese', '2 tbsp butter', 'Spices'], ARRAY['Steam cauliflower florets', 'Make cheese sauce', 'Combine cauliflower with sauce', 'Bake until bubbly'], 'lunch', 20, 25, 6, 290, 12, 24, 8, 'medium', 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400', true),

('Chicken Lettuce Wraps', 'Asian-inspired lettuce wraps with ground chicken', ARRAY['1 lb ground chicken', '1 head butter lettuce', '2 tbsp sesame oil', '2 cloves garlic', 'Green onions'], ARRAY['Cook chicken with seasonings', 'Separate lettuce leaves', 'Fill leaves with chicken', 'Garnish with green onions'], 'lunch', 15, 15, 4, 280, 24, 18, 4, 'easy', 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', true),

('Beef and Broccoli Stir Fry', 'Quick stir fry with tender beef and broccoli', ARRAY['1 lb beef strips', '4 cups broccoli', '3 tbsp coconut oil', '2 tbsp soy sauce', 'Garlic and ginger'], ARRAY['Heat oil in wok', 'Stir fry beef until browned', 'Add broccoli and seasonings', 'Cook until tender-crisp'], 'lunch', 15, 10, 4, 350, 28, 24, 8, 'easy', 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400', true),

('Greek Chicken Bowl', 'Mediterranean bowl with chicken and vegetables', ARRAY['2 chicken thighs', '1 cucumber', '1 cup cherry tomatoes', '1/2 cup olives', 'Feta cheese'], ARRAY['Season and bake chicken', 'Dice vegetables', 'Assemble bowl', 'Top with feta and dressing'], 'lunch', 15, 25, 2, 420, 32, 28, 8, 'medium', 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', true),

('Salmon Avocado Salad', 'Fresh salad with baked salmon and avocado', ARRAY['2 salmon fillets', '2 avocados', '4 cups mixed greens', '1/4 cup olive oil', 'Lemon juice'], ARRAY['Bake seasoned salmon', 'Slice avocados', 'Arrange on greens', 'Drizzle with lemon oil dressing'], 'lunch', 10, 20, 2, 480, 35, 38, 6, 'easy', 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', true),

('Cabbage Roll Soup', 'Deconstructed cabbage rolls in soup form', ARRAY['1 lb ground beef', '1 head cabbage', '2 cups beef broth', '1 can tomatoes', 'Onion and garlic'], ARRAY['Brown beef with onions', 'Add chopped cabbage', 'Pour in broth and tomatoes', 'Simmer until tender'], 'lunch', 20, 30, 6, 250, 20, 16, 8, 'easy', 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400', true),

('Pork Belly BLT Salad', 'BLT flavors in a hearty salad', ARRAY['8 oz pork belly', '6 cups lettuce', '2 tomatoes', '1/2 cup mayo', 'Crispy bacon bits'], ARRAY['Cook pork belly until crispy', 'Chop lettuce and tomatoes', 'Make bacon mayo dressing', 'Toss and serve'], 'lunch', 15, 20, 4, 520, 22, 48, 6, 'medium', 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', true),

('Stuffed Bell Peppers', 'Bell peppers stuffed with ground turkey and cheese', ARRAY['4 bell peppers', '1 lb ground turkey', '1 cup cauliflower rice', '1 cup cheese', 'Italian seasoning'], ARRAY['Hollow out peppers', 'Brown turkey with seasonings', 'Mix with cauliflower rice', 'Stuff peppers and bake'], 'lunch', 20, 35, 4, 320, 26, 20, 8, 'medium', 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400', true),

('Chicken Thigh Curry', 'Rich and creamy coconut curry', ARRAY['6 chicken thighs', '1 can coconut milk', '2 tbsp curry powder', '1 onion', 'Spinach'], ARRAY['Brown chicken thighs', 'Sauté onions with curry', 'Add coconut milk', 'Simmer with spinach'], 'lunch', 15, 25, 4, 420, 28, 34, 6, 'medium', 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400', true),

('Egg Salad Lettuce Cups', 'Classic egg salad served in lettuce cups', ARRAY['8 hard-boiled eggs', '1/4 cup mayo', '2 tbsp mustard', '1 head butter lettuce', 'Paprika'], ARRAY['Chop hard-boiled eggs', 'Mix with mayo and mustard', 'Season to taste', 'Serve in lettuce cups'], 'lunch', 15, 0, 4, 280, 18, 22, 3, 'easy', 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', true),

('Mushroom Risotto', 'Creamy cauliflower risotto with mushrooms', ARRAY['1 head cauliflower', '2 cups mushrooms', '1/2 cup heavy cream', '1/2 cup parmesan', 'White wine'], ARRAY['Rice cauliflower', 'Sauté mushrooms', 'Cook cauliflower with wine', 'Stir in cream and cheese'], 'lunch', 20, 25, 4, 220, 10, 18, 8, 'medium', 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400', true),

('Turkey Club Lettuce Wrap', 'Club sandwich reimagined as lettuce wraps', ARRAY['8 oz sliced turkey', '4 bacon strips', '1 avocado', '2 tomatoes', 'Large lettuce leaves'], ARRAY['Cook bacon until crispy', 'Slice avocado and tomatoes', 'Layer turkey in lettuce', 'Add toppings and wrap'], 'lunch', 15, 10, 4, 340, 28, 24, 6, 'easy', 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', true),

('Shrimp Scampi with Zucchini', 'Garlic butter shrimp over zucchini noodles', ARRAY['1 lb shrimp', '3 zucchini', '4 cloves garlic', '1/4 cup butter', 'White wine'], ARRAY['Spiralize zucchini', 'Sauté garlic in butter', 'Add shrimp and wine', 'Toss with zucchini noodles'], 'lunch', 15, 10, 4, 280, 24, 18, 6, 'easy', 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400', true),

('Beef Taco Salad', 'Mexican-inspired salad with seasoned ground beef', ARRAY['1 lb ground beef', '6 cups lettuce', '1 avocado', '1/2 cup cheese', 'Salsa and sour cream'], ARRAY['Brown beef with taco seasoning', 'Chop lettuce and avocado', 'Layer in bowls', 'Top with condiments'], 'lunch', 15, 15, 4, 420, 28, 32, 8, 'easy', 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', true),

('Chicken Pesto Zoodles', 'Pesto chicken over zucchini noodles', ARRAY['2 chicken breasts', '3 zucchini', '1/4 cup pesto', '2 tbsp olive oil', 'Pine nuts'], ARRAY['Slice and cook chicken', 'Spiralize zucchini', 'Toss chicken with pesto', 'Serve over zoodles'], 'lunch', 15, 15, 4, 380, 32, 26, 6, 'medium', 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400', true),

('Lamb and Spinach Curry', 'Aromatic curry with tender lamb and spinach', ARRAY['1 lb lamb shoulder', '4 cups spinach', '1 can coconut milk', '2 tbsp curry paste', 'Onions'], ARRAY['Brown lamb in chunks', 'Sauté onions with curry paste', 'Add coconut milk', 'Simmer with spinach'], 'lunch', 20, 40, 4, 450, 30, 36, 6, 'medium', 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400', true),

('Buffalo Chicken Salad', 'Spicy buffalo chicken over crisp greens', ARRAY['2 chicken breasts', '1/4 cup buffalo sauce', '6 cups romaine', '1/4 cup blue cheese', 'Celery'], ARRAY['Cook and shred chicken', 'Toss with buffalo sauce', 'Arrange over lettuce', 'Top with cheese and celery'], 'lunch', 15, 20, 2, 360, 34, 24, 6, 'easy', 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', true),

('Pork Chops with Cabbage', 'Pan-seared pork chops with sautéed cabbage', ARRAY['4 pork chops', '1 head cabbage', '2 tbsp olive oil', '1 onion', 'Apple cider vinegar'], ARRAY['Season and sear pork chops', 'Sauté onions and cabbage', 'Deglaze with vinegar', 'Serve together'], 'lunch', 15, 20, 4, 420, 32, 28, 8, 'medium', 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400', true),

('Cobb Salad', 'Classic Cobb salad with all the fixings', ARRAY['6 cups lettuce', '2 chicken breasts', '4 eggs', '6 bacon strips', 'Blue cheese'], ARRAY['Grill chicken and slice', 'Hard boil eggs', 'Cook bacon', 'Arrange all ingredients on lettuce'], 'lunch', 20, 20, 4, 520, 38, 40, 8, 'medium', 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', true),

('Fish Tacos in Lettuce', 'Fresh fish tacos using lettuce as shells', ARRAY['1 lb white fish', '1 head butter lettuce', '1/2 cup cabbage slaw', '1/4 cup lime mayo', 'Cilantro'], ARRAY['Season and grill fish', 'Make lime mayo', 'Prepare cabbage slaw', 'Assemble in lettuce cups'], 'lunch', 15, 15, 4, 280, 26, 18, 6, 'easy', 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', true),

('Italian Sausage and Peppers', 'Classic Italian dish with sausages and bell peppers', ARRAY['1 lb Italian sausages', '3 bell peppers', '1 onion', '2 tbsp olive oil', 'Italian herbs'], ARRAY['Brown sausages whole', 'Slice peppers and onions', 'Sauté vegetables', 'Combine and finish cooking'], 'lunch', 15, 25, 4, 380, 22, 30, 8, 'easy', 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400', true),

('Chicken Alfredo Shirataki', 'Creamy Alfredo with shirataki noodles', ARRAY['2 chicken breasts', '2 packs shirataki noodles', '1/2 cup heavy cream', '1/2 cup parmesan', '2 cloves garlic'], ARRAY['Cook sliced chicken', 'Prepare shirataki noodles', 'Make Alfredo sauce', 'Combine all ingredients'], 'lunch', 15, 20, 4, 420, 36, 30, 6, 'medium', 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400', true),

('Meatball Marinara', 'Italian meatballs in sugar-free marinara sauce', ARRAY['1 lb ground beef', '1 egg', '1/4 cup almond flour', '2 cups marinara sauce', 'Italian seasoning'], ARRAY['Mix beef with egg and flour', 'Form into meatballs', 'Brown in skillet', 'Simmer in marinara sauce'], 'lunch', 20, 25, 6, 320, 24, 22, 6, 'medium', 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400', true),

('Chicken Fajita Bowl', 'Mexican-style chicken bowl with peppers and onions', ARRAY['2 chicken breasts', '2 bell peppers', '1 onion', '2 tbsp fajita seasoning', 'Avocado and lime'], ARRAY['Slice chicken thinly', 'Cut peppers and onions', 'Cook with fajita seasoning', 'Serve with avocado'], 'lunch', 15, 15, 4, 360, 32, 22, 8, 'easy', 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', true),

('Stuffed Portobello Mushrooms', 'Large mushrooms stuffed with cheese and herbs', ARRAY['4 large portobello caps', '1 cup ricotta cheese', '1/2 cup mozzarella', '2 tbsp fresh herbs', 'Garlic'], ARRAY['Remove mushroom stems', 'Mix cheese with herbs', 'Stuff mushroom caps', 'Bake until melted'], 'lunch', 15, 20, 4, 220, 16, 16, 6, 'easy', 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400', true),

('Vietnamese Beef Salad', 'Fresh Vietnamese-style beef salad with herbs', ARRAY['1 lb beef sirloin', '6 cups mixed greens', '1/4 cup fresh herbs', '2 tbsp fish sauce', 'Lime juice'], ARRAY['Quickly sear beef rare', 'Slice thinly', 'Toss with herbs and greens', 'Dress with fish sauce and lime'], 'lunch', 15, 10, 4, 320, 28, 20, 6, 'medium', 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', true),

('Keto Chili', 'Hearty chili without beans, full of flavor', ARRAY['2 lbs ground beef', '1 can tomatoes', '2 tbsp chili powder', '1 onion', '2 bell peppers'], ARRAY['Brown beef with onions', 'Add peppers and spices', 'Stir in tomatoes', 'Simmer for 30 minutes'], 'lunch', 20, 30, 8, 280, 22, 18, 8, 'easy', 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400', true),

-- Dinner Category (30 recipes)
('Ribeye Steak with Garlic Butter', 'Perfectly cooked ribeye with herb garlic butter', ARRAY['2 ribeye steaks', '4 tbsp butter', '3 cloves garlic', 'Fresh thyme', 'Salt and pepper'], ARRAY['Season steaks generously', 'Sear in hot skillet', 'Add butter and herbs', 'Baste and rest before serving'], 'dinner', 10, 15, 2, 680, 52, 54, 2, 'medium', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', true),

('Lemon Herb Salmon', 'Baked salmon with lemon and fresh herbs', ARRAY['4 salmon fillets', '2 lemons', '2 tbsp olive oil', 'Fresh dill', 'Asparagus'], ARRAY['Preheat oven to 400°F', 'Season salmon with herbs', 'Arrange with asparagus', 'Bake for 18-20 minutes'], 'dinner', 15, 20, 4, 420, 38, 28, 6, 'easy', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', true),

('Chicken Parmesan', 'Crispy almond flour crusted chicken with cheese', ARRAY['4 chicken breasts', '1 cup almond flour', '2 eggs', '1 cup marinara', '1 cup mozzarella'], ARRAY['Pound chicken thin', 'Dredge in flour and egg', 'Pan fry until golden', 'Top with sauce and cheese'], 'dinner', 20, 25, 4, 520, 48, 32, 8, 'medium', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', true),

('Lamb Chops with Rosemary', 'Pan-seared lamb chops with garlic and rosemary', ARRAY['8 lamb chops', '3 cloves garlic', '2 sprigs rosemary', '2 tbsp olive oil', 'Sea salt'], ARRAY['Marinate chops with herbs', 'Heat olive oil in pan', 'Sear chops 3-4 minutes per side', 'Rest and serve'], 'dinner', 15, 10, 4, 480, 42, 34, 2, 'medium', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', true),

('Pork Tenderloin with Mushrooms', 'Tender pork with creamy mushroom sauce', ARRAY['2 pork tenderloins', '8 oz mushrooms', '1/2 cup heavy cream', '2 tbsp butter', 'Fresh thyme'], ARRAY['Sear pork until golden', 'Sauté mushrooms', 'Add cream and herbs', 'Slice pork and serve with sauce'], 'dinner', 15, 25, 4, 420, 36, 28, 6, 'medium', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', true),

('Seafood Paella', 'Keto-friendly paella with cauliflower rice', ARRAY['1 lb mixed seafood', '1 head cauliflower', '1 bell pepper', '1/4 cup olive oil', 'Saffron'], ARRAY['Rice cauliflower', 'Sauté seafood', 'Cook vegetables', 'Combine with saffron and seasonings'], 'dinner', 25, 20, 6, 380, 32, 24, 8, 'hard', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', true),

('Beef Short Ribs', 'Slow-braised short ribs in red wine sauce', ARRAY['3 lbs short ribs', '2 cups red wine', '2 onions', '4 carrots', 'Fresh herbs'], ARRAY['Season and brown ribs', 'Sauté vegetables', 'Add wine and herbs', 'Braise for 3 hours'], 'dinner', 30, 180, 6, 620, 45, 48, 8, 'hard', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', true),

('Duck Confit', 'Traditional French duck confit', ARRAY['4 duck legs', '2 cups duck fat', '4 garlic cloves', '2 bay leaves', 'Coarse salt'], ARRAY['Cure duck with salt overnight', 'Slow cook in fat', 'Crisp skin before serving', 'Serve with greens'], 'dinner', 1440, 120, 4, 720, 38, 68, 2, 'hard', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', true),

('Grilled Octopus', 'Mediterranean-style grilled octopus', ARRAY['2 lbs octopus', '1/4 cup olive oil', '2 lemons', '2 tbsp oregano', 'Sea salt'], ARRAY['Tenderize octopus', 'Boil until tender', 'Grill for char marks', 'Dress with oil and lemon'], 'dinner', 30, 45, 4, 320, 58, 8, 4, 'hard', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', true),

('Stuffed Chicken Thighs', 'Chicken thighs stuffed with spinach and cheese', ARRAY['6 chicken thighs', '2 cups spinach', '4 oz cream cheese', '1/2 cup sun-dried tomatoes', 'Herbs'], ARRAY['Butterfly chicken thighs', 'Mix spinach with cheese', 'Stuff and secure', 'Bake at 375°F for 35 minutes'], 'dinner', 25, 35, 6, 460, 38, 32, 6, 'medium', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', true),

('Osso Buco', 'Italian braised veal shanks', ARRAY['4 veal shanks', '2 cups white wine', '2 onions', '2 carrots', 'Gremolata'], ARRAY['Brown veal shanks', 'Sauté mirepoix', 'Add wine and simmer', 'Braise for 2 hours'], 'dinner', 30, 120, 4, 580, 48, 38, 8, 'hard', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', true),

('Lobster Thermidor', 'Classic French lobster in cream sauce', ARRAY['2 lobster tails', '1/2 cup heavy cream', '2 tbsp butter', '1/4 cup gruyere', 'Mustard'], ARRAY['Split lobster tails', 'Make cream sauce', 'Fill shells with mixture', 'Broil until golden'], 'dinner', 25, 20, 2, 480, 42, 32, 4, 'hard', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', true),

('Rack of Lamb', 'Herb-crusted rack of lamb', ARRAY['2 lamb racks', '1/4 cup herbs', '2 tbsp mustard', '1/4 cup almond flour', 'Garlic'], ARRAY['Season lamb racks', 'Sear all sides', 'Brush with mustard', 'Coat with herb crust and roast'], 'dinner', 20, 25, 4, 520, 44, 38, 4, 'medium', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', true),

('Prime Rib Roast', 'Perfect prime rib with horseradish cream', ARRAY['5 lb prime rib', '2 tbsp herbs', '1 cup sour cream', '3 tbsp horseradish', 'Salt and pepper'], ARRAY['Season roast overnight', 'Roast at 325°F', 'Use meat thermometer', 'Rest before carving'], 'dinner', 1440, 180, 8, 680, 52, 56, 2, 'medium', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', true),

('Coq au Vin', 'French chicken braised in red wine', ARRAY['1 whole chicken', '2 cups red wine', '8 oz bacon', '1 lb mushrooms', 'Pearl onions'], ARRAY['Brown chicken pieces', 'Cook bacon and vegetables', 'Add wine and simmer', 'Braise until tender'], 'dinner', 30, 90, 6, 520, 42, 32, 8, 'hard', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', true),

('Chilean Sea Bass', 'Pan-seared sea bass with lemon butter', ARRAY['4 sea bass fillets', '4 tbsp butter', '2 lemons', 'Capers', 'Fresh parsley'], ARRAY['Pat fish dry and season', 'Sear skin-side down first', 'Flip and add butter', 'Finish with lemon and capers'], 'dinner', 15, 12, 4, 380, 36, 26, 2, 'medium', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', true),

('Beef Wellington', 'Beef tenderloin wrapped in puff pastry', ARRAY['2 lb beef tenderloin', '8 oz mushrooms', '4 oz pâté', 'Prosciutto', 'Keto pastry'], ARRAY['Sear beef all over', 'Make mushroom duxelles', 'Wrap with pâté and prosciutto', 'Encase in pastry and bake'], 'dinner', 60, 45, 6, 720, 48, 58, 8, 'hard', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', true),

('Bouillabaisse', 'Traditional French fish stew', ARRAY['2 lbs mixed fish', '1 lb mussels', '4 cups fish stock', '1/4 cup olive oil', 'Saffron'], ARRAY['Prepare fish and shellfish', 'Make aromatic base', 'Add stock and saffron', 'Simmer until cooked'], 'dinner', 45, 30, 6, 420, 48, 18, 8, 'hard', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', true),

('Venison Medallions', 'Pan-seared venison with juniper berry sauce', ARRAY['2 lbs venison loin', '1 cup red wine', '2 tbsp juniper berries', '2 tbsp butter', 'Shallots'], ARRAY['Season venison medallions', 'Sear quickly on high heat', 'Make pan sauce', 'Serve medium-rare'], 'dinner', 20, 15, 4, 480, 52, 28, 4, 'medium', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', true),

('Stuffed Pork Loin', 'Pork loin stuffed with herbs and cheese', ARRAY['3 lb pork loin', '1 cup spinach', '4 oz goat cheese', '2 tbsp herbs', 'Kitchen twine'], ARRAY['Butterfly pork loin', 'Spread filling evenly', 'Roll and tie securely', 'Roast at 375°F until done'], 'dinner', 30, 60, 8, 420, 38, 26, 4, 'medium', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', true),

('Surf and Turf', 'Filet mignon with lobster tail', ARRAY['4 filet mignon steaks', '4 lobster tails', '4 tbsp butter', 'Garlic', 'Fresh herbs'], ARRAY['Season steaks well', 'Grill to desired doneness', 'Steam lobster tails', 'Serve with herb butter'], 'dinner', 20, 20, 4, 620, 56, 44, 2, 'medium', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', true),

('Moroccan Lamb Tagine', 'Slow-cooked lamb with North African spices', ARRAY['2 lbs lamb shoulder', '2 onions', '1 cup olives', '2 tbsp ras el hanout', 'Preserved lemons'], ARRAY['Brown lamb in tagine', 'Add onions and spices', 'Slow cook for 2 hours', 'Finish with olives and lemon'], 'dinner', 30, 120, 6, 480, 42, 32, 8, 'medium', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', true),

('Duck à l''Orange', 'Classic French duck with orange sauce', ARRAY['1 whole duck', '4 oranges', '2 tbsp honey substitute', '1 cup chicken stock', 'Grand Marnier'], ARRAY['Roast duck until crispy', 'Make orange reduction', 'Glaze duck with sauce', 'Serve with remaining sauce'], 'dinner', 30, 120, 4, 680, 45, 54, 12, 'hard', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', true),

('Cioppino', 'San Francisco-style seafood stew', ARRAY['2 lbs mixed seafood', '2 cups tomatoes', '1 cup white wine', '1/4 cup olive oil', 'Fresh herbs'], ARRAY['Sauté aromatics', 'Add tomatoes and wine', 'Simmer sauce', 'Add seafood and cook until done'], 'dinner', 30, 25, 6, 380, 44, 16, 10, 'medium', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', true),

('Beef Bourguignon', 'Classic French beef stew in red wine', ARRAY['3 lbs beef chuck', '1 bottle red wine', '8 oz bacon', '1 lb mushrooms', 'Pearl onions'], ARRAY['Brown beef and bacon', 'Add wine and stock', 'Braise for 3 hours', 'Add vegetables in last hour'], 'dinner', 45, 180, 8, 520, 45, 32, 8, 'hard', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', true),

('Paella Valenciana', 'Traditional Spanish paella with rabbit and chicken', ARRAY['1 rabbit', '1 chicken', '2 cups cauliflower rice', '1 cup green beans', 'Saffron'], ARRAY['Brown meats', 'Add vegetables', 'Stir in cauliflower rice', 'Season with saffron and simmer'], 'dinner', 30, 40, 8, 420, 38, 26, 8, 'hard', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', true),

('Whole Roasted Chicken', 'Herb-roasted chicken with crispy skin', ARRAY['1 whole chicken', '2 tbsp herbs', '2 tbsp butter', '1 lemon', 'Root vegetables'], ARRAY['Season chicken inside and out', 'Stuff with lemon and herbs', 'Roast at 425°F', 'Rest before carving'], 'dinner', 20, 75, 6, 480, 42, 32, 6, 'easy', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', true),

('Fish en Papillote', 'Fish baked in parchment with vegetables', ARRAY['4 fish fillets', '2 zucchini', '1 bell pepper', '2 tbsp olive oil', 'Fresh herbs'], ARRAY['Slice vegetables thinly', 'Season fish', 'Wrap in parchment packets', 'Bake at 400°F for 15 minutes'], 'dinner', 20, 15, 4, 320, 36, 18, 6, 'medium', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', true),

('Braised Oxtail', 'Rich and tender braised oxtail', ARRAY['3 lbs oxtail', '2 cups red wine', '2 onions', '4 carrots', 'Bay leaves'], ARRAY['Brown oxtail pieces', 'Sauté vegetables', 'Add wine and stock', 'Braise for 4 hours'], 'dinner', 30, 240, 6, 620, 48, 45, 8, 'hard', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', true),

('Turbot with Hollandaise', 'Pan-seared turbot with classic hollandaise sauce', ARRAY['4 turbot fillets', '4 egg yolks', '1/2 cup butter', '2 lemons', 'White pepper'], ARRAY['Make hollandaise sauce', 'Season and sear fish', 'Cook until flaky', 'Serve with warm sauce'], 'dinner', 25, 15, 4, 420, 38, 34, 2, 'hard', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', true),

-- Snacks Category (30 recipes)
('Avocado Deviled Eggs', 'Creamy deviled eggs with avocado twist', ARRAY['6 hard-boiled eggs', '1 ripe avocado', '2 tbsp mayo', '1 tsp mustard', 'Paprika'], ARRAY['Halve boiled eggs', 'Mash yolks with avocado', 'Mix in mayo and mustard', 'Pipe into egg whites'], 'snacks', 15, 0, 6, 160, 8, 14, 2, 'easy', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400', true),

('Cheese Crisps', 'Baked parmesan crisps for crunchy snacking', ARRAY['2 cups grated parmesan', '1 tsp garlic powder', '1/2 tsp paprika', 'Black pepper'], ARRAY['Preheat oven to 400°F', 'Mix cheese with seasonings', 'Spread on baking sheet', 'Bake until golden and crispy'], 'snacks', 5, 10, 8, 110, 10, 8, 1, 'easy', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400', true),

('Bacon-Wrapped Asparagus', 'Tender asparagus wrapped in crispy bacon', ARRAY['20 asparagus spears', '10 bacon strips', 'Black pepper', 'Olive oil'], ARRAY['Wrap 2 asparagus spears with bacon', 'Secure with toothpicks', 'Brush with oil', 'Bake at 400°F for 15 minutes'], 'snacks', 10, 15, 10, 140, 8, 12, 2, 'easy', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400', true),

('Stuffed Mushrooms', 'Button mushrooms stuffed with cream cheese and herbs', ARRAY['12 large mushrooms', '4 oz cream cheese', '2 tbsp chives', '1/4 cup parmesan', 'Garlic powder'], ARRAY['Remove mushroom stems', 'Mix cream cheese with herbs', 'Stuff mushroom caps', 'Bake at 375°F for 20 minutes'], 'snacks', 15, 20, 12, 80, 4, 6, 2, 'easy', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400', true),

('Cucumber Roll-ups', 'Fresh cucumber rolled with cream cheese and deli meat', ARRAY['2 large cucumbers', '4 oz cream cheese', '8 slices deli turkey', 'Fresh dill'], ARRAY['Slice cucumbers lengthwise', 'Spread with cream cheese', 'Add turkey and herbs', 'Roll up and secure'], 'snacks', 15, 0, 8, 90, 6, 6, 3, 'easy', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400', true),

('Olive Tapenade', 'Mediterranean olive spread with herbs', ARRAY['2 cups mixed olives', '2 tbsp capers', '3 cloves garlic', '1/4 cup olive oil', 'Fresh herbs'], ARRAY['Pulse olives and capers', 'Add garlic and herbs', 'Drizzle in olive oil', 'Serve with cheese or vegetables'], 'snacks', 10, 0, 8, 120, 1, 12, 2, 'easy', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400', true),

('Pork Rinds with Guacamole', 'Crunchy pork rinds with fresh guacamole', ARRAY['2 oz pork rinds', '2 ripe avocados', '1 lime', '1/4 red onion', 'Jalapeño'], ARRAY['Mash avocados with lime', 'Dice onion and jalapeño', 'Mix into guacamole', 'Serve with pork rinds'], 'snacks', 10, 0, 4, 280, 14, 24, 6, 'easy', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400', true),

('Keto Fat Bombs', 'Chocolate peanut butter fat bombs', ARRAY['1/2 cup coconut oil', '1/2 cup peanut butter', '2 tbsp cocoa powder', '2 tbsp sweetener'], ARRAY['Melt coconut oil', 'Mix with peanut butter', 'Add cocoa and sweetener', 'Pour into molds and chill'], 'snacks', 10, 0, 12, 180, 3, 18, 3, 'easy', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400', true),

('Caprese Skewers', 'Cherry tomatoes, mozzarella, and basil on skewers', ARRAY['20 cherry tomatoes', '20 mozzarella balls', '20 basil leaves', '2 tbsp balsamic vinegar', 'Toothpicks'], ARRAY['Thread tomato, cheese, and basil', 'Arrange on platter', 'Drizzle with balsamic', 'Serve immediately'], 'snacks', 15, 0, 10, 60, 4, 4, 3, 'easy', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400', true),

('Smoked Salmon Bites', 'Cucumber rounds topped with smoked salmon', ARRAY['2 cucumbers', '6 oz smoked salmon', '4 oz cream cheese', '1 tbsp capers', 'Fresh dill'], ARRAY['Slice cucumbers thick', 'Top with cream cheese', 'Add salmon and capers', 'Garnish with dill'], 'snacks', 15, 0, 12, 80, 6, 5, 2, 'easy', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400', true),

('Almond Butter Celery', 'Celery sticks filled with almond butter', ARRAY['6 celery stalks', '1/4 cup almond butter', '2 tbsp chopped almonds', 'Cinnamon'], ARRAY['Wash and cut celery', 'Fill with almond butter', 'Sprinkle with almonds', 'Dust with cinnamon'], 'snacks', 10, 0, 6, 120, 4, 10, 3, 'easy', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400', true),

('Zucchini Chips', 'Baked zucchini chips with parmesan', ARRAY['2 zucchini', '1/2 cup parmesan', '1 tsp garlic powder', '1/2 tsp paprika', 'Olive oil spray'], ARRAY['Slice zucchini thinly', 'Toss with cheese and spices', 'Arrange on baking sheet', 'Bake until crispy'], 'snacks', 15, 25, 6, 80, 5, 5, 3, 'medium', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400', true),

('Beef Jerky', 'Homemade sugar-free beef jerky', ARRAY['2 lbs lean beef', '1/4 cup soy sauce', '2 tbsp liquid smoke', '1 tsp garlic powder', 'Black pepper'], ARRAY['Slice beef thinly', 'Marinate overnight', 'Arrange on dehydrator', 'Dry for 8-12 hours'], 'snacks', 1440, 720, 16, 70, 12, 1, 1, 'medium', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400', true),

('Pepperoni Chips', 'Crispy baked pepperoni slices', ARRAY['6 oz pepperoni slices', 'Black pepper'], ARRAY['Arrange pepperoni on baking sheet', 'Bake at 425°F for 8-10 minutes', 'Drain on paper towels', 'Season with pepper'], 'snacks', 5, 10, 6, 140, 6, 12, 1, 'easy', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400', true),

('Keto Crackers', 'Seed and nut crackers for dipping', ARRAY['1 cup almond flour', '1/4 cup flax seeds', '1/4 cup pumpkin seeds', '1 egg', 'Salt'], ARRAY['Mix dry ingredients', 'Beat in egg', 'Roll thin between parchment', 'Bake until crispy'], 'snacks', 15, 20, 20, 90, 4, 7, 2, 'medium', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400', true),

('Buffalo Cauliflower Bites', 'Spicy buffalo cauliflower with ranch', ARRAY['1 head cauliflower', '1/2 cup buffalo sauce', '2 tbsp butter', '1/4 cup ranch dressing'], ARRAY['Cut cauliflower into florets', 'Toss with buffalo sauce', 'Roast until tender', 'Serve with ranch'], 'snacks', 15, 25, 6, 120, 3, 8, 6, 'easy', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400', true),

('Prosciutto-Wrapped Melon', 'Sweet cantaloupe wrapped in salty prosciutto', ARRAY['1 small cantaloupe', '12 slices prosciutto', 'Fresh basil', 'Black pepper'], ARRAY['Cut melon into wedges', 'Wrap each with prosciutto', 'Garnish with basil', 'Season with pepper'], 'snacks', 15, 0, 12, 80, 4, 3, 6, 'easy', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400', true),

('Spinach and Artichoke Dip', 'Creamy hot dip with vegetables for dipping', ARRAY['2 cups spinach', '1 cup artichokes', '8 oz cream cheese', '1/2 cup mayo', '1 cup mozzarella'], ARRAY['Chop spinach and artichokes', 'Mix with cream cheese', 'Fold in mayo and cheese', 'Bake until bubbly'], 'snacks', 15, 25, 8, 180, 6, 16, 4, 'easy', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400', true),

('Keto Meatballs', 'Mini meatballs for snacking', ARRAY['1 lb ground beef', '1 egg', '1/4 cup almond flour', '2 tbsp herbs', 'Marinara sauce'], ARRAY['Mix beef with egg and flour', 'Add herbs and seasonings', 'Form mini balls', 'Bake and serve with sauce'], 'snacks', 15, 20, 20, 120, 8, 8, 2, 'easy', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400', true),

('Coconut Shrimp', 'Coconut-crusted shrimp for dipping', ARRAY['1 lb shrimp', '1 cup coconut flakes', '2 eggs', '1/2 cup almond flour', 'Dipping sauce'], ARRAY['Peel and devein shrimp', 'Set up breading station', 'Coat shrimp in sequence', 'Fry until golden'], 'snacks', 20, 15, 20, 140, 12, 8, 4, 'medium', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400', true),

('Radish Chips', 'Crispy baked radish chips', ARRAY['2 bunches radishes', '2 tbsp olive oil', '1 tsp salt', '1/2 tsp garlic powder'], ARRAY['Slice radishes thinly', 'Toss with oil and seasonings', 'Arrange on baking sheet', 'Bake until crispy'], 'snacks', 15, 30, 8, 60, 1, 5, 2, 'easy', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400', true),

('Jalapeño Poppers', 'Spicy jalapeños stuffed with cheese and bacon', ARRAY['12 jalapeños', '8 oz cream cheese', '1 cup cheddar', '6 strips bacon', 'Toothpicks'], ARRAY['Halve and seed jalapeños', 'Mix cheeses', 'Stuff peppers', 'Wrap with bacon and bake'], 'snacks', 20, 25, 12, 160, 8, 14, 3, 'medium', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400', true),

('Cauliflower Hummus', 'Low-carb hummus made with cauliflower', ARRAY['1 head cauliflower', '1/4 cup tahini', '2 cloves garlic', '2 tbsp lemon juice', 'Olive oil'], ARRAY['Steam cauliflower until tender', 'Blend with tahini and garlic', 'Add lemon juice', 'Drizzle with olive oil'], 'snacks', 15, 20, 8, 80, 3, 6, 4, 'easy', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400', true),

('Macadamia Nuts', 'Roasted macadamia nuts with sea salt', ARRAY['2 cups macadamia nuts', '1 tbsp coconut oil', '1 tsp sea salt', 'Rosemary'], ARRAY['Toss nuts with oil', 'Spread on baking sheet', 'Roast until golden', 'Season with salt and herbs'], 'snacks', 5, 15, 8, 220, 3, 22, 2, 'easy', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400', true),

('Egg Salad Cucumber Boats', 'Egg salad served in cucumber boats', ARRAY['4 hard-boiled eggs', '2 cucumbers', '2 tbsp mayo', '1 tsp mustard', 'Paprika'], ARRAY['Halve cucumbers lengthwise', 'Scoop out centers', 'Make egg salad', 'Fill cucumber boats'], 'snacks', 15, 0, 8, 100, 6, 8, 3, 'easy', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400', true),

('Keto Cookies', 'Almond flour chocolate chip cookies', ARRAY['2 cups almond flour', '1/2 cup sugar substitute', '1/4 cup butter', '1 egg', 'Sugar-free chocolate chips'], ARRAY['Cream butter and sweetener', 'Add egg and flour', 'Fold in chocolate chips', 'Bake until golden'], 'snacks', 15, 12, 24, 120, 4, 10, 3, 'easy', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400', true),

('Seaweed Snacks', 'Roasted seaweed sheets with sesame oil', ARRAY['10 nori sheets', '2 tbsp sesame oil', '1 tsp sea salt', 'Sesame seeds'], ARRAY['Brush nori with oil', 'Sprinkle with salt', 'Toast until crispy', 'Cut into strips'], 'snacks', 10, 5, 10, 30, 2, 1, 1, 'easy', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400', true),

('Avocado Chocolate Mousse', 'Rich chocolate mousse made with avocado', ARRAY['2 ripe avocados', '1/4 cup cocoa powder', '1/4 cup sweetener', '1 tsp vanilla', 'Heavy cream'], ARRAY['Blend avocados until smooth', 'Add cocoa and sweetener', 'Whip cream separately', 'Fold together and chill'], 'snacks', 15, 0, 4, 180, 3, 16, 8, 'easy', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400', true),

('Pickled Eggs', 'Tangy pickled eggs for snacking', ARRAY['12 hard-boiled eggs', '2 cups white vinegar', '1 cup water', '2 tbsp salt', 'Pickling spices'], ARRAY['Peel hard-boiled eggs', 'Heat vinegar solution', 'Add spices', 'Pour over eggs and refrigerate'], 'snacks', 30, 0, 12, 80, 6, 5, 1, 'easy', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400', true),

('Keto Granola Bars', 'No-bake granola bars with nuts and seeds', ARRAY['1 cup almonds', '1/2 cup pumpkin seeds', '1/4 cup chia seeds', '1/4 cup almond butter', 'Coconut oil'], ARRAY['Chop nuts coarsely', 'Mix all dry ingredients', 'Bind with nut butter', 'Press into pan and chill'], 'snacks', 20, 0, 12, 160, 6, 14, 4, 'easy', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400', true);

-- Update community_members table to include user_id as UUID
ALTER TABLE community_members 
ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

-- Update community_posts table user_id column
ALTER TABLE community_posts 
ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

-- Update community_comments table user_id column  
ALTER TABLE community_comments 
ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

-- Update community_likes table user_id column
ALTER TABLE community_likes 
ALTER COLUMN user_id TYPE uuid USING user_id::uuid;