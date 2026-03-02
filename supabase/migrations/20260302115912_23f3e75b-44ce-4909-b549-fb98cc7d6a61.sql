
-- Fix RLS for recipe-media storage bucket to allow authenticated users to upload
CREATE POLICY "Authenticated users can upload food images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'recipe-media');

CREATE POLICY "Authenticated users can update food images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'recipe-media' AND (storage.foldername(name))[1] = 'food' AND (storage.foldername(name))[2] = auth.uid()::text);

CREATE POLICY "Anyone can read recipe-media"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'recipe-media');
