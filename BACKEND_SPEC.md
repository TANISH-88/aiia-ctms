# BACKEND_SPEC.md — Person B's detailed build spec

Read `PROJECT_CONTEXT.md` first if you haven't. This file is the deeper reference for
backend work specifically, and the contract Person A and Person C build against.

## Setup (Day 1 — mostly done already)
1. Create a Supabase project.
2. Paste `schema.sql` into the Supabase SQL editor and run it top to bottom. **[DONE —
   already verified against a real Postgres instance: AE deadline trigger, KPI view,
   and audit log all confirmed working.]**
3. In Supabase Auth settings, enable email/password (or magic link) sign-in.
4. Grab `SUPABASE_URL` and `SUPABASE_ANON_KEY` from Project Settings → API. Share
   these two with Person A and Person C — they're safe to share, RLS protects the data.
5. **Never** share, commit, or use the `service_role` key in any frontend or AI code.
   If you don't need it for anything, don't even copy it out of the dashboard.

## How "the backend" works here — read this before writing anything
There's no Express/FastAPI server to build. Supabase auto-generates a REST API from
your tables and views (PostgREST), and Row-Level Security policies decide who can
read/write what. Your job is schema design, RLS policies, and Postgres functions
(RPCs) for anything that's more than a plain insert/select — not route handlers.

## Day-by-day (granular)

**Day 1 — [done]**
`schema.sql` covers studies/sites/subjects/visits/adverse_events/audit_log/study_kpis/
guideline_chunks/meddra_terms, with the AE deadline trigger and audit triggers live.

**Day 2 — RLS for every role, plus the alerts view**
- Extend RLS beyond the 3 roles already covered. Pattern to follow for a role that
  should only see its own study (e.g. `principal_investigator`):
  ```sql
  create policy studies_pi_scoped on studies for select using (
    pi_id = auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','regulator_readonly'))
  );
  ```
  Do this for `monitor`, `ethics_committee`, and `pharmacovigilance` — each sees a
  different slice (monitor: sites they're assigned to; EC: approval-stage fields;
  PV: adverse_events across all studies).
- Build the alerts view — this is what satisfies the PS's "configurable alerts"
  requirement. Starting point (test before trusting it):
  ```sql
  create or replace view study_alerts as
  select study_id, alert_type, message, severity, due_at from (
    select id as study_id, 'ec_renewal_due' as alert_type,
      'Ethics Committee approval renewal due' as message, 'warning' as severity,
      ec_approval_date + interval '1 year' as due_at
    from studies where ec_approval_date is not null
    union all
    select study_id, 'overdue_sae', 'Serious Adverse Event report overdue',
      'critical', regulatory_deadline
    from adverse_events
    where is_serious and status = 'open' and regulatory_deadline < now()
  ) t
  where due_at < now() + interval '30 days';
  ```

**Day 3 — AE/SAE workflow completeness**
- The deadline trigger already exists. Add an RPC so "mark as reported" is one atomic
  action instead of a raw update from the frontend:
  ```sql
  create or replace function mark_ae_reported(p_ae_id uuid) returns adverse_events as $$
    update adverse_events
    set status = 'reported_to_regulator', reported_to_regulator_at = now()
    where id = p_ae_id
    returning *;
  $$ language sql security definer;
  ```
  (This still gets audit-logged automatically via the existing trigger.)

**Day 4 — Auth wiring + RBAC re-test**
- Auto-create a `profiles` row when someone signs up, instead of relying on manual
  inserts:
  ```sql
  create or replace function handle_new_user() returns trigger as $$
  begin
    insert into profiles (id, full_name, role)
    values (new.id, new.raw_user_meta_data->>'full_name', 'study_coordinator');
    return new;
  end;
  $$ language plpgsql security definer;

  create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
  ```
  (Default new sign-ups to `study_coordinator`; an admin promotes people to other
  roles manually via the Supabase table editor during the hackathon.)
- Log in as each role and confirm what it can and can't see/do.

**Day 5 — Support Person C's AI feature**
Confirm read access to `adverse_events.description`, `guideline_chunks`, and
`meddra_terms` works for whatever role their script runs as (likely just via the
anon key, same as everyone else).

**Day 6 — Integration pass with Person A**
Go through the contract below field by field with Person A live. This is where most
last-minute bugs hide — a renamed column or a status value spelled differently.

**Day 7 — Demo support**
Be ready to open the Supabase dashboard live and explain a policy or the AE trigger
if a judge asks how it actually works.

## API contract — what Person A (frontend) and Person C (AI) call

| Frontend/AI does | Calls | Returns |
|---|---|---|
| Log in | `supabase.auth.signInWithPassword()` | session + user id |
| Get my role | `select role from profiles where id = auth.uid()` | role string |
| Portfolio dashboard | `select * from study_kpis` | one row per study: enrollment_pct, deviation_count, open_ae_count, overdue_sae_count |
| Active alerts | `select * from study_alerts` | list of `{study_id, alert_type, message, severity, due_at}` |
| Study drill-down | `select * from studies where id = :id` (+ joined sites/subjects) | full study record |
| Log an AE | `insert into adverse_events(...)` | new row, `regulatory_deadline` auto-filled |
| Mark AE reported | `supabase.rpc('mark_ae_reported', {p_ae_id})` | updated row |
| Audit log (admin/regulator only) | `select * from audit_log` | log rows, RLS-filtered automatically |
| AI: guideline lookup | `select * from guideline_chunks` (+ embedding similarity in app code) | chunks + embeddings |
| AI: MedDRA suggest | `select * from meddra_terms` (+ embedding similarity in app code) | terms + embeddings |

## Ground rules to avoid merge pain
- Never rename a table/column without posting it in the group chat first — the
  frontend and the AI script both reference exact names from this contract.
- All schema changes go into `schema.sql` as an appended block with a date comment —
  one file, one source of truth, so nobody's local copy drifts from anyone else's.
- If you add a new RPC function or view, add it to the contract table above in the
  same commit.