-- =============================================================
-- Phase 23 — participant_interest table
-- Run in Supabase SQL editor.
-- =============================================================
-- Purpose:
--   Public unauthenticated form (/apply) inserts lead interest
--   records here.  Staff (admin, coordinator, PI) can read and
--   update the status.  Anon can INSERT only — no other anon
--   access is granted.
-- =============================================================

-- 1. Create the table
-- -------------------------------------------------------------
create table if not exists public.participant_interest (
  id                  uuid primary key default gen_random_uuid(),
  full_name           text not null,
  email               text not null,
  phone               text,
  date_of_birth       date,
  condition_or_interest text,
  study_id            uuid references public.studies(id) on delete set null,
  status              text not null default 'new'
                        check (status in ('new', 'contacted', 'enrolled', 'declined')),
  notes               text,            -- staff-only internal notes
  submitted_at        timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  updated_by          uuid references public.profiles(id)
);

create index if not exists participant_interest_status_idx
  on public.participant_interest (status, submitted_at desc);

-- 2. Enable RLS
-- -------------------------------------------------------------
alter table public.participant_interest enable row level security;

-- 3. Anon INSERT — the only anon permission anywhere in the app.
--    INSERT only; no SELECT, UPDATE, DELETE for anon.
-- -------------------------------------------------------------
drop policy if exists participant_interest_anon_insert on public.participant_interest;
create policy participant_interest_anon_insert
  on public.participant_interest
  for insert
  to anon
  with check (true);

-- 4. Staff SELECT — Admin, Coordinator, PI can read all records.
-- -------------------------------------------------------------
drop policy if exists participant_interest_staff_read on public.participant_interest;
create policy participant_interest_staff_read
  on public.participant_interest
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'study_coordinator', 'principal_investigator')
    )
  );

-- 5. Staff UPDATE — Admin and Coordinator can update status/notes.
--    PI gets read-only (no update policy for PI).
-- -------------------------------------------------------------
drop policy if exists participant_interest_staff_update on public.participant_interest;
create policy participant_interest_staff_update
  on public.participant_interest
  for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'study_coordinator')
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'study_coordinator')
    )
  );

-- 6. Reload PostgREST schema cache
-- -------------------------------------------------------------
notify pgrst, 'reload schema';
