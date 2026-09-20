-- Read-only SQL to check study_submissions for study 'yo yo yo'
-- Run this in Supabase SQL Editor

SELECT id, study_id, status, submitted_by, ec_id, submitted_at, reviewed_at
FROM public.study_submissions
WHERE study_id = 'dc6267e5-2ce6-4948-8edc-ced8dd979193'
ORDER BY submitted_at DESC;
