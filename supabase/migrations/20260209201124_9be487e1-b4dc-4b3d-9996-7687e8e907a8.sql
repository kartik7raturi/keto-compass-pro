
-- Clean up remaining old group_members policies
DROP POLICY IF EXISTS "Users can join public groups" ON public.group_members;
DROP POLICY IF EXISTS "Owners can remove members" ON public.group_members;
DROP POLICY IF EXISTS "Users can leave groups" ON public.group_members;

-- Recreate clean delete policy
CREATE POLICY "Users or owners can remove members" ON public.group_members 
FOR DELETE USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM public.user_groups g WHERE g.id = group_members.group_id AND g.owner_id = auth.uid())
);

-- Add country column to food_listings if not exists
ALTER TABLE public.food_listings ADD COLUMN IF NOT EXISTS country text DEFAULT 'USA';

-- Allow sellers to also view their own unavailable listings
DROP POLICY IF EXISTS "Anyone can view available listings" ON public.food_listings;
CREATE POLICY "View available or own listings" ON public.food_listings 
FOR SELECT USING (is_available = true OR auth.uid() = seller_id);
