-- Create an enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create the user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create a security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create a helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- RLS Policies for user_roles table
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can manage roles"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Update user_recipes policies to allow admin access
CREATE POLICY "Admins can view all user recipes"
  ON public.user_recipes
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update all user recipes"
  ON public.user_recipes
  FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete all user recipes"
  ON public.user_recipes
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Update articles policies to allow admin access
CREATE POLICY "Admins can view all articles"
  ON public.articles
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can manage all articles"
  ON public.articles
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Create success_stories table for testimonials
CREATE TABLE public.success_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  story TEXT NOT NULL,
  before_image_url TEXT,
  after_image_url TEXT,
  weight_lost NUMERIC,
  duration_months INTEGER,
  is_featured BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on success_stories
ALTER TABLE public.success_stories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for success_stories
CREATE POLICY "Anyone can view approved stories"
  ON public.success_stories
  FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Users can create their own stories"
  ON public.success_stories
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stories"
  ON public.success_stories
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all stories"
  ON public.success_stories
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Add trigger for success_stories updated_at
CREATE TRIGGER update_success_stories_updated_at
  BEFORE UPDATE ON public.success_stories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();