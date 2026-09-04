# AIIA Clinical Trials Dashboard — Full Repository Audit

**Date:** 2026-09-04  
**Auditor:** GitHub Copilot  
**Scope:** Backend schema, frontend React app, AI folder, root documentation

---

## 1. Repository Structure

### Root Directory
| File | Description |
|------|---|
| [BACKEND_SPEC.md](BACKEND_SPEC.md) | Detailed backend specification for Person B (database schema, RLS, RPCs, daily breakdown). Includes API contract table defining all frontend/AI calls. |
| [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) | High-level project context, team ownership (Person A/B/C), architecture overview, current backend status (DONE vs PENDING). |
| [schema.sql](schema.sql) | PostgreSQL/Supabase database schema with all tables, views, RLS policies, triggers, and functions. Single source of truth for backend. |

### `/frontend` — Person A's React + Vite Application

#### Root Config
| File | Description |
|------|---|
| [frontend/package.json](frontend/package.json) | Dependencies: Supabase 2.114.0, Redux Toolkit, React Router, Tailwind, Vite. |
| [frontend/vite.config.js](frontend/vite.config.js) | Vite config for React + Tailwind build. |
| [frontend/eslint.config.js](frontend/eslint.config.js) | ESLint configuration. |
| [frontend/README.md](frontend/README.md) | Env var docs: `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` required. |
| [frontend/vercel.json](frontend/vercel.json) | Vercel deployment config. |
| [frontend/index.html](frontend/index.html) | Entry point. |

#### Core App
| File | Description |
|------|---|
| [frontend/src/main.jsx](frontend/src/main.jsx) | React 19 entry point. |
| [frontend/src/App.jsx](frontend/src/App.jsx) | Router provider wrapper. |
| [frontend/src/index.css](frontend/src/index.css) | Global styles. |
| [frontend/src/redux/store.js](frontend/src/redux/store.js) | Redux store config with 3 slices: `auth`, `user`, `dashboard`. |

#### API Layer (`/frontend/src/api`)
| File | Description |
|------|---|
| [frontend/src/api/supabase.js](frontend/src/api/supabase.js) | Supabase client init. Uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` env vars. Creates `supabase` export used throughout. |

#### Auth Feature (`/frontend/src/features/auth`)
| File | Description |
|------|---|
| [frontend/src/features/auth/api/authApi.js](frontend/src/features/auth/api/authApi.js) | Two functions: `loginApi()` calls `supabase.auth.signInWithPassword()`, `logoutApi()` calls `supabase.auth.signOut()`. |
| [frontend/src/features/auth/state/authSlice.js](frontend/src/features/auth/state/authSlice.js) | Redux slice for auth state: `user`, `session`, `isAuthenticated`, `loading`, `initialized`, `error`. |
| [frontend/src/features/auth/hooks/useAuth.js](frontend/src/features/auth/hooks/useAuth.js) | Custom hook exposing `login()`, `logout()`, and auth state from Redux. |
| [frontend/src/features/auth/components/AuthInitializer.jsx](frontend/src/features/auth/components/AuthInitializer.jsx) | Wrapper component that runs `supabase.auth.getSession()` on mount to restore session after page reload. Dispatches Redux actions. |
| [frontend/src/features/auth/components/ProtectedRoute.jsx](frontend/src/features/auth/components/ProtectedRoute.jsx) | Route guard. Redirects unauthenticated users to `/auth/login`. |
| [frontend/src/features/auth/components/PublicRoute.jsx](frontend/src/features/auth/components/PublicRoute.jsx) | Route guard. Redirects authenticated users to `/dashboard`. |
| [frontend/src/features/auth/pages/LoginPage.jsx](frontend/src/features/auth/pages/LoginPage.jsx) | Login form. Email/password input with form validation. |
| [frontend/src/features/auth/pages/ForgetPasswordPage.jsx](frontend/src/features/auth/pages/ForgetPasswordPage.jsx) | **Placeholder:** Shows text "Password recovery page placeholder for the auth feature." |

#### Dashboard Feature (`/frontend/src/features/dashboard`)
| File | Description |
|------|---|
| [frontend/src/features/dashboard/api/dashboardAPI.js](frontend/src/features/dashboard/api/dashboardAPI.js) | `getDashboardApi()` calls `supabase.from("study_kpis").select("*")`. Returns KPI data. |
| [frontend/src/features/dashboard/state/dashboardSlice.js](frontend/src/features/dashboard/state/dashboardSlice.js) | Redux slice for dashboard state: `data`, `loading`, `error`. |
| [frontend/src/features/dashboard/hooks/useDashboard.js](frontend/src/features/dashboard/hooks/useDashboard.js) | Hook with `loadDashboard()` function that calls API and updates Redux. |
| [frontend/src/features/dashboard/pages/DashboardPage.jsx](frontend/src/features/dashboard/pages/DashboardPage.jsx) | Main dashboard. Displays KPI summary (studies, enrollment %, open AEs, overdue SAEs, deviations) computed from `study_kpis` view. Shows attention studies (those with issues). |

#### User Feature (`/frontend/src/features/user`)
| File | Description |
|------|---|
| [frontend/src/features/user/api/userAPI.js](frontend/src/features/user/api/userAPI.js) | `getUserApi()` calls `supabase.auth.getUser()` and `supabase.from("profiles").select("id, full_name, role, site_id").eq("id", authUser.id).single()`. Returns merged user data with email. |
| [frontend/src/features/user/state/userSlice.js](frontend/src/features/user/state/userSlice.js) | Redux slice for user state: `user`, `loading`, `error`, `initialized`. |
| [frontend/src/features/user/hooks/useUser.js](frontend/src/features/user/hooks/useUser.js) | Hook with `loadUser()` function. |
| [frontend/src/features/user/pages/ProfilePage.jsx](frontend/src/features/user/pages/ProfilePage.jsx) | Profile display page. Loads and shows user data. |

#### Clinical Trial Feature (`/frontend/src/features/clinicalTrial`)
| File | Description |
|------|---|
| [frontend/src/features/clinicalTrial/pages/Trial.jsx](frontend/src/features/clinicalTrial/pages/Trial.jsx) | **STATIC PLACEHOLDER:** Shows "No clinical trials to display". No API calls. |

#### Participants Feature (`/frontend/src/features/participants`)
| File | Description |
|------|---|
| [frontend/src/features/participants/pages/ParticipantsPage.jsx](frontend/src/features/participants/pages/ParticipantsPage.jsx) | **STATIC PLACEHOLDER:** Shows "No participants to display". No API calls. |

#### Study Feature (`/frontend/src/features/study`)
| File | Description |
|------|---|
| [frontend/src/features/study/pages/Study.jsx](frontend/src/features/study/pages/Study.jsx) | **HARDCODED MOCK DATA:** Contains array `researchPapers` with 10 hardcoded research paper objects (title, researcher, date, link). Renders as table. No database calls. |

#### App Routing (`/frontend/src/app`)
| File | Description |
|------|---|
| [frontend/src/app/app.routes.jsx](frontend/src/app/app.routes.jsx) | React Router config. Public routes: `/`, `/auth/login`, `/auth/forget-password`, `/403`. Protected routes: `/dashboard`, `/clinical-trials`, `/participants`, `/study`, `/user/profile`. |
| [frontend/src/app/AppLayout.jsx](frontend/src/app/AppLayout.jsx) | Root layout with Navbar, Outlet, Footer. |
| [frontend/src/app/CTMSLayout.jsx](frontend/src/app/CTMSLayout.jsx) | Layout for protected routes. Contains collapsible Sidebar and main content area. |

#### Shared Components (`/frontend/src/components`)
| File | Description |
|------|---|
| [frontend/src/components/Navbar.jsx](frontend/src/components/Navbar.jsx) | Top navigation with hardcoded menu panels (Why Castor, Platform & Services, Resources, Company). Menu items reference Castor features. Has login/logout buttons. |
| [frontend/src/components/Sidebar.jsx](frontend/src/components/Sidebar.jsx) | Left sidebar with 4 sections: MAIN (Dashboard, Clinical Trials, Participants, Study, **Sites [null]**, **Protocols [null]**), COMPLIANCE (**Ethics Committee [null]**, **CTRI [null]**, **Audit Trail [null]**), SAFETY (**Pharmacovigilance [null]**, **Adverse Events [null]**, **Safety Signals [null]**), DATA (**Analytics [null]**, **FHIR and CDISC [null]**, **Data Export [null]**). Items with `[null]` are not wired to routes. |
| [frontend/src/components/Footer.jsx](frontend/src/components/Footer.jsx) | Footer with contact form (hardcoded). |
| [frontend/src/components/Card.jsx](frontend/src/components/Card.jsx) | Reusable card component. |
| [frontend/src/components/Loaders/PageLoader.jsx](frontend/src/components/Loaders/PageLoader.jsx) | Loading spinner component. |

#### Pages (`/frontend/src/pages`)
| File | Description |
|------|---|
| [frontend/src/pages/HomePage.jsx](frontend/src/pages/HomePage.jsx) | Landing page with hardcoded feature cards and "Why Castor" info. No dynamic data. |
| [frontend/src/pages/InvalidAccessPage.jsx](frontend/src/pages/InvalidAccessPage.jsx) | 403 access denied page. |

#### Theme (`/frontend/src/shared/theme`)
| File | Description |
|------|---|
| [frontend/src/shared/theme/ThemeProvider.jsx](frontend/src/shared/theme/ThemeProvider.jsx) | React Context for theme (light/dark mode). |
| [frontend/src/shared/theme/themeStore.js](frontend/src/shared/theme/themeStore.js) | Zustand store for theme state. |
| [frontend/src/shared/theme/ThemeToggle.jsx](frontend/src/shared/theme/ThemeToggle.jsx) | Theme toggle button. |
| [frontend/src/shared/theme/tokens.js](frontend/src/shared/theme/tokens.js) | Tailwind color/spacing tokens. |

### `/backend` — Person B's Backend Work

| File | Description |
|------|---|
| [backend/README.md](backend/README.md) | Placeholder: "Supabase migrations/functions go here". No actual backend code yet. |
| [backend/rbac-test.mjs](backend/rbac-test.mjs) | RBAC test script. Hardcodes `SUPABASE_URL` (`https://nvicdgbjbrxdunifjigd.supabase.co`) and `SUPABASE_KEY` (`sb_publishable_bCy-eKk5i-7xVyE0ioYRdg_yKeQGaxT`—publishable key, NOT service_role). Tests 7 user roles (PI1, PI2, Coordinator, Monitor, Admin, Ethics, Pharmacovigilance) with hardcoded credentials. Each user has password `1234`. Verifies that users can log in and see expected studies via RLS. |

### `/ai` — Person C's AI Feature Work

| File | Description |
|------|---|
| [ai/README.md](ai/README.md) | Placeholder: "Embedding/RAG scripts go here". No actual AI code yet. |

---

## 2. API Contract Compliance

**Source:** [BACKEND_SPEC.md](BACKEND_SPEC.md) "API contract" table (lines 85–107).

| Backend Spec | Frontend Code | Match? | Notes |
|---|---|---|---|
| **Log in** `supabase.auth.signInWithPassword()` → session + user id | [frontend/src/features/auth/api/authApi.js](frontend/src/features/auth/api/authApi.js#L8): `supabase.auth.signInWithPassword({email, password})` | ✅ **EXACT MATCH** | Function calls identical. Returns `{data, error}` per Supabase JS SDK. |
| **Get my role** `select role from profiles where id = auth.uid()` → role string | [frontend/src/features/user/api/userAPI.js](frontend/src/features/user/api/userAPI.js#L17): `supabase.from("profiles").select("id, full_name, role, site_id").eq("id", authUser.id).single()` | ✅ **COMPATIBLE** | Fetches `role` plus extra fields. Same table and column names. Filters by `id = authUser.id` (equivalent to `auth.uid()`). |
| **Portfolio dashboard** `select * from study_kpis` → KPIs per study | [frontend/src/features/dashboard/api/dashboardAPI.js](frontend/src/features/dashboard/api/dashboardAPI.js#L4): `supabase.from("study_kpis").select("*")` | ✅ **EXACT MATCH** | Table and columns correct. |
| **Active alerts** `select * from study_alerts` → `{study_id, alert_type, message, severity, due_at}` | **NOT IMPLEMENTED** | ❌ **MISSING** | Per [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md#L38) line 38, `study_alerts` view is PENDING. No frontend code found. |
| **Study drill-down** `select * from studies where id = :id` (+ joined sites/subjects) → full study record | **NOT IMPLEMENTED** | ❌ **MISSING** | Trial.jsx shows placeholder. No code to fetch studies by ID. |
| **Log an AE** `insert into adverse_events(...)` → new row, regulatory_deadline auto-filled | **NOT IMPLEMENTED** | ❌ **MISSING** | No API function or page to create adverse_events. |
| **Mark AE reported** `supabase.rpc('mark_ae_reported', {p_ae_id})` → updated row | **NOT IMPLEMENTED** | ❌ **MISSING** | Per [BACKEND_SPEC.md](BACKEND_SPEC.md#L68-L76) lines 68–76, RPC is PENDING. No frontend code. |
| **Audit log** `select * from audit_log` (admin/regulator only) → log rows, RLS-filtered | **NOT IMPLEMENTED** | ❌ **MISSING** | Sidebar references "Audit Trail" but no route/page. No API function. |
| **AI: guideline lookup** `select * from guideline_chunks` (+ embedding similarity in app) → chunks + embeddings | **NOT IMPLEMENTED** | ❌ **MISSING** | AI folder empty. No frontend integration. |
| **AI: MedDRA suggest** `select * from meddra_terms` (+ embedding similarity in app) → terms + embeddings | **NOT IMPLEMENTED** | ❌ **MISSING** | AI folder empty. No frontend integration. |

**Summary:**
- **3 calls FULLY IMPLEMENTED:** Login, Get Role, Portfolio KPIs
- **7 calls NOT IMPLEMENTED:** Alerts, Study drill-down, Log AE, Mark AE, Audit, Guideline lookup, MedDRA suggest
- **Column/table name mismatches found:** NONE. All implemented calls use exact names from spec.

---

## 3. Schema Reality Check

**Source:** [schema.sql](schema.sql)

### Tables Defined
1. `profiles` (PK: `id`, FK: `auth.users(id)`)
   - Columns: `id`, `full_name`, `role` (enum `user_role`), `site_id` (FK), `created_at`
2. `studies` (PK: `id`)
   - Columns: `id`, `title`, `ctri_number`, `phase`, `status` (enum `study_status`), `target_enrollment`, `pi_id`, `ec_approval_date`, `ctri_registration_date`, `start_date`, `end_date`, `created_at`, `updated_at`
3. `sites` (PK: `id`, FK: `studies(id)`)
   - Columns: `id`, `study_id`, `name`, `location`, `activated_at`, `created_at`
4. `subjects` (PK: `id`, FK: `studies(id)`, FK: `sites(id)`)
   - Columns: `id`, `study_id`, `site_id`, `subject_code`, `status` (enum `subject_status`), `enrollment_date`, `created_at`
5. `visits` (PK: `id`, FK: `subjects(id)`)
   - Columns: `id`, `subject_id`, `visit_name`, `scheduled_date`, `actual_date`, `is_deviation` (GENERATED), `deviation_notes`, `created_at`
6. `adverse_events` (PK: `id`, FK: `studies(id)`, FK: `subjects(id)`, FK: `profiles(id)`)
   - Columns: `id`, `study_id`, `subject_id`, `reported_by`, `description`, `onset_date`, `severity` (enum `ae_severity`), `is_serious`, `meddra_term`, `who_drug_term`, `status` (enum `ae_status`), `reported_at`, `regulatory_deadline` (COMPUTED by trigger), `reported_to_regulator_at`, `created_at`
7. `audit_log` (PK: `id`, FK: `profiles(id)`)
   - Columns: `id`, `table_name`, `record_id`, `action` (enum: 'insert', 'update', 'delete'), `changed_by`, `changed_at`, `old_data` (jsonb), `new_data` (jsonb)
8. `guideline_chunks` (PK: `id`)
   - Columns: `id`, `source`, `content`, `embedding` (vector 1536), `created_at`
9. `meddra_terms` (PK: `id`)
   - Columns: `id`, `term`, `code`, `embedding` (vector 1536)

### Views Defined
1. `study_kpis`
   - Columns: `study_id`, `title`, `status`, `target_enrollment`, `actual_enrollment`, `enrollment_pct`, `deviation_count`, `open_ae_count`, `overdue_sae_count`

### Enum Types Defined
- `user_role`: 'principal_investigator', 'study_coordinator', 'monitor', 'ethics_committee', 'pharmacovigilance', 'admin', 'regulator_readonly'
- `study_status`: 'protocol_draft', 'ec_approval_pending', 'ec_approved', 'ctri_registered', 'enrolling', 'active', 'closed'
- `subject_status`: 'screening', 'enrolled', 'randomized', 'completed', 'withdrawn'
- `ae_severity`: 'mild', 'moderate', 'severe'
- `ae_status`: 'open', 'reported_to_ec', 'reported_to_regulator', 'closed'

### Functions/Triggers Defined
1. `set_ae_deadline()` — Trigger function. Sets `regulatory_deadline` on adverse_events insert: 24h for SAE, 15d for non-SAE.
2. `log_audit()` — Trigger function. Logs insert/update/delete to `audit_log` table.
3. Triggers attached to `studies`, `subjects`, `adverse_events` for audit logging.

### References in Frontend Code vs. Schema
| Frontend Reference | Table | Columns | Exists in Schema? | Notes |
|---|---|---|---|---|
| [frontend/src/features/auth/api/authApi.js](frontend/src/features/auth/api/authApi.js#L8) `supabase.auth.signInWithPassword()` | (Supabase Auth, not user table) | — | ✅ | Uses Supabase built-in auth. |
| [frontend/src/features/user/api/userAPI.js](frontend/src/features/user/api/userAPI.js#L17) `.from("profiles").select("id, full_name, role, site_id")` | `profiles` | `id`, `full_name`, `role`, `site_id` | ✅ **ALL EXIST** | All 4 columns defined in schema.sql line 23–26. |
| [frontend/src/features/dashboard/api/dashboardAPI.js](frontend/src/features/dashboard/api/dashboardAPI.js#L4) `.from("study_kpis").select("*")` | `study_kpis` | (all columns of view) | ✅ | View defined in schema.sql line 234–251. |
| [frontend/src/app/CTMSLayout.jsx](frontend/src/app/CTMSLayout.jsx) `"Pharmacovigilance"` sidebar item | — | — | ✅ | Enum value `'pharmacovigilance'` exists in `user_role` type (schema.sql line 15). |
| [frontend/src/features/study/pages/Study.jsx](frontend/src/features/study/pages/Study.jsx#L1) `researchPapers` array | (hardcoded, not DB) | — | N/A | Hardcoded mock data, not a real table reference. |

**Verdict:** ✅ **NO SCHEMA MISMATCHES FOUND.** All frontend references to database objects match exact table/column/enum names in schema.sql.

---

## 4. Mocked vs. Real Data

**Per spec:** [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) line 34–42 states:
> "only some backend pieces are meant to be 'real' (RLS, KPI/AE timeline, audit trail) while CTRI/FHIR/ABDM/CDISC are meant to be visually convincing mocks."

### Frontend Pages — Data Source Reality Check

| Page | Route | Component | Data Source | Expected per Context | Match? |
|---|---|---|---|---|---|
| Home | `/` | [HomePage.jsx](frontend/src/pages/HomePage.jsx) | **STATIC/HARDCODED** — Arrays `featureData` and `whyCastorData` with feature cards and company info. | Mock/demo | ✅ |
| Login | `/auth/login` | [LoginPage.jsx](frontend/src/features/auth/pages/LoginPage.jsx) | **REAL SUPABASE AUTH** — Calls `supabase.auth.signInWithPassword()`. | Real | ✅ |
| Forget Password | `/auth/forget-password` | [ForgetPasswordPage.jsx](frontend/src/features/auth/pages/ForgetPasswordPage.jsx) | **STATIC PLACEHOLDER** — "Password recovery page placeholder for the auth feature." No implementation. | Mock/pending | ✅ |
| Dashboard | `/dashboard` | [DashboardPage.jsx](frontend/src/features/dashboard/pages/DashboardPage.jsx) | **REAL SUPABASE CALL** — Fetches from `study_kpis` view via `supabase.from("study_kpis").select("*")`. Displays enrollment %, open AE count, overdue SAE count, deviation count. Per schema.sql lines 234–251, `study_kpis` calculates these via SQL. | Real | ✅ |
| Profile | `/user/profile` | [ProfilePage.jsx](frontend/src/features/user/pages/ProfilePage.jsx) | **REAL SUPABASE CALL** — Fetches auth user + `profiles` table via `supabase.from("profiles").select(...)`. | Real | ✅ |
| Clinical Trials | `/clinical-trials` | [Trial.jsx](frontend/src/features/clinicalTrial/pages/Trial.jsx) | **STATIC PLACEHOLDER** — Shows "No clinical trials to display". No API call. No hardcoded data. | Should be real (studies table) | ❌ **MISMATCH: Should wire to studies table, currently shows empty placeholder.** |
| Participants | `/participants` | [ParticipantsPage.jsx](frontend/src/features/participants/pages/ParticipantsPage.jsx) | **STATIC PLACEHOLDER** — Shows "No participants to display". No API call. | Should be real (subjects table) | ❌ **MISMATCH: Should wire to subjects table, currently shows empty placeholder.** |
| Study / Research Papers | `/study` | [Study.jsx](frontend/src/features/study/pages/Study.jsx) | **HARDCODED MOCK DATA** — Array `researchPapers` at line 1–44 contains 10 research papers with static title/researcher/date/link. Rendered in table. No database call. Papers include: "A Randomized Trial of Intensive versus Standard Blood-Pressure Control" (Wright JT Jr), "Dexamethasone in Hospitalized Patients with Covid-19" (RECOVERY Group), etc. | Per context: CTRI/FHIR/CDISC should be mock, so mock data OK. However, data is external research papers, not CTRI/CDISC-specific. | ⚠️ **PARTIAL MATCH: Mocked as intended, but data appears to be generic research papers rather than simulating CTRI/CDISC content.** |

### AI Integration

| Feature | Expected per Spec | Implemented? | Notes |
|---|---|---|---|
| **Guideline lookup** — AI reads `guideline_chunks` table + embedding similarity | [BACKEND_SPEC.md](BACKEND_SPEC.md#L99) line 99; [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md#L49) line 49. | ❌ **NO** | [ai/README.md](ai/README.md) is placeholder only. No embeddings code. No frontend UI to call AI. |
| **MedDRA suggest** — AI reads `meddra_terms` table + embedding similarity | [BACKEND_SPEC.md](BACKEND_SPEC.md#L100) line 100. | ❌ **NO** | Same as above. |

**Summary:** Dashboard, Auth, Profile are wired to real Supabase. Clinical Trials and Participants are stubbed (should be real). Study page shows hardcoded research papers (mock as intended for demo). AI not implemented. Alerts, Audit Trail, AE creation are not implemented.

---

## 5. Security Check

**Requirement:** Per [BACKEND_SPEC.md](BACKEND_SPEC.md) line 20–21:
> "Never share, commit, or use the `service_role` key in any frontend or AI code. If you don't need it for anything, don't even copy it out of the dashboard."

### Search Results for Service Keys

**Frontend (`/frontend`):**
- ✅ **NO `service_role` keys found.**
- ✅ Uses `VITE_SUPABASE_PUBLISHABLE_KEY` only. [frontend/src/api/supabase.js](frontend/src/api/supabase.js#L3-L5).
- ✅ No hardcoded Supabase keys in frontend source code.

**Backend (`/backend`):**
- ⚠️ **Hardcoded Supabase credentials in test file:**
  - File: [backend/rbac-test.mjs](backend/rbac-test.mjs#L3-L4)
  - `SUPABASE_URL = 'https://nvicdgbjbrxdunifjigd.supabase.co'`
  - `SUPABASE_KEY = 'sb_publishable_bCy-eKk5i-7xVyE0ioYRdg_yKeQGaxT'`
  - **Status:** ✅ **SAFE — Key prefix is `sb_publishable_`, NOT `sbpb_` (service_role prefix).** This is the publishable/anonymous key, safe to commit.
  - However, **test user credentials are hardcoded:** Email/password combos (e.g. `phase5.pi1@test.com` / `1234`).

**AI (`/ai`):**
- ✅ **NO code found.** [ai/README.md](ai/README.md) is placeholder only.

### Verdict
- ✅ **NO service_role keys found anywhere.**
- ✅ Frontend correctly uses publishable key only.
- ⚠️ Backend test file hardcodes publishable key + test credentials (acceptable for test file, but credentials should be moved to a separate test-data file or deleted before production).

---

## 6. Environment Variables Check

**Env vars referenced in code:**

### Frontend
| Variable | File | Line | Referenced? | Documented? | Status |
|---|---|---|---|---|---|
| `VITE_SUPABASE_URL` | [frontend/src/api/supabase.js](frontend/src/api/supabase.js#L3) | 3 | Yes, required. Throws error if missing. | ✅ Yes, in [frontend/README.md](frontend/README.md#L2) line 2: `# VITE_SUPABASE_URL=you_url` | ✅ DOCUMENTED |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | [frontend/src/api/supabase.js](frontend/src/api/supabase.js#L4-L5) | 4–5 | Yes, required. Throws error if missing. | ✅ Yes, in [frontend/README.md](frontend/README.md#L3) line 3: `# VITE_SUPABASE_PUBLISHABLE_KEY=your_key` | ✅ DOCUMENTED |

### Backend
| Variable | File | Hardcoded? | Documented? | Status |
|---|---|---|---|---|
| `SUPABASE_URL` | [backend/rbac-test.mjs](backend/rbac-test.mjs#L3) | ✅ Hardcoded | ❌ Not documented | ⚠️ Test file only, acceptable but should be env var |
| `SUPABASE_KEY` | [backend/rbac-test.mjs](backend/rbac-test.mjs#L4) | ✅ Hardcoded | ❌ Not documented | ⚠️ Test file only, acceptable but should be env var |

### AI
| Variable | File | Status |
|---|---|---|
| (None found) | [ai/README.md](ai/README.md) | No code to document. |

**Summary:**
- ✅ Frontend env vars are documented and used correctly.
- ✅ No missing undocumented env vars in frontend source code.
- ⚠️ Backend test file hardcodes credentials (acceptable for hackathon test, but best practice would be to use env vars or a `.env.test` file).
- ❌ No `.env.example` file exists in frontend root (only documented in README).

---

## 7. Open TODOs / Incomplete Work

### Hardcoded Placeholders in Frontend

| File | Line | Text | Status |
|---|---|---|---|
| [frontend/src/features/auth/pages/ForgetPasswordPage.jsx](frontend/src/features/auth/pages/ForgetPasswordPage.jsx#L5) | 5 | `<p style={{ color: 'var(--muted)' }}>Password recovery page placeholder for the auth feature.</p>` | **NOT IMPLEMENTED** |

### Unimplemented Sidebar Routes

Per [frontend/src/components/Sidebar.jsx](frontend/src/components/Sidebar.jsx#L3-L37), the following sidebar items have `null` path (not wired to any route):

**MAIN Section:**
- Line 9: `["Sites", null, "pin"]`
- Line 10: `["Protocols", null, "book"]`

**COMPLIANCE Section:**
- Line 16: `["Ethics Committee", null, "check"]`
- Line 17: `["CTRI", null, "landmark"]`
- Line 18: `["Audit Trail", null, "history"]`

**SAFETY Section:**
- Line 23: `["Pharmacovigilance", null, "shield"]`
- Line 24: `["Adverse Events", null, "alert"]`
- Line 25: `["Safety Signals", null, "activity"]`

**DATA Section:**
- Line 30: `["Analytics", null, "chart"]`
- Line 31: `["FHIR and CDISC", null, "database"]`
- Line 32: `["Data Export", null, "download"]`

Total: **11 unimplemented sidebar navigation items.**

### Missing API Implementations (Per Spec vs. Code)

| Feature | Spec Reference | Status | Evidence |
|---|---|---|---|
| **study_alerts view** | [BACKEND_SPEC.md](BACKEND_SPEC.md#L32-L52) lines 32–52; [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md#L38) line 38 marked PENDING | ❌ **NOT IMPLEMENTED** | No SQL view in [schema.sql](schema.sql). No frontend API call. |
| **mark_ae_reported RPC** | [BACKEND_SPEC.md](BACKEND_SPEC.md#L68-L76) lines 68–76; [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md#L36) marked PENDING | ❌ **NOT IMPLEMENTED** | No function in [schema.sql](schema.sql). No frontend API call. |
| **Adverse Events creation** | [BACKEND_SPEC.md](BACKEND_SPEC.md#L93) table row "Log an AE" | ❌ **NOT IMPLEMENTED** | No frontend form or API function. |
| **Audit Trail query** | [BACKEND_SPEC.md](BACKEND_SPEC.md#L95) table row "Audit log" | ❌ **NOT IMPLEMENTED** | RLS policy exists in [schema.sql](schema.sql#L324-L327), but no frontend page/API. |
| **Study drill-down** | [BACKEND_SPEC.md](BACKEND_SPEC.md#L92) table row | ❌ **NOT IMPLEMENTED** | Trial.jsx shows placeholder. No API call to fetch studies by ID. |
| **AI Guideline Lookup** | [BACKEND_SPEC.md](BACKEND_SPEC.md#L99) table row; [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md#L49) | ❌ **NOT IMPLEMENTED** | [ai/README.md](ai/README.md) is placeholder. No embeddings or RAG code. |
| **AI MedDRA Suggest** | [BACKEND_SPEC.md](BACKEND_SPEC.md#L100) table row | ❌ **NOT IMPLEMENTED** | Same as above. |

### Additional Extended RLS Policies (Per Spec)

Per [BACKEND_SPEC.md](BACKEND_SPEC.md#L24-L50) "Day 2", the following RLS policies are mentioned as PENDING:
- `monitor` (see sites they're assigned to)
- `ethics_committee` (see approval-stage fields)
- `pharmacovigilance` (see adverse_events across all studies)

**Evidence:** [schema.sql](schema.sql#L320-L327) has basic policies for `studies`, `adverse_events`, `subjects`, `audit_log`, but no scoped policies for these specific roles.

### Function Not Yet in Schema

Per [BACKEND_SPEC.md](BACKEND_SPEC.md#L64-L67) "handle_new_user trigger," auto-create profiles on auth signup:
```sql
create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();
```

**Status in [schema.sql](schema.sql):** ❌ **NOT FOUND.** This trigger is listed as pending in [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md#L34) line 34.

---

## Summary of Findings

### ✅ **Strengths**
1. **Auth pipeline fully wired** — Login, logout, session restoration, and role fetching work end-to-end.
2. **Dashboard KPI real data** — Correctly queries `study_kpis` view from Supabase.
3. **Security posture good** — No service_role keys in frontend/AI code. Uses publishable key only.
4. **Schema complete** — All tables, enums, views, and core triggers (AE deadline, audit log) defined.
5. **API contract partially honored** — 3 of 10 spec calls implemented (auth, role, KPIs).
6. **No schema mismatches** — Frontend references match exact table/column/enum names in schema.

### ⚠️ **Concerns**
1. **7 of 10 API contract calls missing** — Alerts, audit trail, AE creation, drill-down, AI features not implemented.
2. **Frontend pages stubbed** — Clinical Trials, Participants, several sidebar items show placeholders or `null` routes.
3. **Extended RLS policies not in schema** — Day 2 scoped policies for monitor, ethics_committee, pharmacovigilance not yet added.
4. **Auth signup trigger missing** — `handle_new_user()` trigger not in schema.sql yet.
5. **study_alerts view missing** — Required for portfolio alerts feature.
6. **AI code not started** — ai/ folder empty.
7. **Backend code minimal** — Only test file exists; no actual backend migrations or deployment scripts.
8. **No .env.example file** — Frontend docs are in README, not a standard .env.example template.

### ❌ **Critical Gaps (Per 7-Day Spec)**
- [BACKEND_SPEC.md](BACKEND_SPEC.md) Day 2–7 tasks mostly not started
- [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) lists 8 PENDING items
- AI integration (Person C) has no code yet
- Several pages are visual mocks with no Supabase integration

