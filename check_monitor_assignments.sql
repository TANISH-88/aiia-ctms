-- ============================================================
-- Check if Monitor role is in study_assignments for the study
-- Study: dc6267e5-2ce6-4948-8edc-ced8dd979193
-- ============================================================

-- Check all assignments for this study
SELECT 
  sa.profile_id,
  p.full_name,
  p.role as profile_role,
  p.site_id,
  sa.role as assignment_role,
  sa.study_id,
  s.title as study_title
FROM study_assignments sa
LEFT JOIN profiles p ON p.id = sa.profile_id
LEFT JOIN studies s ON s.id = sa.study_id
WHERE sa.study_id = 'dc6267e5-2ce6-4948-8edc-ced8dd979193'
ORDER BY sa.role;
