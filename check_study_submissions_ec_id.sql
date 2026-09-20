-- ============================================================
-- Check study_submissions ec_id for the two studies
-- Study IDs: 11111111-1111-1111-1111-111111111111, dc6267e5-2ce6-4948-8edc-ced8dd979193
-- Ethic1 ID: b8e8a347-82a7-4747-8c5c-b49eac8a2abd
-- ============================================================

-- Check study_submissions with ec_id
SELECT 
  id,
  study_id,
  ec_id,
  status,
  submitted_at,
  CASE 
    WHEN ec_id = 'b8e8a347-82a7-4747-8c5c-b49eac8a2abd' THEN 'MATCHES Ethic1'
    ELSE 'DOES NOT match Ethic1'
  END as ec_match
FROM study_submissions
WHERE study_id IN ('11111111-1111-1111-1111-111111111111', 'dc6267e5-2ce6-4948-8edc-ced8dd979193')
ORDER BY study_id, submitted_at DESC;

-- Also check the actual live study_submissions_read policy
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  pg_get_ruledef(oid) as policy_definition
FROM pg_policies
WHERE tablename = 'study_submissions'
  AND policyname = 'study_submissions_read';
