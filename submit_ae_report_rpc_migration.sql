-- AIIA CTMS - Expose the AE report submission RPC
-- Run after ae_report_workflow_migration.sql has created public.ae_reports.
-- This function does not modify adverse_events or its deadline.

create or replace function public.submit_ae_report(
  p_ae_id uuid,
  p_report_comment text
) returns public.ae_reports
language plpgsql
security definer
set search_path = public
as $$
declare
  report public.ae_reports;
  event_study_id uuid;
  event_subject_id uuid;
  assigned_ec_id uuid;
begin
  if auth.uid() is null then
    raise exception 'User is not authenticated';
  end if;

  select ae.study_id, ae.subject_id, study.ec_id
    into event_study_id, event_subject_id, assigned_ec_id
  from public.adverse_events ae
  join public.studies study on study.id = ae.study_id
  where ae.id = p_ae_id;

  if not found then
    raise exception 'Adverse event not found';
  end if;

  if assigned_ec_id is null then
    raise exception 'No Ethics Committee is assigned to this study';
  end if;

  if not exists (
    select 1
    from public.profiles profile
    join public.subjects subject_record on subject_record.site_id = profile.site_id
    where profile.id = auth.uid()
      and profile.role = 'study_coordinator'
      and subject_record.id = event_subject_id
      and subject_record.study_id = event_study_id
  ) then
    raise exception 'Coordinator is not assigned to this adverse event';
  end if;

  insert into public.ae_reports (
    ae_id,
    study_id,
    ec_id,
    submitted_by,
    status,
    report_comment,
    submitted_at
  )
  values (
    p_ae_id,
    event_study_id,
    assigned_ec_id,
    auth.uid(),
    'submitted',
    nullif(trim(p_report_comment), ''),
    now()
  )
  returning * into report;

  return report;
end;
$$;

revoke all on function public.submit_ae_report(uuid, text) from public;
grant execute on function public.submit_ae_report(uuid, text) to authenticated;

notify pgrst, 'reload schema';
