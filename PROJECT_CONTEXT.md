# PROJECT_CONTEXT.md

Read this first before touching the project.

## What this project is

AIIA Clinical Trials Dashboard (SIH PS 26046) — a clinical-trial management
dashboard for Ayurveda trials.

The system handles:
- study/trial tracking
- KPIs and alerts
- AE/SAE safety reporting and deadlines
- role-based access
- immutable audit logging
- one narrow AI feature

This is a 3-person, 7-day hackathon project.

## Team ownership

- Person A — `/frontend` — React frontend/UI
- Person B — `/backend` — Supabase database, RLS, RPCs, alerts
- Person C — `/ai` — AI, embeddings, RAG, seed/demo data

Do not modify another person's folder without discussing it first.

## Architecture

Database: PostgreSQL through Supabase.

Authentication: Supabase Auth.

Security: PostgreSQL Row-Level Security (RLS).

There is NO separate Express/FastAPI REST server.

Frontend and AI communicate directly with Supabase using the JS/Python client.

Backend work means:
- database schema
- RLS policies
- database views
- PostgreSQL functions/RPCs
- authentication triggers

## Roles

- principal_investigator
- study_coordinator
- monitor
- ethics_committee
- pharmacovigilance
- admin
- regulator_readonly

## Important database objects

Tables:
- profiles
- studies
- sites
- subjects
- visits
- adverse_events
- audit_log
- guideline_chunks
- meddra_terms

Views:
- study_kpis
- study_alerts (pending)

RPC:
- mark_ae_reported (pending)

## Current backend status

DONE:
- Core database schema
- Supabase Auth
- Signup → profiles trigger
- Default signup role = study_coordinator
- AE/SAE deadline trigger
- Immutable audit log
- study_kpis view
- study_kpis security_invoker
- RLS enabled on all required tables
- Role/site/study isolation tested with real test data

PENDING:
- study_alerts view
- mark_ae_reported RPC
- Final JS-client authentication/RLS testing
- Final API contract check with Person A
- Frontend integration
- AI integration

## KPI data

The frontend does NOT need a custom KPI API route.

Use:

supabase.from('study_kpis').select('*')

The database view calculates:
- enrollment percentage
- deviation count
- open AE count
- overdue SAE count

RLS controls which studies the logged-in user can see.

## Alerts

The planned `study_alerts` view will provide:
- ethics renewal alerts
- overdue SAE alerts
- enrollment-related alerts

Frontend will query it directly through Supabase.

## AE/SAE

When an AE is inserted, the database automatically calculates:

- serious AE → 24-hour deadline
- non-serious AE → 15-day deadline

These values are currently demo placeholders and must be verified before being presented as legal/regulatory facts.

`mark_ae_reported` will be the safe atomic action for marking an AE as reported.

## Frontend contract

Person A should use the exact database names and fields from BACKEND_SPEC.md.

Main calls include:
- Auth login
- profiles → role
- study_kpis → dashboard KPIs
- study_alerts → alerts
- studies → study details
- adverse_events → create AE
- mark_ae_reported RPC
- audit_log → admin/regulator view

Do not rename database tables or columns without telling the team.

## AI contract

Person C may use:
- adverse_events.description
- guideline_chunks
- meddra_terms

The AI feature should use synthetic/demo data only unless the team explicitly agrees otherwise.

## Demo goal

The final demo should show:

Company/Admin
→ create/manage a trial
→ assign users/sites
→ add subjects
→ record visits
→ record AE/SAE
→ automatic deadlines/alerts
→ role-based dashboard
→ KPIs and graphs

The frontend should look complete, but only the agreed core features need real backend logic.

## Important rule

Do not invent a new backend architecture.

Use Supabase Auth + PostgreSQL + RLS + Views + RPCs.

For deeper backend details, read BACKEND_SPEC.md.