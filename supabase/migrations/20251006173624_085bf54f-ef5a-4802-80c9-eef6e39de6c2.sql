-- Add foreign key to recipe_reviews table
ALTER TABLE public.recipe_reviews
ADD CONSTRAINT recipe_reviews_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;