-- ============================================================
-- Check the actual live studies_read policy
-- ============================================================

-- Check which policies exist on studies table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'studies'
  AND policyname LIKE '%read%';

-- Check the definition of studies_read policy
SELECT pg_get_ruledef(oid) as policy_definition
FROM pg_policies
WHERE tablename = 'studies'
  AND policyname = 'studies_read';
