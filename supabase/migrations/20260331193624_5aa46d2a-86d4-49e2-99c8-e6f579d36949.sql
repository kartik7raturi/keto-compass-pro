-- Products table for admin product management
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL DEFAULT 0,
  original_price decimal(10,2),
  image_url text,
  benefits text[] DEFAULT '{}',
  ingredients text[] DEFAULT '{}',
  faqs jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Button links table for admin URL management
CREATE TABLE public.button_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  button_key text UNIQUE NOT NULL,
  label text NOT NULL,
  url text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.button_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read button links" ON public.button_links
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage button links" ON public.button_links
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Seed default button links
INSERT INTO public.button_links (button_key, label, url) VALUES
  ('keto_starter', 'Keto Starter — $19.99', 'https://www.digistore24.com/product/678112'),
  ('vip_monthly', 'VIP Monthly — $49/mo', ''),
  ('vip_lifetime', 'VIP Lifetime — $299', ''),
  ('shop_product', 'Shop Product Buy Now', '');

-- Create product-images storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

CREATE POLICY "Anyone can view product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admins can update product images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admins can delete product images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin());