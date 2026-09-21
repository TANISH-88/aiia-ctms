-- =========================================================
-- AIIA CTMS - Core Database Schema (Postgres / Supabase)
-- Run this in the Supabase SQL editor, top to bottom, on Day 1.
-- =========================================================

create extension if not exists "uuid-ossp";
create extension if not exists vector; -- needed for the AI/RAG feature (Person C, Day 3)

-- ---------- Roles & users ----------
create type user_role as enum (
  'principal_investigator',
  'study_coordinator',
  'monitor',
  'ethics_committee',
  'pharmacovigilance',
  'admin',
  'regulator_readonly'
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role user_role not null,
  profile_completed boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- Studies ----------
create type study_status as enum (
  'protocol_draft',
  'ec_approval_pending',
  'ec_approved',
  'ctri_registered',
  'enrolling',
  'active',
  'closed'
);

create table studies (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  ctri_number text,
  phase text,
  status study_status not null default 'protocol_draft',
  target_enrollment int not null default 0,
  pi_id uuid references profiles(id),
  ec_approval_date date,
  ctri_registration_date date,
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Sites ----------
create table sites (
  id uuid primary key default uuid_generate_v4(),
  study_id uuid not null references studies(id) on delete cascade,
  name text not null,
  location text,
  activated_at date,
  created_at timestamptz not null default now()
);

alter table profiles add column site_id uuid references sites(id);

-- ---------- Subjects (store a de-identified code only, never a real name) ----------
create type subject_status as enum ('screening','enrolled','randomized','completed','withdrawn');

create table subjects (
  id uuid primary key default uuid_generate_v4(),
  study_id uuid not null references studies(id) on delete cascade,
  site_id uuid references sites(id),
  subject_code text not null,
  status subject_status not null default 'screening',
  enrollment_date date,
  created_at timestamptz not null default now()
);

-- ---------- Visits (drives protocol-deviation KPI) ----------
create table visits (
  id uuid primary key default uuid_generate_v4(),
  subject_id uuid not null references subjects(id) on delete cascade,
  visit_name text not null,
  scheduled_date date,
  actual_date date,
  is_deviation boolean generated always as
    (actual_date is not null and scheduled_date is not null and actual_date <> scheduled_date) stored,
  deviation_notes text,
  created_at timestamptz not null default now()
);

-- ---------- Adverse Events / Serious Adverse Events ----------
create type ae_severity as enum ('mild','moderate','severe');
create type ae_status as enum ('open','reported_to_ec','reported_to_regulator','closed');

create table adverse_events (
  id uuid primary key default uuid_generate_v4(),
  study_id uuid not null references studies(id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete cascade,
  reported_by uuid references profiles(id),
  description text not null,
  onset_date date not null,
  severity ae_severity not null,
  is_serious boolean not null default false,
  meddra_term text,        -- filled in by the AI coding-assist feature (Person C, Day 3)
  who_drug_term text,
  status ae_status not null default 'open',
  reported_at timestamptz not null default now(),
  regulatory_deadline timestamptz,   -- computed by the trigger below
  reported_to_regulator_at timestamptz,
  created_at timestamptz not null default now()
);

-- NOTE: 24 hours for an SAE initial report is the commonly-cited ICH-GCP /
-- NDCT 2019 window. Treat this as a configurable constant for the demo,
-- not a verified legal citation - confirm the exact figure your team wants
-- to present with whatever source you're citing in the submission doc.
create or replace function set_ae_deadline() returns trigger as $$
begin
  if new.is_serious then
    new.regulatory_deadline := new.reported_at + interval '24 hours';
  else
    new.regulatory_deadline := new.reported_at + interval '15 days';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_set_ae_deadline
before insert on adverse_events
for each row execute function set_ae_deadline();

-- ---------- Immutable audit trail ----------
create table audit_log (
  id bigint generated always as identity primary key,
  table_name text not null,
  record_id uuid not null,
  action text not null check (action in ('insert','update','delete')),
  changed_by uuid references profiles(id),
  changed_at timestamptz not null default now(),
  old_data jsonb,
  new_data jsonb
);

create or replace function log_audit() returns trigger as $$
begin
  insert into audit_log(table_name, record_id, action, changed_by, old_data, new_data)
  values (
    tg_table_name,
    coalesce(new.id, old.id),
    lower(tg_op),
    auth.uid(),
    case when tg_op = 'DELETE' then to_jsonb(old) else null end,
    case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) else null end
  );
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

create trigger trg_audit_studies after insert or update or delete on studies
for each row execute function log_audit();
create trigger trg_audit_subjects after insert or update or delete on subjects
for each row execute function log_audit();
create trigger trg_audit_ae after insert or update or delete on adverse_events
for each row execute function log_audit();

-- Nobody - not even an admin - can edit or delete a logged entry.
revoke update, delete on audit_log from authenticated, anon;

-- ---------- KPI view (frontend queries this directly, no extra backend code needed) ----------
create or replace view study_kpis as
select
  s.id as study_id,
  s.title,
  s.status,
  s.target_enrollment,
  count(distinct sub.id) filter (where sub.status <> 'withdrawn') as actual_enrollment,
  round(100.0 * count(distinct sub.id) filter (where sub.status <> 'withdrawn')
    / nullif(s.target_enrollment,0), 1) as enrollment_pct,
  count(distinct v.id) filter (where v.is_deviation) as deviation_count,
  count(distinct ae.id) filter (where ae.status = 'open') as open_ae_count,
  count(distinct ae.id) filter (where ae.is_serious and ae.status = 'open'
    and ae.regulatory_deadline < now()) as overdue_sae_count
from studies s
left join subjects sub on sub.study_id = s.id
left join visits v on v.subject_id = sub.id
left join adverse_events ae on ae.study_id = s.id
group by s.id;

-- ---------- AI / RAG support tables (Person C) ----------
create table guideline_chunks (
  id uuid primary key default uuid_generate_v4(),
  source text not null,   -- e.g. 'GCP-ASU', 'ICMR 2017', 'NDCT Rules 2019'
  content text not null,
  embedding vector(1536),
  created_at timestamptz not null default now()
);

create table meddra_terms (
  id uuid primary key default uuid_generate_v4(),
  term text not null,
  code text,
  embedding vector(1536)
);

-- ---------- Row-Level Security (this is your real RBAC, Person B Day 1) ----------
alter table studies enable row level security;
alter table adverse_events enable row level security;
alter table subjects enable row level security;
alter table audit_log enable row level security;

create policy studies_read on studies for select using (auth.role() = 'authenticated');
create policy studies_write on studies for insert with check (
  exists (select 1 from profiles p where p.id = auth.uid()
    and p.role in ('principal_investigator','study_coordinator','admin'))
);

create policy ae_read on adverse_events for select using (auth.role() = 'authenticated');
create policy ae_write on adverse_events for insert with check (
  exists (select 1 from profiles p where p.id = auth.uid()
    and p.role in ('study_coordinator','pharmacovigilance','admin'))
);

create policy subjects_read on subjects for select using (auth.role() = 'authenticated');
create policy subjects_write on subjects for insert with check (
  exists (select 1 from profiles p where p.id = auth.uid()
    and p.role in ('principal_investigator','study_coordinator','admin'))
);

create policy audit_read on audit_log for select using (
  exists (select 1 from profiles p where p.id = auth.uid()
    and p.role in ('admin','regulator_readonly'))
);

-- This covers studies/AE/subjects/audit as a starting point. Add matching
-- read policies for sites, visits, guideline_chunks, and meddra_terms, and
-- tighten "studies_read" / "ae_read" further if you want investigators to
-- see only their own study rather than every study (join through pi_id or
-- site_id in the USING clause).


-- =========================================================
-- 2026-09-04: Phase 6 - Reconciled live database objects
-- =========================================================

-- ---------- New user profile trigger ----------

create or replace function handle_new_user() returns trigger as $$
declare
  v_name text;
begin
  v_name := nullif(btrim(coalesce(new.raw_user_meta_data->>'full_name', '')), '');

  insert into profiles (id, full_name, role, profile_completed)
  values (
    new.id,
    coalesce(v_name, 'Pending Setup'),
    'study_coordinator',
    -- Every newly created user must complete first-login setup
    false
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();

-- ---------- Study alerts ----------

create or replace view study_alerts as
select study_id, alert_type, message, severity, due_at from (
  select id as study_id,
    'ec_renewal_due' as alert_type,
    'Ethics Committee approval renewal due' as message,
    'warning' as severity,
    ec_approval_date + interval '1 year' as due_at
  from studies
  where ec_approval_date is not null

  union all

  select study_id,
    'overdue_sae',
    'Serious Adverse Event report overdue',
    'critical',
    regulatory_deadline
  from adverse_events
  where is_serious
    and status = 'open'
    and regulatory_deadline < now()
) t
where due_at < now() + interval '30 days';

alter view study_alerts set (security_invoker = true);

-- ---------- Mark AE as reported ----------

create or replace function mark_ae_reported(p_ae_id uuid)
returns adverse_events as $$
  update adverse_events
  set
    status = 'reported_to_regulator',
    reported_to_regulator_at = now()
  where id = p_ae_id
  returning *;
$$ language sql security definer;


-- =========================================================
-- 2026-09-05: Live database reconciliation
-- =========================================================
-- Appended section only. Nothing above this line is changed.
--
-- Source of truth: only objects explicitly confirmed present
-- on the live Supabase database as of 2026-09-05.
--
-- Key:
--   [VERIFIED LIVE]    — confirmed present and used by the app
--   [UNVERIFIED/TODO]  — in a migration file but NOT confirmed live;
--                        kept as comments only
-- =========================================================


-- ---------------------------------------------------------
-- 1. studies.ec_id                             [VERIFIED LIVE]
--    Column added after initial schema creation.
--    References the ethics_committee profile assigned to a study.
-- ---------------------------------------------------------

alter table studies
  add column if not exists ec_id uuid references profiles(id);


-- ---------------------------------------------------------
-- 2. study_status enum value 'suspended'       [VERIFIED LIVE]
-- ---------------------------------------------------------

alter type study_status add value if not exists 'suspended';


-- ---------------------------------------------------------
-- 3. profiles RLS                              [VERIFIED LIVE]
--
--    Verified live policy:
--      profiles_read_own  FOR SELECT  USING (id = auth.uid())
--
--    NOTE: Migration files define profiles_read_authenticated
--    (USING auth.role() = 'authenticated') and
--    profiles_update_own_setup — neither was confirmed present
--    on the live database. They are documented as comments below.
-- ---------------------------------------------------------

alter table profiles enable row level security;

-- VERIFIED LIVE
drop policy if exists profiles_read_own on profiles;
create policy profiles_read_own on profiles
for select
using (id = auth.uid());

-- UNVERIFIED/TODO — in fix_profile_setup_rpc_migration.sql but
-- not confirmed on live database:
-- drop policy if exists profiles_update_own_setup on profiles;
-- create policy profiles_update_own_setup on profiles
-- for update
-- using  (id = auth.uid())
-- with check (id = auth.uid());


-- ---------------------------------------------------------
-- 4. complete_profile_setup(p_full_name text)  [VERIFIED LIVE]
--
--    Canonical definition from fix_profile_setup_rpc_migration.sql.
--    Returns json. SECURITY DEFINER. Writes only full_name and
--    profile_completed for auth.uid(). Never touches role/id/site_id.
-- ---------------------------------------------------------

drop function if exists public.complete_profile_setup(text);

create or replace function public.complete_profile_setup(p_full_name text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  updated public.profiles%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if p_full_name is null or btrim(p_full_name) = '' then
    raise exception 'Display name is required';
  end if;

  update public.profiles
  set
    full_name         = btrim(p_full_name),
    profile_completed = true
  where id = auth.uid()
  returning * into updated;

  if updated.id is null then
    raise exception 'Profile not found for current user';
  end if;

  return json_build_object(
    'id',                updated.id,
    'full_name',         updated.full_name,
    'role',              updated.role,
    'site_id',           updated.site_id,
    'profile_completed', updated.profile_completed
  );
end;
$$;

revoke all on function public.complete_profile_setup(text) from public;
grant execute on function public.complete_profile_setup(text) to authenticated;


-- ---------------------------------------------------------
-- 5. study_submissions table                   [VERIFIED LIVE]
--
--    Table definition from submission_workflow_migration.sql,
--    whose header states it "matches the existing live
--    study_submissions table".
--
--    Verified live RLS policies:
--      study_submissions_read   (SELECT)
--      study_submissions_insert (INSERT)
--
--    All other policies are UNVERIFIED — documented as comments.
-- ---------------------------------------------------------

create table if not exists study_submissions (
  id             uuid primary key default gen_random_uuid(),
  study_id       uuid not null references studies(id) on delete cascade,
  ec_id          uuid references profiles(id),
  submitted_by   uuid references profiles(id),
  status         text not null default 'pending',
  comment        text,
  submitted_at   timestamptz default now(),
  reviewed_at    timestamptz,
  reviewed_by    uuid references profiles(id),
  review_comment text
);

create index if not exists study_submissions_ec_idx
  on study_submissions (ec_id, status);

alter table study_submissions enable row level security;

-- VERIFIED LIVE: study_submissions_read
create policy study_submissions_read on study_submissions
for select using (
  exists (
    select 1 from profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
  or study_submissions.submitted_by = auth.uid()
  or study_submissions.ec_id = auth.uid()
);

-- VERIFIED LIVE: study_submissions_insert
-- (The migration file names this study_submissions_coordinator_insert;
--  the verified live name is study_submissions_insert — using live name.)
create policy study_submissions_insert on study_submissions
for insert with check (
  study_submissions.submitted_by = auth.uid()
  and study_submissions.status = 'pending'
  and exists (
    select 1 from profiles p
    join sites site on site.id = p.site_id
    where p.id = auth.uid()
      and p.role = 'study_coordinator'
      and site.study_id = study_submissions.study_id
  )
  and exists (
    select 1 from studies study
    where study.id = study_submissions.study_id
      and study.ec_id = study_submissions.ec_id
  )
);

-- UNVERIFIED/TODO — from submission_workflow_migration.sql,
-- not confirmed present on live database:
--
-- create policy study_submissions_decision_update on study_submissions
-- for update using (
--   exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
--   or (study_submissions.ec_id = auth.uid() and study_submissions.status = 'pending')
-- ) ...;
--
-- create policy study_submissions_coordinator_resubmit on study_submissions
-- for update using (
--   study_submissions.submitted_by = auth.uid()
--   and study_submissions.status in ('rejected', 'changes_requested') ...
-- ) ...;
--
-- create policy studies_admin_update on studies
-- for update using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')) ...;


-- ---------------------------------------------------------
-- 6. ae_reports table                          [VERIFIED LIVE]
--
--    Table created with initial check ('pending','approved','rejected'),
--    then constraint dropped and re-added to include 'submitted'.
--    Live constraint: ('pending','submitted','approved','rejected').
--
--    Verified live RLS policy:
--      ae_reports_read  (SELECT)
--
--    ae_reports_insert and ae_reports_update are in the migration
--    file but were NOT in the verified live policy list —
--    documented as comments.
-- ---------------------------------------------------------

create table if not exists ae_reports (
  id             uuid primary key default gen_random_uuid(),
  ae_id          uuid not null references adverse_events(id) on delete cascade,
  study_id       uuid not null references studies(id) on delete cascade,
  ec_id          uuid references profiles(id),
  submitted_by   uuid references profiles(id),
  report_comment text,
  review_comment text,
  submitted_at   timestamptz default now(),
  status         text not null default 'submitted',
  reviewed_at    timestamptz,
  reviewed_by    uuid references profiles(id)
);

-- Live status constraint includes all four values:
alter table ae_reports
  drop constraint if exists ae_reports_status_check;
alter table ae_reports
  add constraint ae_reports_status_check
  check (status in ('pending', 'submitted', 'approved', 'rejected'));

create index if not exists ae_reports_ae_idx
  on ae_reports (ae_id, submitted_at desc);
create index if not exists ae_reports_ec_idx
  on ae_reports (ec_id, status);

alter table ae_reports enable row level security;

-- VERIFIED LIVE: ae_reports_read
-- Exact body from ae_report_workflow_migration.sql (the applied migration).
drop policy if exists ae_reports_read on ae_reports;
create policy ae_reports_read on ae_reports
for select using (
  submitted_by = auth.uid()
  or ec_id = auth.uid()
  or exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

-- UNVERIFIED/TODO — from ae_report_workflow_migration.sql,
-- not in verified live policy list:
--
-- create policy ae_reports_insert on ae_reports
-- for insert with check (false);
--
-- create policy ae_reports_update on ae_reports
-- for update using (false) with check (false);

-- Audit trigger — from ae_report_workflow_migration.sql:
drop trigger if exists trg_audit_ae_reports on ae_reports;
create trigger trg_audit_ae_reports
after insert or update or delete on ae_reports
for each row execute function log_audit();


-- ---------------------------------------------------------
-- 7. submit_ae_report(p_ae_id uuid,            [VERIFIED LIVE]
--                     p_report_comment text)
--    From ae_report_workflow_migration.sql.
--    Sets ae_reports.status = 'submitted'.
--    Does not modify adverse_events.
-- ---------------------------------------------------------

create or replace function public.submit_ae_report(
  p_ae_id          uuid,
  p_report_comment text
) returns ae_reports as $$
declare
  report ae_reports;
begin
  if not exists (
    select 1
    from profiles p
    join subjects subject_record on subject_record.site_id = p.site_id
    join adverse_events ae on ae.subject_id = subject_record.id
    join studies study on study.id = ae.study_id
    where p.id = auth.uid()
      and p.role = 'study_coordinator'
      and ae.id = p_ae_id
      and study.ec_id is not null
  ) then
    raise exception 'Coordinator is not assigned to this adverse event';
  end if;

  if not exists (
    select 1 from studies study
    join adverse_events ae on ae.study_id = study.id
    where ae.id = p_ae_id and study.ec_id is not null
  ) then
    raise exception 'No Ethics Committee is assigned to this study';
  end if;

  insert into ae_reports (ae_id, study_id, ec_id, submitted_by, status, report_comment)
  select ae.id, ae.study_id, study.ec_id, auth.uid(), 'submitted',
         nullif(trim(p_report_comment), '')
  from adverse_events ae
  join studies study on study.id = ae.study_id
  where ae.id = p_ae_id
  returning * into report;

  return report;
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function public.submit_ae_report(uuid, text) to authenticated;


-- ---------------------------------------------------------
-- 8. review_ae_report(p_report_id uuid,        [VERIFIED LIVE]
--                     p_review_comment text,
--                     p_status text)
--    Signature verified live. Parameter order is alphabetical
--    as required by PostgREST named-param resolution.
--    Corrected from original migration (p_report_id, p_status,
--    p_review_comment) via fix_review_ae_report_signature.sql.
-- ---------------------------------------------------------

drop function if exists public.review_ae_report(uuid, text, text);

create or replace function public.review_ae_report(
  p_report_id      uuid,
  p_review_comment text,
  p_status         text
) returns ae_reports as $$
declare
  report ae_reports;
begin
  if p_status not in ('approved', 'rejected') then
    raise exception 'Invalid AE report decision';
  end if;

  if p_status = 'rejected' and nullif(trim(p_review_comment), '') is null then
    raise exception 'A rejection comment is required';
  end if;

  select * into report
  from ae_reports
  where id = p_report_id
    and status in ('pending', 'submitted')
    and ec_id = auth.uid();

  if report.id is null then
    raise exception 'AE report is not assigned to this Ethics Committee or has already been reviewed';
  end if;

  update ae_reports
  set status         = p_status,
      review_comment = nullif(trim(p_review_comment), ''),
      reviewed_by    = auth.uid(),
      reviewed_at    = now()
  where id = p_report_id
  returning * into report;

  if p_status = 'rejected' then
    update studies
    set status     = 'suspended',
        updated_at = now()
    where id = report.study_id;
  else
    update studies
    set status     = 'active',
        updated_at = now()
    where id    = report.study_id
      and ec_id = auth.uid();
  end if;

  return report;
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function public.review_ae_report(uuid, text, text) to authenticated;


-- ---------------------------------------------------------
-- 9. resume_suspended_study(p_study_id uuid)   [VERIFIED LIVE]
--
--    Verified live: tested 2026-09-05.
--    EC rejection sets study status = 'suspended'.
--    EC Resume Study sets study status = 'active'.
--    Only the EC assigned to the study (ec_id = auth.uid()) can resume.
-- ---------------------------------------------------------

drop function if exists public.resume_suspended_study(uuid);

create or replace function public.resume_suspended_study(p_study_id uuid)
returns public.studies
language plpgsql
security definer
set search_path = public
as $$
declare
  study_record public.studies;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  update public.studies
  set
    status     = 'active',
    updated_at = now()
  where id     = p_study_id
    and status = 'suspended'
    and ec_id  = auth.uid()
  returning * into study_record;

  if study_record.id is null then
    raise exception 'Study is not suspended or is not assigned to this Ethics Committee';
  end if;

  return study_record;
end;
$$;

revoke all on function public.resume_suspended_study(uuid) from public;
grant execute on function public.resume_suspended_study(uuid) to authenticated;


-- ---------------------------------------------------------
-- Reload PostgREST schema cache
-- ---------------------------------------------------------

notify pgrst, 'reload schema';

-- =========================================================
-- 2026-09-21: Organization Feature Migration (DOCUMENTATION)
-- =========================================================
-- See organization_feature_migration.sql for the full executable script.
--
-- NEW TABLE: organizations
--   id uuid pk
--   name text not null (preserves display casing)
--   created_at timestamptz
--   UNIQUE INDEX on lower(name) enforces case-insensitive deduplication
--   RLS: organizations_read (all authenticated)
--   Trigger: trg_audit_organizations (after insert/update/delete)
--
-- MODIFIED TABLE: studies
--   organization_id uuid references organizations(id) (nullable)
--
-- NEW RPC: get_or_create_organization(p_name text)
--   SECURITY DEFINER, admin-only.
--   Returns organizations row.
-- =========================================================
