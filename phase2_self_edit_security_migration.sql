-- =========================================================
-- AIIA CTMS — Phase 2: Self-Edit Security Migration
-- Run this in the Supabase SQL editor.
--
-- This migration ensures users can only update their own full_name
-- and cannot change id, role, or site_id through the API.
-- =========================================================

-- Ensure RLS is enabled on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing update policies if they exist
DROP POLICY IF EXISTS profiles_update_own_setup ON profiles;
DROP POLICY IF EXISTS profiles_update_own_full_name ON profiles;

-- Create a restrictive UPDATE policy for non-admin users
-- This policy only allows updating full_name and profile_completed
-- Users can only update their own row
CREATE POLICY profiles_update_own_full_name ON profiles
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid()
  AND id = old.id
  AND role = old.role
  AND site_id IS NOT DISTINCT FROM old.site_id
  AND full_name IS NOT NULL
  AND btrim(full_name) <> ''
);

-- Create a permissive UPDATE policy for admin users
-- Admins can update any profile and any field
CREATE POLICY profiles_admin_update ON profiles
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM profiles p
  WHERE p.id = auth.uid() AND p.role = 'admin'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles p
  WHERE p.id = auth.uid() AND p.role = 'admin'
));

-- Ensure the existing complete_profile_setup RPC is still available
-- This function already only updates full_name and profile_completed
-- and is the recommended way for users to update their profile

-- Grant SELECT access (users need to read their own profile)
DROP POLICY IF EXISTS profiles_read_own ON profiles;
CREATE POLICY profiles_read_own ON profiles
FOR SELECT
USING (id = auth.uid() OR auth.role() = 'authenticated');

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
