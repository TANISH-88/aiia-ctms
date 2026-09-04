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