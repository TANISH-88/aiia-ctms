-- ============================================================
-- Check study_submissions for the study with EC filter
-- Study: dc6267e5-2ce6-4948-8edc-ced8dd979193
-- Ethic1 ID: b8e8a347-82a7-4747-8c5c-b49eac8a2abd
-- ============================================================

-- All submissions for this study
SELECT 
  id,
  study_id,
  ec_id,
  status,
  submitted_at,
  reviewed_at
FROM study_submissions
WHERE study_id = 'dc6267e5-2ce6-4948-8edc-ced8dd979193'
ORDER BY submitted_at DESC;

-- Submissions filtered by EC (what getStudySubmissionApi does with ecId)
SELECT 
  id,
  study_id,
  ec_id,
  status,
  submitted_at,
  reviewed_at
FROM study_submissions
WHERE study_id = 'dc6267e5-2ce6-4948-8edc-ced8dd979193'
  AND ec_id = 'b8e8a347-82a7-4747-8c5c-b49eac8a2abd'
ORDER BY submitted_at DESC
LIMIT 1;
