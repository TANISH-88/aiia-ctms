-- ============================================================
-- Check studies.pi_id for study "yo yo yo"
-- Study: dc6267e5-2ce6-4948-8edc-ced8dd979193
-- ============================================================

-- Check the study's pi_id column
SELECT 
  id,
  title,
  pi_id,
  ec_id,
  status
FROM studies
WHERE id = 'dc6267e5-2ce6-4948-8edc-ced8dd979193';

-- Check if pi_id matches either of the assigned PIs
SELECT 
  s.id as study_id,
  s.title,
  s.pi_id as study_pi_id,
  sa.profile_id as assigned_pi_id,
  p.full_name as assigned_pi_name,
  CASE 
    WHEN s.pi_id = sa.profile_id THEN 'MATCH'
    WHEN s.pi_id IS NULL THEN 'NULL'
    ELSE 'MISMATCH'
  END as comparison
FROM studies s
LEFT JOIN study_assignments sa ON sa.study_id = s.id AND sa.role = 'principal_investigator'
LEFT JOIN profiles p ON p.id = sa.profile_id
WHERE s.id = 'dc6267e5-2ce6-4948-8edc-ced8dd979193';
