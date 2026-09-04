-- =========================================================
-- AIIA CTMS — First-login profile setup migration
-- Run in the Supabase SQL editor.
--
-- Adds profiles.profile_completed so admin-provisioned users
-- must set display name + new password on first login.
-- Does not change roles or operational permissions.
-- =========================================================

-- 1) Flag: false = must complete first-login setup
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS profile_completed boolean NOT NULL DEFAULT false;

-- 2) Existing users keep access (already set up)
UPDATE profiles
SET profile_completed = true
WHERE profile_completed = false
  AND full_name IS NOT NULL
  AND btrim(full_name) <> ''
  AND lower(btrim(full_name)) NOT IN ('pending', 'pending setup', 'new user');

-- 3) RLS: authenticated can read profiles (existing app behavior).
--    Users may update only their own row (app only writes full_name + profile_completed).
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_read_authenticated ON profiles;
CREATE POLICY profiles_read_authenticated ON profiles
FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS profiles_update_own_setup ON profiles;
CREATE POLICY profiles_update_own_setup ON profiles
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 5) Profile INSERT on auth user creation — always require first-login setup
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS trigger AS $$
DECLARE
  v_name text;
BEGIN
  v_name := nullif(btrim(coalesce(new.raw_user_meta_data->>'full_name', '')), '');

  INSERT INTO profiles (id, full_name, role, profile_completed)
  VALUES (
    new.id,
    coalesce(v_name, 'Pending Setup'),
    'study_coordinator',
    false
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6) Reliable first-login profile write (avoids PostgREST .single() coerce errors)
CREATE OR REPLACE FUNCTION public.complete_profile_setup(p_full_name text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated public.profiles%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_full_name IS NULL OR btrim(p_full_name) = '' THEN
    RAISE EXCEPTION 'Display name is required';
  END IF;

  UPDATE public.profiles
  SET
    full_name = btrim(p_full_name),
    profile_completed = true
  WHERE id = auth.uid()
  RETURNING * INTO updated;

  IF updated.id IS NULL THEN
    RAISE EXCEPTION 'Profile not found for current user';
  END IF;

  RETURN json_build_object(
    'id', updated.id,
    'full_name', updated.full_name,
    'role', updated.role,
    'site_id', updated.site_id,
    'profile_completed', updated.profile_completed
  );
END;
$$;

REVOKE ALL ON FUNCTION public.complete_profile_setup(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.complete_profile_setup(text) TO authenticated;
