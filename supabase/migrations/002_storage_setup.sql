-- =====================================================
-- Supabase Storage Setup for Profile Images
-- =====================================================
-- This migration sets up storage buckets and policies
-- for profile images and other user-uploaded content

-- =====================================================
-- STORAGE BUCKET: profile-images
-- =====================================================
-- Create a public bucket for default profile images

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']::text[];

-- =====================================================
-- STORAGE POLICIES: profile-images
-- =====================================================

-- Policy: Anyone can view profile images (they're public)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'profile-images' );

-- Policy: Authenticated users can upload profile images
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'profile-images' );

-- Policy: Users can update their own uploads
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'profile-images' AND auth.uid()::text = owner );

-- Policy: Users can delete their own uploads
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'profile-images' AND auth.uid()::text = owner );

-- =====================================================
-- STORAGE BUCKET: user-avatars (for custom uploads)
-- =====================================================
-- Create a bucket for user-uploaded custom avatars

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-avatars',
  'user-avatars',
  true,
  2097152, -- 2MB limit for user uploads
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']::text[];

-- =====================================================
-- STORAGE POLICIES: user-avatars
-- =====================================================

-- Policy: Anyone can view user avatars
DROP POLICY IF EXISTS "Public Access to User Avatars" ON storage.objects;
CREATE POLICY "Public Access to User Avatars"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'user-avatars' );

-- Policy: Authenticated users can upload their own avatar
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own avatar
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own avatar
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- HELPER FUNCTION: Get user avatar URL
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_avatar_url(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  avatar_url TEXT;
BEGIN
  SELECT u.avatar_url INTO avatar_url
  FROM users u
  WHERE u.id = user_id;
  
  RETURN avatar_url;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- NOTES
-- =====================================================
-- 
-- After running this migration:
-- 1. Upload default profile images to 'profile-images' bucket
-- 2. Update the default-avatars.ts constants file with URLs
-- 3. Users can upload custom avatars to 'user-avatars' bucket
-- 
-- Bucket structure:
-- - profile-images/
--   - user_joyboy.png (default avatars)
--   - user_krimson.png
--   - user_mati.png
--   - user_pek.png
--   - placeholder-user.jpg
--
-- - user-avatars/
--   - {user_id}/
--     - avatar.png (user's custom avatar)
--
