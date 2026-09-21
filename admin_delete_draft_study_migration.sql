-- =========================================================
-- AIIA-CTMS: Admin Delete Draft Study Migration
-- File: admin_delete_draft_study_migration.sql
-- Date: 2026-09-22
--
-- INSTRUCTIONS
-- Run this file manually in the Supabase SQL editor.
--
-- What this migration does:
--   1. Ensures RLS is enabled on public.studies.
--   2. Creates a 'studies_delete' policy that permits ONLY
--      users with 'admin' role in profiles to delete a row.
--   3. Restricts deletion strictly to studies in 'protocol_draft'.
--   4. Adds defensive checks to completely block deletion if ANY
--      operational/trial data exists (subjects, submissions, AEs,
--      AE reports, or progress reports), preventing data loss.
--
-- ON DELETE CASCADE behaviors on foreign keys remain untouched.
-- audit_log behavior remains untouched (deletes are captured).
-- =========================================================

alter table public.studies enable row level security;

drop policy if exists studies_delete on public.studies;

create policy studies_delete on public.studies
  for delete
  using (
    status = 'protocol_draft'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    -- Defensive blocks against operational data.
    -- All five subqueries are safe: Admin SELECT access on each table has been
    -- verified live (subjects_pi_read, ae_read/ae_pi_read, ae_reports_read,
    -- study_submissions_read, progress_reports_read all explicitly grant Admin).
    -- Rows will never be hidden from the NOT EXISTS checks.
    and not exists (select 1 from public.subjects sub where sub.study_id = studies.id)
    and not exists (select 1 from public.study_submissions ss where ss.study_id = studies.id)
    and not exists (select 1 from public.adverse_events ae where ae.study_id = studies.id)
    and not exists (select 1 from public.ae_reports aer where aer.study_id = studies.id)
    and not exists (select 1 from public.study_progress_reports spr where spr.study_id = studies.id)
  );
