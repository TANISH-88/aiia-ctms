# AIIA-CTMS Route Reference

Generated from `frontend/src/app/app.routes.jsx`.

---

## 1. Public Routes

No authentication required. Authenticated users are automatically redirected away from these pages (handled by `PublicRoute`).

| Path | Component | File |
|---|---|---|
| `/` | `HomePage` | `src/pages/HomePage.jsx` |
| `/auth/login` | `LoginPage` | `src/features/auth/pages/LoginPage.jsx` |
| `/auth/forget-password` | `ForgetPasswordPage` | `src/features/auth/pages/ForgetPasswordPage.jsx` |
| `/403` | `InvalidAccessPage` | `src/pages/InvalidAccessPage.jsx` |
| `*` | Redirect to `/` | — |

---

## 2. First-Login Setup

Requires authentication (`ProtectedRoute`). Gated by `RequireProfileSetup` — only reachable when `profiles.profile_completed = false`. Users with `profile_completed = true` are automatically redirected to `/dashboard`.

| Path | Component | File |
|---|---|---|
| `/auth/setup` | `FirstLoginSetupPage` | `src/features/auth/pages/FirstLoginSetupPage.jsx` |

**What happens here:**
- User sets their display name
- User sets a new password (replaces the admin-assigned temporary password)
- On success: `profiles.full_name` and `profiles.profile_completed = true` are saved
- Redirects to the role-appropriate dashboard

---

## 3. CTMS Application Routes

All routes below require:
1. A valid Supabase session (`ProtectedRoute`)
2. `profile_completed = true` (`RequireProfileSetup`) — otherwise redirected to `/auth/setup`
3. The user's role to be in the `allowedRoles` list for that route group (`RoleRoute`)

All CTMS routes are rendered inside `CTMSLayout` (sidebar + top bar).

---

### 3.1 Dashboard

| Path | Component | Allowed Roles |
|---|---|---|
| `/dashboard` | `RoleDashboardPage` | admin, study_coordinator, ethics_committee, principal_investigator, monitor, pharmacovigilance, regulator_readonly |

`RoleDashboardPage` renders a different dashboard UI based on the logged-in user's role:
- `principal_investigator` → PI Dashboard (study oversight, enrollment, safety, alerts)
- All other roles → General Dashboard (KPIs, study performance, attention required)

---

### 3.2 Clinical Trials & Studies

| Path | Component | Allowed Roles |
|---|---|---|
| `/clinical-trials` | `Trial` | admin, study_coordinator, principal_investigator |
| `/participants` | `ParticipantsPage` | admin, study_coordinator, principal_investigator |
| `/studies/:id` | `StudyDetailPage` | admin, study_coordinator, principal_investigator |
| `/study` | `Study` | admin, study_coordinator |
| `/studies/:id/report-ae` | `ReportAEPage` | admin, study_coordinator |

**Access notes:**
- PI has read-only access to `/clinical-trials`, `/participants`, and `/studies/:id`. The "Report Adverse Event" and "Submit to Ethics Committee" buttons are hidden for PI inside `StudyDetailPage`.
- `/study` (create/manage studies) and `/studies/:id/report-ae` (report an AE) are coordinator/admin only.

---

### 3.3 Ethics Committee

| Path | Component | Allowed Roles |
|---|---|---|
| `/ethics/submissions` | `StudySubmissionsPage` | admin, study_coordinator, ethics_committee, principal_investigator |
| `/ethics/submissions/:id` | `ReviewStudyPage` | admin, ethics_committee |
| `/adverse-events` | `AdverseEventsPage` | admin, study_coordinator, ethics_committee, principal_investigator |
| `/adverse-events/:id` | `AdverseEventDetailPage` | admin, study_coordinator, ethics_committee, principal_investigator |

**Access notes:**
- `/ethics/submissions` is visible to PI for monitoring submission status only — no write actions.
- `/ethics/submissions/:id` (the EC review/decision page with Approve / Reject / Request Changes) is restricted to `ethics_committee` and `admin`. PI cannot access this route.
- `/adverse-events/:id` renders different UI per role:
  - `ethics_committee` — EC review interface (Approve & Continue Trial / Reject & Suspend Trial)
  - `study_coordinator` — Coordinator interface (Mark Reported / Submit to EC)
  - `principal_investigator` / `admin` — Read-only view

---

### 3.4 Administration

| Path | Component | Allowed Roles |
|---|---|---|
| `/alerts` | `AlertsPage` | admin only |
| `/audit-trail` | `AuditLogPage` | admin only |

---

## 4. User Profile

Requires authentication (`ProtectedRoute`) and `profile_completed = true` (`RequireProfileSetup`). Rendered outside `CTMSLayout` (no sidebar). Accessible to any authenticated, fully set-up user regardless of role.

| Path | Component | Allowed Roles |
|---|---|---|
| `/user/profile` | `ProfilePage` | Any authenticated user with profile_completed = true |

---

## 5. Role Access Matrix

| Route | admin | study_coordinator | ethics_committee | principal_investigator | monitor | pharmacovigilance | regulator_readonly |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `/dashboard` | Y | Y | Y | Y | Y | Y | Y |
| `/clinical-trials` | Y | Y | — | Y (read) | — | — | — |
| `/participants` | Y | Y | — | Y (read) | — | — | — |
| `/studies/:id` | Y | Y | — | Y (read) | — | — | — |
| `/study` | Y | Y | — | — | — | — | — |
| `/studies/:id/report-ae` | Y | Y | — | — | — | — | — |
| `/ethics/submissions` | Y | Y | Y | Y (read) | — | — | — |
| `/ethics/submissions/:id` | Y | — | Y | — | — | — | — |
| `/adverse-events` | Y | Y | Y | Y (read) | — | — | — |
| `/adverse-events/:id` | Y | Y | Y | Y (read) | — | — | — |
| `/alerts` | Y | — | — | — | — | — | — |
| `/audit-trail` | Y | — | — | — | — | — | — |
| `/user/profile` | Y | Y | Y | Y | Y | Y | Y |
| `/auth/setup` | Y* | Y* | Y* | Y* | Y* | Y* | Y* |

*Only when `profile_completed = false`

---

## 6. Redirect Behaviour

| Condition | Redirects to |
|---|---|
| Unauthenticated user visits any CTMS route | `/auth/login` |
| Authenticated user with `profile_completed = false` visits any CTMS route | `/auth/setup` |
| Authenticated user with `profile_completed = true` visits `/auth/setup` | `/dashboard` |
| Authenticated user visits `/auth/login` or `/auth/forget-password` | `/dashboard` (or `/auth/setup` if profile not complete) |
| Any unknown path (`*`) | `/` |
| Role visits a route not in their `allowedRoles` | `InvalidAccessPage` (403) |
