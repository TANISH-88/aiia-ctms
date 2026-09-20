-- ============================================================
-- Phase 3 Migration: EC Assignment, Status Workflow
-- Apply this in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Allow admin to read ALL profiles (required for EC dropdown in Create Trial)
--    The existing profiles_read_own policy only allows users to read their own row.
CREATE POLICY profiles_admin_read ON profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- 2. DB trigger: when a study_submission status changes to 'approved',
--    automatically set studies.status = 'active'.
--    When rejected or changes_requested, set studies.status = 'ec_approval_pending'
--    (only if the study hasn't already been activated or closed).

CREATE OR REPLACE FUNCTION handle_submission_decision()
RETURNS TRIGGER AS $$
BEGIN
  -- Skip if status didn't change
  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN
    RETURN NEW;
  END IF;

  IF NEW.status = 'approved' THEN
    UPDATE studies
    SET status = 'active', updated_at = now()
    WHERE id = NEW.study_id;

  ELSIF NEW.status IN ('rejected', 'changes_requested') THEN
    -- Only downgrade if the study isn't already active/closed/suspended
    UPDATE studies
    SET status = 'ec_approval_pending', updated_at = now()
    WHERE id = NEW.study_id
      AND status NOT IN ('active', 'closed', 'suspended');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_submission_decision ON study_submissions;

CREATE TRIGGER trg_submission_decision
AFTER UPDATE ON study_submissions
FOR EACH ROW
EXECUTE FUNCTION handle_submission_decision();

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
