-- ============================================================================
-- SUPABASE STORAGE: AVATARS BUCKET & RLS POLICIES
-- ============================================================================

-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- RLS Policy: Public Read Access
CREATE POLICY "Public Read Avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- RLS Policy: Authenticated User Scoped Upload Access (Folder path matching user id: {user_id}/avatar.jpg)
CREATE POLICY "Users Upload Own Avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS Policy: Authenticated User Scoped Update Access
CREATE POLICY "Users Update Own Avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS Policy: Authenticated User Scoped Delete Access
CREATE POLICY "Users Delete Own Avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
