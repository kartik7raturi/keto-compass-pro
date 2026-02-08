-- Fix infinite recursion in group_members RLS policy
DROP POLICY IF EXISTS "Members can view group members" ON public.group_members;

-- Create a simpler policy that doesn't cause recursion
CREATE POLICY "Members can view group members" 
ON public.group_members 
FOR SELECT 
USING (
  -- User can see their own memberships
  auth.uid() = user_id 
  OR 
  -- User can see members of public groups
  EXISTS (
    SELECT 1 FROM user_groups g 
    WHERE g.id = group_members.group_id 
    AND g.is_public = true
  )
  OR
  -- User can see members of groups they own
  EXISTS (
    SELECT 1 FROM user_groups g 
    WHERE g.id = group_members.group_id 
    AND g.owner_id = auth.uid()
  )
);

-- Add username field to profiles for custom usernames
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Create index for username searches
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Create marketplace listings table for Ketopia
CREATE TABLE IF NOT EXISTS public.food_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1,
  category TEXT NOT NULL DEFAULT 'meal',
  is_vegetarian BOOLEAN DEFAULT false,
  calories INTEGER,
  carbs INTEGER,
  protein INTEGER,
  fat INTEGER,
  ingredients TEXT[],
  image_url TEXT,
  state TEXT,
  city TEXT,
  town TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  is_available BOOLEAN DEFAULT true,
  is_sold_out BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on food_listings
ALTER TABLE public.food_listings ENABLE ROW LEVEL SECURITY;

-- Policies for food_listings
CREATE POLICY "Anyone can view available listings" 
ON public.food_listings 
FOR SELECT 
USING (is_available = true);

CREATE POLICY "Users can create their own listings" 
ON public.food_listings 
FOR INSERT 
WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update their own listings" 
ON public.food_listings 
FOR UPDATE 
USING (auth.uid() = seller_id);

CREATE POLICY "Users can delete their own listings" 
ON public.food_listings 
FOR DELETE 
USING (auth.uid() = seller_id);

-- Create listing reports table
CREATE TABLE IF NOT EXISTS public.listing_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.food_listings(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.listing_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can report listings" 
ON public.listing_reports 
FOR INSERT 
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can view reports" 
ON public.listing_reports 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Create support chat messages table
CREATE TABLE IF NOT EXISTS public.support_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  is_from_support BOOLEAN DEFAULT false,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.support_chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own support chats" 
ON public.support_chats 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can send support messages" 
ON public.support_chats 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND is_from_support = false);

CREATE POLICY "Admins can view all support chats" 
ON public.support_chats 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can respond to support chats" 
ON public.support_chats 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Add unread count tracking indexes
CREATE INDEX IF NOT EXISTS idx_direct_messages_unread ON public.direct_messages(receiver_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_group_messages_group ON public.group_messages(group_id, created_at);