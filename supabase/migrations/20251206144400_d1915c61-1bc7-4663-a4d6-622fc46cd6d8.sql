-- Create advertisements table
CREATE TABLE public.advertisements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text NOT NULL,
  redirect_url text NOT NULL,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;

-- Anyone can view active ads
CREATE POLICY "Anyone can view active advertisements"
ON public.advertisements
FOR SELECT
USING (is_active = true);

-- Admins can manage all ads
CREATE POLICY "Admins can manage advertisements"
ON public.advertisements
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Add trigger for updated_at
CREATE TRIGGER update_advertisements_updated_at
BEFORE UPDATE ON public.advertisements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();