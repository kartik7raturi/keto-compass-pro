-- Create function to increment recipe upvotes
CREATE OR REPLACE FUNCTION public.increment_recipe_upvotes(recipe_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.user_recipes
  SET upvotes = upvotes + 1
  WHERE id = recipe_id;
END;
$$;

-- Create function to decrement recipe upvotes
CREATE OR REPLACE FUNCTION public.decrement_recipe_upvotes(recipe_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.user_recipes
  SET upvotes = GREATEST(0, upvotes - 1)
  WHERE id = recipe_id;
END;
$$;