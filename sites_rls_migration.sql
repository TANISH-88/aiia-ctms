-- =========================================================
-- AIIA-CTMS: Sites Row-Level Security Migration
-- File: sites_rls_migration.sql
-- Date: 2026-09-21
--
-- INSTRUCTIONS
-- Run this file manually in the Supabase SQL editor.
-- This script is safe to run on the live database.
-- It only adds RLS policies — it does not alter any data,
-- columns, or existing policies on other tables.
--
-- What this migration does:
--   1. Enables RLS on public.sites
--      (currently has none — all authenticated users have
--       unrestricted SELECT/INSERT/UPDATE/DELETE)
--   2. Adds sites_read: SELECT for all authenticated users
--      (preserves existing PI Dashboard, Monitor Dashboard,
--       Study Detail, and EC Review read access)
--   3. Adds sites_write: INSERT for admin role only
--      (enforced at the database level, independent of the
--       frontend route guard)
--
-- No UPDATE or DELETE policies are added.
-- Sites are immutable from the client after creation.
-- No existing policies on studies, subjects, profiles,
-- adverse_events, audit_log, or study_assignments are changed.
-- =========================================================


-- ---------------------------------------------------------
-- 1. Enable RLS
--    After this line, ALL access is blocked until policies
--    below re-grant SELECT and INSERT to the right roles.
-- ---------------------------------------------------------

alter table public.sites enable row level security;


-- ---------------------------------------------------------
-- 2. sites_read
--    Allow all authenticated users to read site rows.
--    Required by:
--      - StudyDetailPage.jsx (studiesAPI.js getStudyApi)
--      - getStudiesApi (fetches sites per study)
--      - piDashboardAPI.js (PI Dashboard site counts)
--      - MonitorDashboardPage.jsx (assigned site display)
--      - ReviewStudyPage.jsx (EC Review)
-- ---------------------------------------------------------

drop policy if exists sites_read on public.sites;

create policy sites_read on public.sites
  for select
  using (
    exists (
      select 1
      from public.studies s
      where s.id = sites.study_id
    )
  );


-- ---------------------------------------------------------
-- 3. sites_write
--    Only admin may insert new sites.
--    Enforced at the database level via profiles.role check.
--    No UPDATE or DELETE policies — sites are immutable
--    from the client after creation.
-- ---------------------------------------------------------

drop policy if exists sites_write on public.sites;

create policy sites_write on public.sites
  for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );


-- ---------------------------------------------------------
-- Verification queries (run after applying this migration)
-- ---------------------------------------------------------

-- 1. Confirm RLS is enabled:
-- select relname, relrowsecurity
-- from pg_class
-- where relname = 'sites';
-- Expected: relrowsecurity = true

-- 2. Confirm both policies exist:
-- select policyname, cmd, qual, with_check
-- from pg_policies
-- where tablename = 'sites';
-- Expected: sites_read (SELECT), sites_write (INSERT)
