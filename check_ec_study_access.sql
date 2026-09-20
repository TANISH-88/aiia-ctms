-- ============================================================
-- Check Ethic1's access to the study through studies RLS
-- Ethic1 ID: b8e8a347-82a7-4747-8c5c-b49eac8a2abd
-- Study ID: dc6267e5-2ce6-4948-8edc-ced8dd979193
-- ============================================================

-- Check Ethic1's profile
SELECT id, full_name, role, email
FROM profiles
WHERE id = 'b8e8a347-82a7-4747-8c5c-b49eac8a2abd';

-- Simulate the studies query that getStudyApi() makes
-- This would be executed as Ethic1
SELECT *
FROM studies
WHERE id = 'dc6267e5-2ce6-4948-8edc-ced8dd979193';

-- Check if the NEW studies_read policy was applied
-- Look for the study_assignments clause in the policy
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  pg_get_ruledef(oid) as policy_definition
FROM pg_policies
WHERE tablename = 'studies'
  AND policyname = 'studies_read';
