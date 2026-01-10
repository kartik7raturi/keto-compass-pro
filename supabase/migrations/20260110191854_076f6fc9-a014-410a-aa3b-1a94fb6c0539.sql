-- Fix profiles RLS to allow viewing other users' profiles publicly
CREATE POLICY "Anyone can view profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Create user_follows table
CREATE TABLE IF NOT EXISTS public.user_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Enable RLS on user_follows
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- Users can view all follows
CREATE POLICY "Anyone can view follows"
ON public.user_follows
FOR SELECT
USING (true);

-- Users can follow/unfollow
CREATE POLICY "Users can manage their follows"
ON public.user_follows
FOR ALL
USING (auth.uid() = follower_id)
WITH CHECK (auth.uid() = follower_id);

-- Add follower_count and following_count columns to profiles (optional, for performance)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- Create post_comments table for community post comments
CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  parent_comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on post_comments
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can view comments
CREATE POLICY "Anyone can view comments"
ON public.post_comments
FOR SELECT
USING (true);

-- Users can create their own comments
CREATE POLICY "Users can create comments"
ON public.post_comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
ON public.post_comments
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
ON public.post_comments
FOR DELETE
USING (auth.uid() = user_id);