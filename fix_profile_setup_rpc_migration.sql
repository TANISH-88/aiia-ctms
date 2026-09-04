-- =========================================================
-- AIIA CTMS — Fix first-login profile setup (run in SQL editor)
--
-- Fixes: UPDATE + .single() returning 0 rows under RLS
--         ("Cannot coerce the result to a single JSON object")
-- Adds:  complete_profile_setup(p_full_name) RPC that updates
--         ONLY full_name + profile_completed for auth.uid()
-- Does not change role, id, site_id, or permissions.
-- =========================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS profile_completed boolean NOT NULL DEFAULT false;

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

-- Recreate the exact RPC contract used by the frontend. This also replaces
-- any stale definition with the same name and signature.
DROP FUNCTION IF EXISTS public.complete_profile_setup(text);

-- Reliable single-row setup write (bypasses RLS via SECURITY DEFINER,
-- but still scoped to auth.uid() only — never touches role/id/site_id)
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

-- Keep signup trigger: every new auth user gets profile_completed = false
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$
DECLARE
  v_name text;
BEGIN
  v_name := nullif(btrim(coalesce(new.raw_user_meta_data->>'full_name', '')), '');

  INSERT INTO public.profiles (id, full_name, role, profile_completed)
  VALUES (
    new.id,
    coalesce(v_name, 'Pending Setup'),
    'study_coordinator',
    false
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
