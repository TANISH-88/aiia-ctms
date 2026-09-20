-- ============================================================
-- Fix Coordinator Study Access via study_assignments
-- Run this in Supabase SQL Editor
-- ============================================================

-- Replace the existing studies_read policy to allow study_coordinators
-- to read studies via study_assignments instead of requiring site_id

DROP POLICY IF EXISTS studies_read ON studies;

CREATE POLICY studies_read ON studies
FOR SELECT USING (
  -- Admin can read all studies
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
  -- Regulator readonly can read all studies
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'regulator_readonly'
  )
  -- Ethics Committee can read all studies
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'ethics_committee'
  )
  -- Pharmacovigilance can read all studies
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'pharmacovigilance'
  )
  -- Principal Investigator can read their own studies
  OR studies.pi_id = auth.uid()
  -- Study Coordinator can read studies via study_assignments
  OR EXISTS (
    SELECT 1 FROM study_assignments sa
    WHERE sa.study_id = studies.id
      AND sa.profile_id = auth.uid()
      AND sa.role = 'study_coordinator'
  )
);

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
