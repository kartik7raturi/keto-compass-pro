-- Challenge-specific communities
CREATE TABLE IF NOT EXISTS public.challenge_communities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id uuid REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL UNIQUE,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.challenge_communities ENABLE ROW LEVEL SECURITY;

-- Anyone can view challenge communities
CREATE POLICY "Anyone can view challenge communities" ON public.challenge_communities
    FOR SELECT USING (true);

-- Challenge community posts
CREATE TABLE IF NOT EXISTS public.challenge_posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id uuid REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
    user_id uuid NOT NULL,
    author_name text NOT NULL,
    author_avatar text,
    content text NOT NULL,
    image_url text,
    likes_count integer DEFAULT 0,
    comments_count integer DEFAULT 0,
    is_flagged boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.challenge_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view unflagged posts" ON public.challenge_posts
    FOR SELECT USING (is_flagged = false OR auth.uid() = user_id);

CREATE POLICY "Users can create posts" ON public.challenge_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON public.challenge_posts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON public.challenge_posts
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all challenge posts" ON public.challenge_posts
    FOR ALL USING (public.is_admin());

-- User reports table
CREATE TABLE IF NOT EXISTS public.user_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id uuid NOT NULL,
    reported_user_id uuid NOT NULL,
    post_id uuid,
    reason text NOT NULL,
    details text,
    status text DEFAULT 'pending' NOT NULL,
    admin_notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    resolved_at timestamp with time zone
);

ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports" ON public.user_reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports" ON public.user_reports
    FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can manage all reports" ON public.user_reports
    FOR ALL USING (public.is_admin());

-- User bans/suspensions table
CREATE TABLE IF NOT EXISTS public.user_bans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    ban_type text NOT NULL DEFAULT 'suspended', -- 'suspended', 'banned'
    reason text NOT NULL,
    banned_by uuid NOT NULL,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    lifted_at timestamp with time zone,
    is_active boolean DEFAULT true
);

ALTER TABLE public.user_bans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bans" ON public.user_bans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all bans" ON public.user_bans
    FOR ALL USING (public.is_admin());

-- User blocks (one user blocking another)
CREATE TABLE IF NOT EXISTS public.user_blocks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id uuid NOT NULL,
    blocked_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE(blocker_id, blocked_id)
);

ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own blocks" ON public.user_blocks
    FOR ALL USING (auth.uid() = blocker_id);

-- Community guidelines acceptance
CREATE TABLE IF NOT EXISTS public.community_guidelines_acceptance (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE,
    accepted_at timestamp with time zone DEFAULT now() NOT NULL,
    version text DEFAULT '1.0' NOT NULL
);

ALTER TABLE public.community_guidelines_acceptance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own acceptance" ON public.community_guidelines_acceptance
    FOR ALL USING (auth.uid() = user_id);

-- Direct messages table
CREATE TABLE IF NOT EXISTS public.direct_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id uuid NOT NULL,
    receiver_id uuid NOT NULL,
    content text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can send messages" ON public.direct_messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can view their own messages" ON public.direct_messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can update their received messages" ON public.direct_messages
    FOR UPDATE USING (auth.uid() = receiver_id);

-- Challenge post likes
CREATE TABLE IF NOT EXISTS public.challenge_post_likes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id uuid REFERENCES public.challenge_posts(id) ON DELETE CASCADE NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE(post_id, user_id)
);

ALTER TABLE public.challenge_post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes" ON public.challenge_post_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own likes" ON public.challenge_post_likes
    FOR ALL USING (auth.uid() = user_id);

-- Update community_posts to allow delete by owner
DROP POLICY IF EXISTS "Users can update their own posts" ON public.community_posts;
CREATE POLICY "Users can update their own posts" ON public.community_posts
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own posts" ON public.community_posts;
CREATE POLICY "Users can delete their own posts" ON public.community_posts
    FOR DELETE USING (auth.uid() = user_id);