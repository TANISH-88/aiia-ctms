-- =========================================================
-- AIIA CTMS — Study Assignments Table Migration
-- Run this in the Supabase SQL editor.
--
-- Creates the study_assignments table to track which users
-- are assigned to which studies in which roles.
-- =========================================================

-- Create study_assignments table
CREATE TABLE IF NOT EXISTS study_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id uuid NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  assigned_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS study_assignments_study_idx ON study_assignments(study_id);
CREATE INDEX IF NOT EXISTS study_assignments_profile_idx ON study_assignments(profile_id);
CREATE INDEX IF NOT EXISTS study_assignments_role_idx ON study_assignments(role);

-- Enable RLS
ALTER TABLE study_assignments ENABLE ROW LEVEL SECURITY;

-- Policy: authenticated users can read assignments for their own profile
CREATE POLICY study_assignments_read_own ON study_assignments
FOR SELECT USING (
  profile_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- Policy: admins can insert assignments
CREATE POLICY study_assignments_admin_insert ON study_assignments
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- Policy: admins can delete assignments
CREATE POLICY study_assignments_admin_delete ON study_assignments
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
