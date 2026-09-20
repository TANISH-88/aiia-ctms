-- ============================================================
-- Verify PI study_assignments query behavior
-- PI ID: 5a18993a-6726-4543-bdb3-e9b28ef850f0
-- Study: dc6267e5-2ce6-4948-8edc-ced8dd979193
-- ============================================================

-- This is exactly what getPiDashboardApi() does
SELECT study_id
FROM study_assignments
WHERE profile_id = '5a18993a-6726-4543-bdb3-e9b28ef850f0'
  AND role = 'principal_investigator';

-- Check if studies table returns the study with those IDs
SELECT id, title, status, pi_id
FROM studies
WHERE id IN (
  SELECT study_id
  FROM study_assignments
  WHERE profile_id = '5a18993a-6726-4543-bdb3-e9b28ef850f0'
    AND role = 'principal_investigator'
);

-- Check Monitor profile for site_id
SELECT id, full_name, role, site_id
FROM profiles
WHERE role = 'monitor';
