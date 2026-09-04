-- =========================================================
-- AIIA CTMS — PI Assignment & Dashboard Access Migration
-- Run this in the Supabase SQL editor.
--
-- What this does:
-- 1. Verifies the studies.pi_id column exists (it does, per schema.sql).
-- 2. Assigns the PI user to both studies if pi_id is currently NULL.
-- 3. Adds RLS policies so the PI can read their own studies, AEs, subjects, etc.
-- 4. Adds RLS so PI can read ae_reports for their studies.
-- =========================================================


-- ─── Step 0: Inspect current state ───────────────────────────────────────
-- Run this SELECT first to see which studies have no PI assigned.
-- If both studies already have pi_id set, skip Step 1.

SELECT id, title, status, pi_id
FROM studies
ORDER BY created_at;


-- ─── Step 1: Assign PI to studies that are missing one ───────────────────
-- Replace '<PI_USER_UUID>' with the actual UUID from auth.users / profiles
-- for the principal_investigator user.
--
-- To find the PI's UUID:
--   SELECT id, full_name, role FROM profiles WHERE role = 'principal_investigator';
--
-- Then run the update below with the correct UUID.

-- UPDATE studies
-- SET pi_id = '<PI_USER_UUID>', updated_at = now()
-- WHERE pi_id IS NULL;

-- To assign to a specific study only:
-- UPDATE studies
-- SET pi_id = '<PI_USER_UUID>', updated_at = now()
-- WHERE id = '<STUDY_UUID>';


-- ─── Step 2: RLS — PI can read their own studies ─────────────────────────

DROP POLICY IF EXISTS studies_pi_read ON studies;
CREATE POLICY studies_pi_read ON studies
FOR SELECT USING (
  pi_id = auth.uid()
  OR auth.role() = 'authenticated'   -- existing broad policy already covers this
);

-- Note: the existing `studies_read` policy already grants SELECT to all
-- authenticated users. The policy above is a no-op unless you later
-- restrict `studies_read` to admin/coordinator only. It's included here
-- for explicitness and future-proofing.


-- ─── Step 3: RLS — PI can read subjects in their studies ─────────────────

DROP POLICY IF EXISTS subjects_pi_read ON subjects;
CREATE POLICY subjects_pi_read ON subjects
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM studies s
    WHERE s.id = subjects.study_id
      AND s.pi_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'study_coordinator', 'principal_investigator')
  )
);


-- ─── Step 4: RLS — PI can read AEs in their studies ──────────────────────

DROP POLICY IF EXISTS ae_pi_read ON adverse_events;
CREATE POLICY ae_pi_read ON adverse_events
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM studies s
    WHERE s.id = adverse_events.study_id
      AND s.pi_id = auth.uid()
  )
  OR auth.role() = 'authenticated'   -- existing ae_read already covers all authenticated
);


-- ─── Step 5: RLS — PI can read ae_reports for their studies ──────────────
-- ae_reports currently only allows: submitted_by = auth.uid(), ec_id = auth.uid(), admin
-- We need to also allow PI of the study.

DROP POLICY IF EXISTS ae_reports_read ON ae_reports;
CREATE POLICY ae_reports_read ON ae_reports
FOR SELECT USING (
  submitted_by = auth.uid()
  OR ec_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
  OR EXISTS (
    SELECT 1 FROM studies s
    WHERE s.id = ae_reports.study_id
      AND s.pi_id = auth.uid()
  )
);


-- ─── Step 6: RLS — PI can read study_submissions for their studies ────────

DROP POLICY IF EXISTS study_submissions_pi_read ON study_submissions;
CREATE POLICY study_submissions_pi_read ON study_submissions
FOR SELECT USING (
  submitted_by = auth.uid()
  OR ec_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
  OR EXISTS (
    SELECT 1 FROM studies s
    WHERE s.id = study_submissions.study_id
      AND s.pi_id = auth.uid()
  )
);


-- ─── Step 7: Verify the result ────────────────────────────────────────────
-- After running the UPDATE in Step 1, verify assignment:

SELECT
  s.id,
  s.title,
  s.status,
  s.pi_id,
  p.full_name  AS pi_name,
  p.role       AS pi_role
FROM studies s
LEFT JOIN profiles p ON p.id = s.pi_id
ORDER BY s.created_at;


-- ─── Step 8: Reload PostgREST schema cache ────────────────────────────────
NOTIFY pgrst, 'reload schema';
