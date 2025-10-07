-- Update RLS policy to allow viewing all user recipes
DROP POLICY IF EXISTS "Anyone can view approved user recipes" ON user_recipes;

CREATE POLICY "Anyone can view user recipes"
ON user_recipes
FOR SELECT
TO public
USING (true);