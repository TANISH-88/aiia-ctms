-- Fix: review_ae_report parameter order must match PostgREST schema cache lookup order.
-- PostgREST resolves named params alphabetically: p_report_id, p_review_comment, p_status.
-- The previous function had (p_report_id, p_status, p_review_comment) which caused
-- "Could not find the function public.review_ae_report(p_report_id, p_review_comment, p_status)".
--
-- Run this in the Supabase SQL editor to fix the live database.

-- Drop the old signature first so CREATE OR REPLACE doesn't silently keep it.
drop function if exists public.review_ae_report(uuid, text, text);

create or replace function public.review_ae_report(
  p_report_id    uuid,
  p_review_comment text,
  p_status       text
) returns ae_reports as $$
declare
  report ae_reports;
begin
  -- Only 'approved' or 'rejected' are valid decisions.
  if p_status not in ('approved', 'rejected') then
    raise exception 'Invalid AE report decision';
  end if;

  -- Rejection requires a non-empty comment.
  if p_status = 'rejected' and nullif(trim(p_review_comment), '') is null then
    raise exception 'A rejection comment is required';
  end if;

  -- Verify the caller is the EC assigned to this report and the report is reviewable.
  select * into report
  from ae_reports
  where id = p_report_id
    and status in ('pending', 'submitted')
    and ec_id = auth.uid();

  if report.id is null then
    raise exception 'AE report is not assigned to this Ethics Committee or has already been reviewed';
  end if;

  -- Record the decision.
  update ae_reports
  set status         = p_status,
      review_comment = nullif(trim(p_review_comment), ''),
      reviewed_by    = auth.uid(),
      reviewed_at    = now()
  where id = p_report_id
  returning * into report;

  -- Update study status based on decision.
  -- Rejected → suspend the study.
  -- Approved → ensure the study is active (guard with ec_id to avoid touching other studies).
  if p_status = 'rejected' then
    update studies
    set status     = 'suspended',
        updated_at = now()
    where id = report.study_id;
  else
    update studies
    set status     = 'active',
        updated_at = now()
    where id       = report.study_id
      and ec_id    = auth.uid();
  end if;

  return report;
end;
$$ language plpgsql security definer set search_path = public;

-- Grant execute to authenticated users (EC users call this via the JS client).
grant execute on function public.review_ae_report(uuid, text, text) to authenticated;

-- Tell PostgREST to reload its schema cache so the new signature is picked up immediately.
notify pgrst, 'reload schema';

-- Verification query — run this after the above to confirm the correct signature is registered.
-- Expected row: review_ae_report | p_report_id uuid, p_review_comment text, p_status text
select
  n.nspname  as schema_name,
  p.proname  as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'review_ae_report';
