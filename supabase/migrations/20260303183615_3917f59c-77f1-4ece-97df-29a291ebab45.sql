
-- Create food listing reviews/ratings table
CREATE TABLE public.food_listing_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.food_listings(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL,
  reviewer_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(listing_id, reviewer_id)
);

ALTER TABLE public.food_listing_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view reviews
CREATE POLICY "Anyone can view food reviews"
ON public.food_listing_reviews FOR SELECT
USING (true);

-- Authenticated users can create reviews (not for own listings)
CREATE POLICY "Users can create food reviews"
ON public.food_listing_reviews FOR INSERT TO authenticated
WITH CHECK (auth.uid() = reviewer_id);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
ON public.food_listing_reviews FOR UPDATE TO authenticated
USING (auth.uid() = reviewer_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews"
ON public.food_listing_reviews FOR DELETE TO authenticated
USING (auth.uid() = reviewer_id);
