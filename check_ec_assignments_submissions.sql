-- ============================================================
-- Check study_assignments for Ethic1
-- Ethic1 ID: b8e8a347-82a7-4747-8c5c-b49eac8a2abd
-- ============================================================

-- Check all study_assignments for Ethic1
SELECT 
  sa.id,
  sa.profile_id,
  p.full_name as profile_name,
  sa.study_id,
  s.title as study_title,
  sa.role as assignment_role,
  sa.assigned_at
FROM study_assignments sa
LEFT JOIN profiles p ON p.id = sa.profile_id
LEFT JOIN studies s ON s.id = sa.study_id
WHERE sa.profile_id = 'b8e8a347-82a7-4747-8c5c-b49eac8a2abd'
  AND sa.role = 'ethics_committee'
ORDER BY sa.assigned_at;

-- Check which of these assigned studies have submissions
SELECT 
  sa.study_id,
  s.title as study_title,
  COUNT(ss.id) as submission_count
FROM study_assignments sa
LEFT JOIN studies s ON s.id = sa.study_id
LEFT JOIN study_submissions ss ON ss.study_id = sa.study_id
WHERE sa.profile_id = 'b8e8a347-82a7-4747-8c5c-b49eac8a2abd'
  AND sa.role = 'ethics_committee'
GROUP BY sa.study_id, s.title;
