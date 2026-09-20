-- ============================================================
-- Verify Principal Investigator UUID Mismatch
-- Study: dc6267e5-2ce6-4948-8edc-ced8dd979193 (yo yo yo)
-- ============================================================

-- Query study_assignments for this study where role = principal_investigator
-- Join with profiles to compare IDs
SELECT 
  sa.id as assignment_id,
  sa.profile_id as assignment_profile_id,
  sa.study_id,
  s.title as study_title,
  sa.role as assignment_role,
  sa.assigned_at,
  p.id as profile_table_id,
  p.full_name,
  p.role as profile_role,
  p.email,
  p.site_id,
  CASE 
    WHEN sa.profile_id = p.id THEN 'MATCH'
    ELSE 'MISMATCH'
  END as uuid_comparison
FROM study_assignments sa
LEFT JOIN studies s ON s.id = sa.study_id
LEFT JOIN profiles p ON p.id = sa.profile_id
WHERE sa.study_id = 'dc6267e5-2ce6-4948-8edc-ced8dd979193'
  AND sa.role = 'principal_investigator';

-- Also check all study_assignments for this study to see complete picture
SELECT 
  sa.id,
  sa.profile_id,
  p.full_name as profile_name,
  p.role as profile_role,
  sa.study_id,
  s.title as study_title,
  sa.role as assignment_role,
  sa.assigned_at,
  CASE 
    WHEN sa.profile_id = p.id THEN 'MATCH'
    ELSE 'MISMATCH'
  END as uuid_comparison
FROM study_assignments sa
LEFT JOIN profiles p ON p.id = sa.profile_id
LEFT JOIN studies s ON s.id = sa.study_id
WHERE sa.study_id = 'dc6267e5-2ce6-4948-8edc-ced8dd979193'
ORDER BY sa.assigned_at;
