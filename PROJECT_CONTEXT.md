# PROJECT_CONTEXT.md — read this first, every session, before touching code

If you are an AI coding tool (Cursor, Claude Code, Copilot, etc.) picking this project up —
read this file and BACKEND_SPEC.md (if you're on the backend track) and stop there.
You do not need to re-read the whole repo to be useful. This file is kept short and current
on purpose so a tool switch never costs a full re-scan.

## What this project is
AIIA Clinical Trials Dashboard (SIH PS 26046) — a real-time CTMS dashboard for Ayurveda
clinical trials: study tracking, KPIs/alerts, AE/SAE safety reporting with regulatory
deadlines, role-based access, an immutable audit trail, and one narrow AI feature.
Built for a 7-day hackathon by a 3-person team. Strategy: every screen looks complete;
only the pieces judges will actually test have real logic behind them (see "locked-in
decisions" below).

## Team & ownership boundaries — don't cross these without asking in the group chat
- **Person A** — `/frontend` (Next.js dashboards). Owns that folder only.
- **Person B (you)** — `/backend` (Supabase: schema, RLS, RPC functions, alerts logic)
  and the Supabase project itself. Owns that folder + the DB.
- **Person C** — `/ai` (embeddings, RAG feature, synthetic seed data). Owns that folder.

Each folder has its own dependencies (own package.json / venv / lockfile). The only
shared files are this one, `schema.sql`, and `BACKEND_SPEC.md`.

## Locked-in decisions — do not relitigate these mid-build
- DB: Postgres via **Supabase** (chosen for free RLS-based RBAC + pgvector + auth).
- Frontend: Next.js + Tailwind + shadcn/ui.
- There is **no separate custom REST server** — Supabase's PostgREST layer generates
  the API directly from tables/views/RLS. "Backend work" = schema + policies + Postgres
  functions, not route handlers.
- Roles enum: `principal_investigator`, `study_coordinator`, `monitor`,
  `ethics_committee`, `pharmacovigilance`, `admin`, `regulator_readonly`.
- AE/SAE deadline: 24h for serious, 15 days otherwise — **placeholder**, confirm the
  real figure before it's presented to judges.

## Status snapshot — update this section, keep the changelog below append-only
- [x] Core schema written & tested against a real Postgres instance (`schema.sql`):
      studies, sites, subjects, visits, adverse_events (with deadline trigger),
      audit_log (immutable), study_kpis view, guideline_chunks, meddra_terms.
- [ ] RLS policies for all 7 roles (only 3 done so far — see BACKEND_SPEC.md gap note)
- [ ] `study_alerts` view (ethics renewal / overdue SAE / enrollment lag)
- [ ] Auth sign-up → profiles row auto-creation
- [ ] Frontend dashboards
- [ ] AI feature (MedDRA coding assist or compliance chatbot — not yet chosen)

## The contract that must not break
Frontend and the AI script both talk to Supabase directly via the JS/Python client —
they depend on exact table names, column names, and RPC function signatures.
The full contract lives in `BACKEND_SPEC.md`. If you rename or restructure anything
in the DB, update that file in the same commit.

## Where the deeper docs live
- `schema.sql` — full DB schema, already tested.
- `BACKEND_SPEC.md` — Person B's detailed spec + the frontend/AI contract.
- `AIIA_CTMS_Team_Roadmap.pdf` — original plain-English explainer + 7-day plan for all 3 people.

## Changelog (append only, newest entry on top)
- 2026-09-01 — schema.sql created and verified against a real Postgres instance
  (AE deadline trigger, KPI view, and audit log all confirmed working end to end).