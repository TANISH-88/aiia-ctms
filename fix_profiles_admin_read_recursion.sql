-- =========================================================
-- AIIA-CTMS: Fix Infinite Recursion in profiles_admin_read
-- File: fix_profiles_admin_read_recursion.sql
-- Date: 2026-09-22
--
-- Problem:
--   profiles_admin_read uses EXISTS (SELECT 1 FROM profiles ...)
--   to decide if you can SELECT from profiles — a self-reference
--   that Postgres detects as infinite recursion. This causes
--   "infinite recursion detected in policy for relation 'profiles'"
--   whenever any policy that queries profiles is evaluated.
--
-- Fix:
--   Introduce a narrowly scoped SECURITY DEFINER function is_admin()
--   that reads profiles.role bypassing RLS (runs as the DB owner).
--   Replace profiles_admin_read to use is_admin() instead of the
--   self-referential subquery. No other policies are changed.
-- =========================================================

-- Step 1: Create is_admin() helper (SECURITY DEFINER, bypasses RLS)
-- Reads ONLY profiles.role for auth.uid(). Returns boolean.
-- No arbitrary data access — returns nothing except true/false.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;


-- Step 2: Replace profiles_admin_read with non-recursive version
drop policy if exists profiles_admin_read on public.profiles;

create policy profiles_admin_read on public.profiles
  for select
  using (public.is_admin());


-- Step 3: Reload PostgREST schema cache
notify pgrst, 'reload schema';
