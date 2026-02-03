-- Create user_groups table for community groups
CREATE TABLE IF NOT EXISTS public.user_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  is_public BOOLEAN NOT NULL DEFAULT true,
  member_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create group_members table
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.user_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role TEXT NOT NULL DEFAULT 'member', -- owner, admin, member
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create group_invites table for invitations
CREATE TABLE IF NOT EXISTS public.group_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.user_groups(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES auth.users(id),
  invitee_id UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, declined
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(group_id, invitee_id)
);

-- Create message_requests table for DM approval flow
CREATE TABLE IF NOT EXISTS public.message_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  receiver_id UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, declined
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(sender_id, receiver_id)
);

-- Create group_messages table for group chat
CREATE TABLE IF NOT EXISTS public.group_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.user_groups(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_groups
CREATE POLICY "Anyone can view public groups"
ON public.user_groups FOR SELECT
USING (is_public = true);

CREATE POLICY "Members can view their groups"
ON public.user_groups FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_members.group_id = user_groups.id 
    AND group_members.user_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can create groups"
ON public.user_groups FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their groups"
ON public.user_groups FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their groups"
ON public.user_groups FOR DELETE
TO authenticated
USING (auth.uid() = owner_id);

-- RLS policies for group_members
CREATE POLICY "Members can view group members"
ON public.group_members FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = group_members.group_id
    AND gm.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_groups g
    WHERE g.id = group_members.group_id
    AND g.is_public = true
  )
);

CREATE POLICY "Users can join public groups"
ON public.group_members FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
ON public.group_members FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Owners can remove members"
ON public.group_members FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_groups g
    WHERE g.id = group_members.group_id
    AND g.owner_id = auth.uid()
  )
);

-- RLS policies for group_invites
CREATE POLICY "Users can view their invites"
ON public.group_invites FOR SELECT
TO authenticated
USING (auth.uid() = invitee_id OR auth.uid() = inviter_id);

CREATE POLICY "Members can create invites"
ON public.group_invites FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = inviter_id
  AND EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = group_invites.group_id
    AND gm.user_id = auth.uid()
  )
);

CREATE POLICY "Invitees can update invite status"
ON public.group_invites FOR UPDATE
TO authenticated
USING (auth.uid() = invitee_id);

-- RLS policies for message_requests
CREATE POLICY "Users can view their message requests"
ON public.message_requests FOR SELECT
TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Authenticated users can send message requests"
ON public.message_requests FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Receivers can update message request status"
ON public.message_requests FOR UPDATE
TO authenticated
USING (auth.uid() = receiver_id);

-- RLS policies for group_messages
CREATE POLICY "Members can view group messages"
ON public.group_messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = group_messages.group_id
    AND gm.user_id = auth.uid()
  )
);

CREATE POLICY "Members can send group messages"
ON public.group_messages FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = group_messages.group_id
    AND gm.user_id = auth.uid()
  )
);

-- Create function to update member count
CREATE OR REPLACE FUNCTION public.update_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.user_groups
    SET member_count = member_count + 1
    WHERE id = NEW.group_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.user_groups
    SET member_count = GREATEST(0, member_count - 1)
    WHERE id = OLD.group_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for member count
CREATE TRIGGER update_group_member_count_trigger
AFTER INSERT OR DELETE ON public.group_members
FOR EACH ROW EXECUTE FUNCTION public.update_group_member_count();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_invites_invitee_id ON public.group_invites(invitee_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_group_id ON public.group_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_message_requests_receiver_id ON public.message_requests(receiver_id);