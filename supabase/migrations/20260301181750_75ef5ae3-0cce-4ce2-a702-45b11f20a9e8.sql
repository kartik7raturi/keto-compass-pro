
ALTER TABLE public.food_listings 
ADD COLUMN IF NOT EXISTS delivery_type text NOT NULL DEFAULT 'takeaway',
ADD COLUMN IF NOT EXISTS google_maps_link text,
ADD COLUMN IF NOT EXISTS food_tag text NOT NULL DEFAULT 'non-veg';
