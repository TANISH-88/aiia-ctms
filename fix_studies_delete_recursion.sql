-- =========================================================
-- AIIA-CTMS: Fix Infinite Recursion in studies_delete
-- File: fix_studies_delete_recursion.sql
-- Date: 2026-09-22
--
-- PROBLEM (confirmed via runtime evidence)
-- ----------------------------------------
-- The current studies_delete policy contains inline NOT EXISTS
-- subqueries against five child tables:
--
--   NOT EXISTS (SELECT 1 FROM subjects              WHERE study_id = studies.id)
--   NOT EXISTS (SELECT 1 FROM study_submissions     WHERE study_id = studies.id)
--   NOT EXISTS (SELECT 1 FROM adverse_events        WHERE study_id = studies.id)
--   NOT EXISTS (SELECT 1 FROM ae_reports            WHERE study_id = studies.id)
--   NOT EXISTS (SELECT 1 FROM study_progress_reports WHERE study_id = studies.id)
--
-- Those child tables have RLS SELECT policies that query back to studies:
--
--   subjects_pi_read          → EXISTS (SELECT 1 FROM studies WHERE pi_id = auth.uid())
--   ae_pi_read                → EXISTS (SELECT 1 FROM studies WHERE pi_id = auth.uid())
--   ae_reports_read           → EXISTS (SELECT 1 FROM studies WHERE pi_id = auth.uid())
--   study_submissions_pi_read → EXISTS (SELECT 1 FROM studies ...)
--
-- Confirmed cycle at DELETE time (SQLSTATE 42P17):
--
--   studies_delete
--     → NOT EXISTS (SELECT FROM subjects)
--       → subjects_pi_read evaluates
--         → EXISTS (SELECT FROM studies)
--           → studies_delete evaluates again
--             → 42P17 infinite recursion
--
-- CONFIRMED BY RUNTIME EVIDENCE
-- --------------------------------
-- DELETE /rest/v1/studies?id=eq.<uuid>
-- HTTP 500, code: 42P17
-- message: "infinite recursion detected in policy for relation "studies""
--
-- GET /rest/v1/studies?... returns HTTP 200 — SELECT policies are not involved.
--
-- FIX
-- ----
-- Replace the five inline NOT EXISTS subqueries with a single call to
-- draft_study_is_deletable(p_study_id uuid), a SECURITY DEFINER function
-- explicitly owned by postgres (rolbypassrls = true).
--
-- Because it runs with BYPASSRLS, it reads all five child tables directly
-- without triggering their RLS policies, breaking the cycle.
--
-- The function also performs an internal admin guard: non-admin callers
-- receive false immediately without any child table being queried,
-- preventing information disclosure about another study's operational data.
--
-- CONCURRENCY SAFETY
-- -------------------
-- All five child tables declare:
--   study_id uuid NOT NULL REFERENCES studies(id) ON DELETE CASCADE
--
-- PostgreSQL FK enforcement requires that any INSERT into a child table
-- acquires a FOR KEY SHARE lock on the parent studies row. The parent
-- DELETE acquires FOR UPDATE on the same studies row. These two lock modes
-- conflict: they cannot be held concurrently by different transactions.
--
-- Therefore, the three possible concurrent orderings all produce safe outcomes:
--
--   A. Child INSERT commits before parent DELETE starts:
--      → draft_study_is_deletable sees the committed child row → returns false
--      → DELETE is blocked by policy. ✓
--
--   B. Parent DELETE holds FOR UPDATE before child INSERT starts:
--      → Child INSERT's FOR KEY SHARE acquisition blocks.
--      → Parent DELETE commits and removes the studies row.
--      → Child INSERT resumes and gets an FK violation error. ✓
--
--   C. Child INSERT holds FOR KEY SHARE when parent DELETE tries FOR UPDATE:
--      → Parent DELETE blocks.
--      → Child INSERT commits and releases FOR KEY SHARE.
--      → Parent DELETE resumes; draft_study_is_deletable sees the committed
--        child row → returns false → DELETE is blocked by policy. ✓
--
-- CONCLUSION: The TOCTOU race condition is eliminated by PostgreSQL's FK
-- locking mechanism. The database-level guard in draft_study_is_deletable
-- is the authoritative protection. A frontend pre-check provides user-
-- experience defense-in-depth only and is not a security guarantee.
--
-- INVARIANTS PRESERVED
-- ----------------------
-- 1. Deletion only allowed: admin role + protocol_draft status.
-- 2. All five operational data guards still enforced at DB level.
-- 3. No SELECT / INSERT / UPDATE policies are changed.
-- 4. FK CASCADE behavior on child tables is unchanged.
-- 5. audit_log triggers are unchanged.
-- 6. No RLS is disabled on any table.
-- 7. The function returns only boolean — no row data is exposed.
-- 8. Non-admin callers receive false without child tables being queried.
-- 9. studies_read, studies_write, sites_read, study_assignments policies,
--    get_my_role(), and is_admin() are NOT modified.
-- =========================================================


-- ---------------------------------------------------------
-- Step 1: Create the SECURITY DEFINER helper
--
-- Language: plpgsql (required for the early-return admin guard).
--
-- Owner is explicitly set to postgres via ALTER FUNCTION below.
-- This guarantees rolbypassrls = true regardless of which role
-- executed the CREATE OR REPLACE statement.
--
-- Caller behavior:
--   unauthenticated            → cannot reach this function (RLS on studies blocks DELETE)
--   authenticated, non-admin   → returns false immediately; no child tables queried
--   authenticated, admin       → checks all five child tables under BYPASSRLS
--
-- Returns TRUE  — study has no operational data in any guarded table
-- Returns FALSE — caller is not admin, OR at least one dependent row exists
-- ---------------------------------------------------------

create or replace function public.draft_study_is_deletable(p_study_id uuid)
returns boolean
language plpgsql
security definer
stable
set search_path = public
as $$
begin
  -- Non-admin guard.
  -- public.is_admin() is itself SECURITY DEFINER (owner = postgres,
  -- rolbypassrls = true). Calling it here does not introduce recursion.
  -- auth.uid() is a session-level variable that is visible regardless
  -- of which role this SECURITY DEFINER function executes as.
  if not public.is_admin() then
    return false;
  end if;

  -- All five NOT EXISTS checks run under BYPASSRLS because this
  -- function's owner (postgres) has rolbypassrls = true.
  -- Child-table RLS policies (subjects_pi_read, ae_pi_read, etc.)
  -- are therefore never evaluated, breaking the 42P17 cycle.
  return (
    not exists (
      select 1 from public.subjects
      where study_id = p_study_id
    )
    and not exists (
      select 1 from public.study_submissions
      where study_id = p_study_id
    )
    and not exists (
      select 1 from public.adverse_events
      where study_id = p_study_id
    )
    and not exists (
      select 1 from public.ae_reports
      where study_id = p_study_id
    )
    and not exists (
      select 1 from public.study_progress_reports
      where study_id = p_study_id
    )
  );
end;
$$;

-- Explicit ownership assignment.
-- Guarantees owner = postgres and rolbypassrls = true regardless of
-- which database role executed the CREATE OR REPLACE above.
alter function public.draft_study_is_deletable(uuid) owner to postgres;

-- Revoke the default EXECUTE grant that PostgreSQL assigns to public
-- on every new function. Anonymous and unauthenticated callers cannot
-- invoke this function.
revoke all on function public.draft_study_is_deletable(uuid) from public;

-- Grant EXECUTE only to the authenticated role.
-- Only JWT-bearing Supabase sessions can invoke this function.
grant execute on function public.draft_study_is_deletable(uuid) to authenticated;


-- ---------------------------------------------------------
-- Step 2: Replace studies_delete with the non-recursive version
--
-- USING clause semantics are identical to the original policy:
--   - study must be in protocol_draft status
--   - caller must be admin (checked by is_admin())
--   - study must have no operational data (checked by draft_study_is_deletable())
--
-- The five inline NOT EXISTS subqueries are removed entirely.
-- They are replaced by a single call to draft_study_is_deletable(id),
-- which evaluates them under BYPASSRLS, breaking the recursion cycle.
--
-- No other policies on studies or any other table are modified.
-- ---------------------------------------------------------

drop policy if exists studies_delete on public.studies;

create policy studies_delete on public.studies
  for delete
  using (
    status = 'protocol_draft'
    and public.is_admin()
    and public.draft_study_is_deletable(id)
  );


-- ---------------------------------------------------------
-- Reload PostgREST schema cache
-- ---------------------------------------------------------

notify pgrst, 'reload schema';
