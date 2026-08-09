
REVOKE SELECT ON public.food_listings FROM anon;
GRANT SELECT (
  id, seller_id, title, description, price, quantity, category, is_vegetarian,
  calories, carbs, protein, fat, ingredients, image_url, country, state, city, town,
  latitude, longitude, is_available, is_sold_out, delivery_type, google_maps_link,
  food_tag, is_verified, views_count, view_count, keto_certified,
  delivery_radius_km, min_order_amount, created_at, updated_at
) ON public.food_listings TO anon;
