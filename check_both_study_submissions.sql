-- ============================================================
-- Check study_submissions for the two study IDs
-- Study IDs: 11111111-1111-1111-1111-111111111111, dc6267e5-2ce6-4948-8edc-ced8dd979193
-- ============================================================

-- Check if these studies exist
SELECT id, title, status
FROM studies
WHERE id IN ('11111111-1111-1111-1111-111111111111', 'dc6267e5-2ce6-4948-8edc-ced8dd979193');

-- Check study_submissions for these studies
SELECT 
  id,
  study_id,
  ec_id,
  status,
  submitted_at
FROM study_submissions
WHERE study_id IN ('11111111-1111-1111-1111-111111111111', 'dc6267e5-2ce6-4948-8edc-ced8dd979193')
ORDER BY study_id, submitted_at DESC;
