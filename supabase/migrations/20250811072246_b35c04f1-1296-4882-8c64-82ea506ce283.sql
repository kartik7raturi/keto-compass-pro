-- Create a public storage bucket for community media (idempotent)
insert into storage.buckets (id, name, public)
values ('community-media', 'community-media', true)
on conflict (id) do nothing;

-- Storage policies for community-media bucket
-- Public read access
create policy "Public read for community media"
  on storage.objects
  for select
  using (bucket_id = 'community-media');

-- Users can upload to their own folder (first path segment = auth.uid())
create policy "Users can upload community media"
  on storage.objects
  for insert
  with check (
    bucket_id = 'community-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update their own media
create policy "Users can update own community media"
  on storage.objects
  for update
  using (
    bucket_id = 'community-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own media
create policy "Users can delete own community media"
  on storage.objects
  for delete
  using (
    bucket_id = 'community-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Extend community_posts for videos and charts
alter table public.community_posts
  add column if not exists video_url text;

alter table public.community_posts
  add column if not exists chart_data jsonb;

-- Allow authenticated users to create challenges so they can join them
-- (RLS already enabled with select policy; add insert policy)
create policy "Users can create challenges"
  on public.challenges
  for insert
  with check (true);