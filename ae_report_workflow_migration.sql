-- AIIA CTMS - AE/SAE Ethics Committee reporting workflow
-- Apply after schema.sql and the existing submission workflow migration.
-- Preserves the original adverse_events row and its deadline/audit history.

alter type study_status add value if not exists 'suspended';

create table if not exists ae_reports (
  id uuid primary key default uuid_generate_v4(),
  ae_id uuid not null references adverse_events(id) on delete cascade,
  study_id uuid not null references studies(id) on delete cascade,
  ec_id uuid not null references profiles(id),
  submitted_by uuid not null references profiles(id),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  report_comment text,
  review_comment text,
  reviewed_by uuid references profiles(id),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz
);

alter table ae_reports
  drop constraint if exists ae_reports_status_check;
alter table ae_reports
  add constraint ae_reports_status_check
  check (status in ('pending', 'submitted', 'approved', 'rejected'));

create index if not exists ae_reports_ae_idx
  on ae_reports (ae_id, submitted_at desc);
create index if not exists ae_reports_ec_idx
  on ae_reports (ec_id, status);

alter table ae_reports enable row level security;

drop policy if exists ae_reports_read on ae_reports;
create policy ae_reports_read on ae_reports
for select using (
  submitted_by = auth.uid()
  or ec_id = auth.uid()
  or exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

drop policy if exists ae_reports_insert on ae_reports;
create policy ae_reports_insert on ae_reports
for insert with check (false);

drop policy if exists ae_reports_update on ae_reports;
create policy ae_reports_update on ae_reports
for update using (false)
with check (false);

drop trigger if exists trg_audit_ae_reports on ae_reports;
create trigger trg_audit_ae_reports
after insert or update or delete on ae_reports
for each row execute function log_audit();

create or replace function submit_ae_report(
  p_ae_id uuid,
  p_report_comment text
) returns ae_reports as $$
declare
  report ae_reports;
begin
  if not exists (
    select 1
    from profiles p
    join subjects subject_record on subject_record.site_id = p.site_id
    join adverse_events ae on ae.subject_id = subject_record.id
    join studies study on study.id = ae.study_id
    where p.id = auth.uid()
      and p.role = 'study_coordinator'
      and ae.id = p_ae_id
      and study.ec_id is not null
  ) then
    raise exception 'Coordinator is not assigned to this adverse event';
  end if;

  if not exists (
    select 1 from studies study
    join adverse_events ae on ae.study_id = study.id
    where ae.id = p_ae_id and study.ec_id is not null
  ) then
    raise exception 'No Ethics Committee is assigned to this study';
  end if;

  insert into ae_reports (ae_id, study_id, ec_id, submitted_by, status, report_comment)
  select ae.id, ae.study_id, study.ec_id, auth.uid(), 'submitted', nullif(trim(p_report_comment), '')
  from adverse_events ae
  join studies study on study.id = ae.study_id
  where ae.id = p_ae_id
  returning * into report;

  return report;
end;
$$ language plpgsql security definer set search_path = public;

create or replace function review_ae_report(
  p_report_id uuid,
  p_review_comment text,
  p_status text
) returns ae_reports as $$
declare
  report ae_reports;
begin
  if p_status not in ('approved', 'rejected') then
    raise exception 'Invalid AE report decision';
  end if;

  if p_status = 'rejected' and nullif(trim(p_review_comment), '') is null then
    raise exception 'A rejection comment is required';
  end if;

  select * into report
  from ae_reports
  where id = p_report_id
    and status in ('pending', 'submitted')
    and ec_id = auth.uid();

  if report.id is null then
    raise exception 'AE report is not assigned to this Ethics Committee';
  end if;

  update ae_reports
  set status = p_status,
      review_comment = nullif(trim(p_review_comment), ''),
      reviewed_by = auth.uid(),
      reviewed_at = now()
  where id = p_report_id
  returning * into report;

  if p_status = 'rejected' then
    update studies
    set status = 'suspended', updated_at = now()
    where id = (select study_id from adverse_events where id = report.ae_id);
  else
    update studies
    set status = 'active', updated_at = now()
    where id = (select study_id from adverse_events where id = report.ae_id)
      and ec_id = auth.uid();
  end if;

  return report;
end;
$$ language plpgsql security definer set search_path = public;

create or replace function resume_suspended_study(
  p_study_id uuid
) returns studies as $$
declare
  study_record studies;
begin
  update studies
  set status = 'active', updated_at = now()
  where id = p_study_id
    and status = 'suspended'
    and ec_id = auth.uid();

  if not found then
    raise exception 'Study is not suspended or is not assigned to this Ethics Committee';
  end if;

  select * into study_record from studies where id = p_study_id;
  return study_record;
end;
$$ language plpgsql security definer set search_path = public;

notify pgrst, 'reload schema';
