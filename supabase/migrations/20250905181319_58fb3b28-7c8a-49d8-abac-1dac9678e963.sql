-- Insert sample keto articles for the knowledge hub
INSERT INTO articles (user_id, title, slug, content, excerpt, category, is_published, featured_image_url, tags) VALUES
-- Generate a dummy user_id for system articles
(gen_random_uuid(), 'The Complete Keto Beginner''s Guide', 'keto-beginners-guide', 'A comprehensive guide to starting your ketogenic journey...', 'Everything you need to know to start keto successfully', 'beginner', true, 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', ARRAY['keto', 'beginner', 'guide']),

(gen_random_uuid(), 'Intermittent Fasting and Keto: The Perfect Combination', 'intermittent-fasting-keto', 'How to combine intermittent fasting with ketogenic diet for maximum results...', 'Learn how IF and keto work together for accelerated fat loss', 'nutrition', true, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', ARRAY['intermittent fasting', 'keto', 'fat loss']),

(gen_random_uuid(), 'Keto Meal Prep: Save Time and Stay on Track', 'keto-meal-prep-tips', 'Essential meal prep strategies for keto success...', 'Time-saving meal prep tips to keep you in ketosis', 'meal-planning', true, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', ARRAY['meal prep', 'keto', 'planning']),

(gen_random_uuid(), 'Signs You''re in Ketosis: What to Look For', 'ketosis-signs-symptoms', 'Understanding the physical and mental signs of ketosis...', 'Recognize when your body has entered the fat-burning state', 'beginner', true, 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', ARRAY['ketosis', 'signs', 'health']),

(gen_random_uuid(), 'Beating the Keto Flu: Natural Remedies That Work', 'keto-flu-remedies', 'Effective strategies to overcome keto flu symptoms...', 'Natural ways to ease the transition into ketosis', 'tips', true, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', ARRAY['keto flu', 'remedies', 'health']),

(gen_random_uuid(), 'Best Keto Snacks for On-the-Go', 'best-keto-snacks', 'Portable keto snacks that fit your macros...', 'Quick and easy keto snack ideas for busy lifestyles', 'nutrition', true, 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', ARRAY['snacks', 'keto', 'convenience']),

(gen_random_uuid(), 'Calculating Your Keto Macros: A Simple Guide', 'keto-macros-calculator', 'How to determine your perfect keto macro ratios...', 'Master your macros for optimal ketogenic results', 'advanced', true, 'https://images.unsplash.com/photo-1434681363164-4440ce88c9cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', ARRAY['macros', 'calculator', 'nutrition']),

(gen_random_uuid(), 'Eating Out on Keto: Restaurant Survival Guide', 'eating-out-on-keto', 'Navigate restaurant menus while staying keto...', 'Tips for maintaining ketosis when dining out', 'tips', true, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', ARRAY['dining out', 'restaurants', 'keto']),

(gen_random_uuid(), 'Essential Keto Supplements: What You Need', 'keto-supplements-guide', 'Science-backed supplements for keto success...', 'The most effective supplements to support your keto journey', 'advanced', true, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', ARRAY['supplements', 'keto', 'health']),

(gen_random_uuid(), 'Long-term Keto Success: Making it Sustainable', 'long-term-keto-success', 'Strategies for maintaining keto as a lifestyle...', 'How to make keto work for you in the long run', 'advanced', true, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', ARRAY['lifestyle', 'sustainability', 'long-term']);