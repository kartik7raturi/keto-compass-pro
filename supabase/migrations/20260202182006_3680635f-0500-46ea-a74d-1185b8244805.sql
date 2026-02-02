-- 1. Add video_url to user_recipes
ALTER TABLE public.user_recipes 
ADD COLUMN IF NOT EXISTS video_url text;

-- 2. Create recipe-media storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('recipe-media', 'recipe-media', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage policies for recipe-media
CREATE POLICY "Public read for recipe media"
ON storage.objects FOR SELECT
USING (bucket_id = 'recipe-media');

CREATE POLICY "Users can upload recipe media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'recipe-media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update recipe media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'recipe-media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete recipe media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'recipe-media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Add user_id to meals table for RLS
ALTER TABLE public.meals 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- 5. RLS policies for meals table
CREATE POLICY "Authenticated users can insert meals"
ON public.meals FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meals"
ON public.meals FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meals"
ON public.meals FOR DELETE
TO authenticated
USING (auth.uid() = user_id);