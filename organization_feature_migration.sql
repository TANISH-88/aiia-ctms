-- =========================================================
-- AIIA-CTMS: Organization Feature Migration
-- File: organization_feature_migration.sql
-- Date: 2026-09-21
--
-- INSTRUCTIONS
-- Run this file manually in the Supabase SQL editor.
-- Verify each section before proceeding to the next.
-- Do NOT run on a live database without staging verification first.
--
-- What this migration does:
--   1. Creates the organizations table (id, name, created_at)
--   2. Adds a unique index on lower(name) (case-insensitive dedup)
--   3. Attaches the existing audit-log trigger to organizations
--   4. Adds a nullable organizations_id FK on studies
--   5. Enables RLS on organizations (read-only for all authenticated)
--   6. Creates the get_or_create_organization SECURITY DEFINER RPC
--      Admin-only. Uses SELECT -> INSERT with unique_violation handler.
--      Never issues an UPDATE (names are immutable).
-- =========================================================


-- ---------------------------------------------------------
-- 1. organizations table
--    name is plain text preserving original display casing.
--    UNIQUE INDEX on lower(name) enforces deduplication.
-- ---------------------------------------------------------

create table if not exists organizations (
  id         uuid        primary key default uuid_generate_v4(),
  name       text        not null,
  created_at timestamptz not null default now()
);

-- Case-insensitive deduplication constraint.
-- By creating a UNIQUE INDEX on lower(name), we preserve the original
-- display casing while preventing "AIIA" and "aiia" from being inserted twice.
create unique index if not exists organizations_name_key on organizations (lower(name));

-- Audit trail — reuses the existing log_audit() trigger function
drop trigger if exists trg_audit_organizations on organizations;

create trigger trg_audit_organizations
after insert or update or delete on organizations
for each row
execute function log_audit();


-- ---------------------------------------------------------
-- 1a. Initial Seed Data
--     Idempotent insert of initial approved organizations.
--     Preserves exact display casing.
-- ---------------------------------------------------------

insert into organizations (name)
select name from (values 
  ('All India Institute of Ayurveda (AIIA)'),
  ('Central Council for Research in Ayurvedic Sciences (CCRAS)'),
  ('Indian Council of Medical Research (ICMR)'),
  ('National Institute of Ayurveda (NIA)'),
  ('Institute of Teaching and Research in Ayurveda (ITRA)'),
  ('Ministry of Ayush'),
  ('Patanjali Research Foundation'),
  ('Dabur India Ltd.'),
  ('Himalaya Wellness Company'),
  ('Sandu Pharmaceuticals')
) as seed(name)
where not exists (
  select 1 from organizations o 
  where lower(o.name) = lower(seed.name)
);

-- ---------------------------------------------------------
-- 2. Add nullable organization_id FK to studies
--    Nullable so existing study rows are not broken.
--    No unique constraint — many studies can share one org.
-- ---------------------------------------------------------

alter table studies
  add column if not exists organization_id uuid
  references organizations(id);


-- ---------------------------------------------------------
-- 3. Row-Level Security on organizations
--    Direct client INSERT / UPDATE / DELETE are intentionally
--    blocked. All mutations go through the RPC below.
-- ---------------------------------------------------------

alter table organizations enable row level security;

-- All authenticated users can read organization names (autocomplete)
create policy organizations_read on organizations
  for select
  using (auth.role() = 'authenticated');

-- No INSERT / UPDATE / DELETE policies for direct client access.
-- The get_or_create_organization RPC (SECURITY DEFINER) handles inserts.


-- ---------------------------------------------------------
-- 4. get_or_create_organization(p_name text)
--
--    SECURITY DEFINER — runs with DB-owner privileges so it can
--    INSERT into organizations even though no client INSERT policy
--    exists.  The internal admin check prevents abuse.
--
--    Algorithm (no ON CONFLICT DO UPDATE, no UPDATE policy needed):
--      a. Verify auth.uid() is not null
--      b. Verify caller has role = 'admin' in profiles
--      c. Normalize whitespace but preserve casing
--      d. SELECT existing org by lower(name)
--      e. If found → return it (preserves original display case)
--      f. If not found → INSERT with human-entered case
--      g. If concurrent INSERT causes unique_violation → re-SELECT
--      h. Return the org record
--
--    Returns: organizations row (id, name, created_at)
-- ---------------------------------------------------------

drop function if exists public.get_or_create_organization(text);

create or replace function public.get_or_create_organization(p_name text)
returns public.organizations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_normalized text;
  v_search_key text;
  v_org        public.organizations;
begin
  -- a. Authentication guard
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  -- b. Authorization guard — admin only
  if not exists (
    select 1 from public.profiles
    where id   = auth.uid()
      and role = 'admin'
  ) then
    raise exception 'Only administrators can create organizations';
  end if;

  -- c. Normalize: trim ends and collapse internal whitespace, but keep display case
  v_normalized := trim(regexp_replace(p_name, '\s+', ' ', 'g'));
  v_search_key := lower(v_normalized);

  if v_normalized = '' or v_normalized is null then
    raise exception 'Organization name cannot be empty';
  end if;

  -- d. Try to find an existing organization (case-insensitive match)
  select * into v_org
  from public.organizations
  where lower(name) = v_search_key;

  if v_org.id is not null then
    -- e. Found — return it unchanged (name remains the originally stored case)
    return v_org;
  end if;

  -- f. Not found — attempt INSERT with original casing
  begin
    insert into public.organizations (name)
    values (v_normalized)
    returning * into v_org;
  exception when unique_violation then
    -- g. Concurrent INSERT by another admin committed first — re-read
    select * into v_org
    from public.organizations
    where lower(name) = v_search_key;
  end;

  -- h. Return the org record (new or resolved from concurrent insert)
  return v_org;
end;
$$;

revoke all on function public.get_or_create_organization(text) from public;
grant  execute on function public.get_or_create_organization(text) to authenticated;


-- ---------------------------------------------------------
-- 5. Reload PostgREST schema cache
-- ---------------------------------------------------------

notify pgrst, 'reload schema';


-- ---------------------------------------------------------
-- Post-migration verification queries
-- Run these after applying the migration to confirm success.
-- ---------------------------------------------------------

-- Check organizations table exists
-- select column_name, data_type, is_nullable
-- from information_schema.columns
-- where table_name = 'organizations'
-- order by ordinal_position;

-- Check studies.organization_id column exists
-- select column_name, data_type, is_nullable
-- from information_schema.columns
-- where table_name = 'studies' and column_name = 'organization_id';

-- Check RLS policies
-- select policyname, cmd, qual, with_check
-- from pg_policies
-- where tablename = 'organizations';

-- Check RPC function exists
-- select routine_name, security_type
-- from information_schema.routines
-- where routine_name = 'get_or_create_organization';
