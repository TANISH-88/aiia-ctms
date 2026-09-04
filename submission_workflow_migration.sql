-- AIIA CTMS - Study -> Ethics Committee submission workflow
-- Apply after schema.sql. No existing tables or columns are removed. This
-- definition matches the existing live study_submissions table.

create table if not exists study_submissions (
  id uuid primary key default uuid_generate_v4(),
  study_id uuid not null references studies(id) on delete cascade,
  submitted_by uuid not null references profiles(id),
  ec_id uuid not null references profiles(id),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'changes_requested')),
  comment text,
  review_comment text,
  reviewed_by uuid references profiles(id),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists study_submissions_ec_idx
  on study_submissions (ec_id, status);

alter table study_submissions enable row level security;

create policy study_submissions_read on study_submissions
for select using (
  exists (
    select 1
    from profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
  or study_submissions.submitted_by = auth.uid()
  or study_submissions.ec_id = auth.uid()
);

create policy study_submissions_coordinator_insert on study_submissions
for insert with check (
  study_submissions.submitted_by = auth.uid()
  and study_submissions.status = 'pending'
  and exists (
    select 1
    from profiles p
    join sites site on site.id = p.site_id
    where p.id = auth.uid()
      and p.role = 'study_coordinator'
      and site.study_id = study_submissions.study_id
  )
  and exists (
    select 1
    from studies study
    where study.id = study_submissions.study_id
      and study.ec_id = study_submissions.ec_id
  )
);

create policy study_submissions_decision_update on study_submissions
for update using (
  exists (
    select 1
    from profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
  or (
    study_submissions.ec_id = auth.uid()
    and study_submissions.status = 'pending'
  )
)
with check (
  (
    study_submissions.status in ('approved', 'rejected', 'changes_requested')
    and study_submissions.reviewed_at is not null
    and study_submissions.reviewed_by = auth.uid()
    and (
      study_submissions.status = 'approved'
      or nullif(trim(study_submissions.review_comment), '') is not null
    )
  )
  and exists (
    select 1
    from studies study
    where study.id = study_submissions.study_id
      and study.ec_id = study_submissions.ec_id
  )
);

create policy study_submissions_coordinator_resubmit on study_submissions
for update using (
  study_submissions.submitted_by = auth.uid()
  and study_submissions.status in ('rejected', 'changes_requested')
  and exists (
    select 1
    from profiles p
    join sites site on site.id = p.site_id
    where p.id = auth.uid()
      and p.role = 'study_coordinator'
      and site.study_id = study_submissions.study_id
  )
)
with check (
  study_submissions.submitted_by = auth.uid()
  and study_submissions.status = 'pending'
  and study_submissions.reviewed_by is null
  and study_submissions.reviewed_at is null
  and exists (
    select 1
    from studies study
    where study.id = study_submissions.study_id
      and study.ec_id = study_submissions.ec_id
  )
);

create policy studies_admin_update on studies
for update using (
  exists (
    select 1
    from profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

notify pgrst, 'reload schema';
