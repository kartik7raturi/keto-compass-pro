-- Create a view to simplify recipe reviews queries
CREATE OR REPLACE VIEW recipe_reviews_with_profiles AS
SELECT 
  rr.*,
  p.display_name,
  p.avatar_url
FROM recipe_reviews rr
LEFT JOIN profiles p ON rr.user_id = p.user_id;