-- =========================================================
-- AIIA CTMS — Phase 2: profiles Column-Level Privilege Hardening
-- Run this in the Supabase SQL editor.
--
-- Narrows the authenticated role's UPDATE privilege on
-- public.profiles from table-level to column-level (full_name only).
--
-- Repository audit confirmed:
--   - Normal frontend writes only { full_name } via updateProfileApi()
--   - complete_profile_setup is SECURITY DEFINER RPC (unaffected)
--   - Admin UI does not perform direct authenticated-role UPDATEs
--   - admin-create-user uses service-role (bypasses grants entirely)
--   - Role escalation already blocked by profiles_self_update RLS policy
--
-- This migration does NOT:
--   - modify any RLS policy
--   - modify role or site_id protections
--   - modify study_assignments
--   - affect Edge Functions
-- =========================================================

-- Step 1: Revoke the broad table-level UPDATE privilege
REVOKE UPDATE ON public.profiles FROM authenticated;

-- Step 2: Re-grant UPDATE restricted to full_name column only
GRANT UPDATE (full_name)
  ON public.profiles
  TO authenticated;

-- =========================================================
-- Verification queries (run after applying the above):
--
-- 1. Confirm column-level grant is in place:
--    SELECT grantee, privilege_type, column_name
--    FROM information_schema.column_privileges
--    WHERE table_schema = 'public'
--      AND table_name = 'profiles'
--      AND grantee = 'authenticated';
--
--    Expected: one row → grantee=authenticated, privilege_type=UPDATE, column_name=full_name
--
-- 2. Confirm no table-level UPDATE remains:
--    SELECT grantee, privilege_type
--    FROM information_schema.table_privileges
--    WHERE table_schema = 'public'
--      AND table_name = 'profiles'
--      AND grantee = 'authenticated'
--      AND privilege_type = 'UPDATE';
--
--    Expected: zero rows
--
-- 3. Test normal-user full_name update (run as authenticated non-admin):
--    UPDATE public.profiles SET full_name = 'Test Name' WHERE id = auth.uid();
--    Expected: succeeds (1 row updated, subject to RLS)
--
-- 4. Test normal-user role update (run as authenticated non-admin):
--    UPDATE public.profiles SET role = 'admin' WHERE id = auth.uid();
--    Expected: ERROR — permission denied for column role
-- =========================================================
