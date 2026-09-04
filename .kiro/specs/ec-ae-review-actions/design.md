# Design Document — EC AE Review Actions

## Overview

Two targeted fixes eliminate the race condition that prevents EC review buttons from appearing on `AdverseEventDetailPage`:

1. **`AdverseEventDetailPage.jsx`** — gate the EC review section on `profile.initialized` (from the Redux `user` slice) in addition to the existing `profile?.role`, `assignedEc`, and `report.status` checks. Show a small inline loader while the profile is still initialising.
2. **`adverseEventsAPI.js`** — add `ec_id` to the `ae_reports` column list in `getAdverseEventApi`'s select string (consistency fix).

No new components, no new API functions, no schema changes, no RPC changes.

## Root Cause Analysis

```
Timeline (hard-refresh / deep-link):
  t=0  Component mounts, loadEvent scheduled via setTimeout(..., 0)
  t=1  loadEvent runs → setLoading(true)
  t=2  getAdverseEventApi + getLatestAeReportApi + getStudyApi resolve
         → setReport(reportData)  ← report.ec_id is now set correctly
         → setLoading(false)       ← loading spinner hides, page renders
  t=3  Redux user slice begins profile fetch (async, separate)
  t=4  Page renders: profile is still null
         assignedEc = report?.ec_id === undefined  →  false
         EC buttons NOT rendered
  t=5  Redux dispatches userSuccess → profile is set
         Component re-renders
         assignedEc = report?.ec_id === profile.id  →  true (if same UUID)
         EC buttons WOULD render — BUT only if no other gate blocks them
```

The current code has no explicit guard for `profile` being `null`. React does re-render when Redux fires, so **in theory** buttons should appear at t=5. In practice:
- If `profile.initialized` is used as an explicit guard, buttons reliably appear after profile loads.
- Without the guard, a stale render at t=4 shows the section as absent; the re-render at t=5 fixes it. This is technically correct but creates a flash where the section is invisible, and in some batched-update scenarios the re-render may not trigger because the component sees no state change from its own local state.

The fix makes the dependency explicit: the EC review section only renders once `profile.initialized === true`, removing any ambiguity.

## Architecture

No architectural changes. The fix is confined to render logic in one component and one string in one API function.

### Component State (unchanged)

```
AdverseEventDetailPage local state:
  event         — adverse_events row
  study         — studies row
  report        — ae_reports row (from getLatestAeReportApi, select("*"))
  loading       — page-level loading flag
  savingReport  — action in-flight flag
  reviewComment — controlled textarea value
  reportComment — controlled textarea value (coordinator)
  showReportForm
  error
  now           — current timestamp for timer

Redux (via useUser()):
  profile           — profiles row { id, role, full_name, site_id, email }
  profile.loading   — user slice loading flag
  profile.initialized — true once userSuccess or userFailure has fired
```

### Derived Values

```js
// Unchanged
const assignedEc = report?.ec_id === profile?.id;
const studySuspended = study?.status === "suspended";

// New guard used in EC section render
const profileReady = profile !== undefined && profile !== null
  ? true
  : initialized;  // initialized from useUser()
```

Because `useUser()` already exposes `initialized`, the component just needs to destructure it:

```js
const { user: profile, initialized } = useUser();
```

## Components

### AdverseEventDetailPage.jsx — Changes

#### 1. Destructure `initialized` from `useUser()`

```jsx
// Before
const { user: profile } = useUser();

// After
const { user: profile, initialized } = useUser();
```

#### 2. Replace the EC review section render guard

The existing condition:
```jsx
{profile?.role === "ethics_committee" && assignedEc && report &&
  ["pending", "submitted"].includes(report.status) && ( ... )}
```

Replace with:
```jsx
{profile?.role === "ethics_committee" && (
  !initialized
    ? (
        // Profile not yet loaded — show inline loader so EC users aren't confused
        <div className="mt-5 border-t border-slate-200 pt-5">
          <p className="text-sm text-slate-400">Loading review options…</p>
        </div>
      )
    : assignedEc && report && report.status === "submitted"
      ? (
          <div className="mt-5 border-t border-slate-200 pt-5">
            {/* Coordinator report details */}
            <div className="mb-4 rounded-[5px] bg-slate-50 p-4 text-sm">
              <p className="font-medium text-slate-700">Coordinator's Report</p>
              {report.report_comment && (
                <p className="mt-1 text-slate-600">{report.report_comment}</p>
              )}
              <p className="mt-1 text-slate-500">
                Submitted: {new Date(report.submitted_at).toLocaleString()}
              </p>
            </div>
            {/* Review comment + action buttons */}
            <label htmlFor="review_comment"
              className="block text-sm font-medium text-slate-700">
              Review comment
            </label>
            <textarea
              id="review_comment"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              rows={3}
              placeholder="Required when rejecting"
              className="mt-2 w-full rounded-[5px] border border-slate-300 px-3 py-2
                         text-sm text-slate-900 focus:border-[#1d5edb] focus:outline-none
                         focus:ring-1 focus:ring-[#1d5edb]"
            />
            <div className="mt-3 flex gap-3">
              <button
                type="button"
                disabled={savingReport}
                onClick={() => reviewReport("approved")}
                className="rounded-lg bg-[#1d5edb] px-4 py-2 text-sm font-medium
                           text-white disabled:opacity-50">
                Approve &amp; Continue Trial
              </button>
              <button
                type="button"
                disabled={savingReport}
                onClick={() => reviewReport("rejected")}
                className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm
                           font-medium text-red-700 disabled:opacity-50">
                Reject &amp; Suspend Trial
              </button>
            </div>
          </div>
        )
      : null
)}
```

Key changes vs the original:
- Status check narrowed from `["pending", "submitted"].includes(report.status)` to `report.status === "submitted"` — buttons should only appear after the coordinator has submitted, not while the report is merely "pending".
- Coordinator's `report_comment` and `submitted_at` displayed above the action buttons (Requirement 3).
- Inline loader shown while `!initialized` and role is `ethics_committee` (Requirement 1.4).

#### 3. `reviewReport` validation — already correct, no change needed

The existing `reviewReport` function already checks `if (status === "rejected" && !reviewComment.trim())` before calling the API. No modification needed.

### adverseEventsAPI.js — Changes

#### 4. Add `ec_id` to `getAdverseEventApi` select

```js
// Before
.select("*, subjects(subject_code), ae_reports(status, submitted_at)")

// After
.select("*, subjects(subject_code), ae_reports(status, submitted_at, ec_id)")
```

#### 5. Confirm `getLatestAeReportApi` uses `select("*")`

Already correct — no change needed. Document this as a confirmed-good baseline.

## Data Flow

```
EC User hard-refreshes /adverse-events/:id
  │
  ├─ loadEvent() fires (setTimeout 0)
  │    ├─ getAdverseEventApi(id)          → event (includes ae_reports with ec_id)
  │    ├─ getLatestAeReportApi(id)        → report (select * → has ec_id, report_comment, etc.)
  │    └─ getStudyApi(event.study_id)     → study
  │         setLoading(false)
  │
  ├─ Redux user slice fires userSuccess   → profile.id, profile.role, initialized=true
  │
  └─ Component re-renders
       profile.role === "ethics_committee"  ✓
       initialized === true                 ✓  (new explicit guard)
       report.status === "submitted"        ✓
       report.ec_id === profile.id          ✓  (ec_id present from select *)
       → EC review section renders with coordinator report details + action buttons
```

## Error Handling

- Rejection without comment: handled by existing `reviewReport` guard; sets local `error` state and returns early without API call.
- API failure on `reviewAeReportApi`: caught by existing try/catch; sets `error` state, `savingReport` reset to false.
- Profile load failure (`userFailure`): `initialized` becomes `true`, `profile` remains `null`. The EC role check `profile?.role === "ethics_committee"` evaluates to `false`, so the EC section is hidden entirely — correct behaviour.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do.*

### Property 1: EC review buttons visible iff all conditions satisfied

For any combination of `{ profile, initialized, report }` values, the EC review action buttons (Approve and Reject) are rendered if and only if `initialized === true` AND `profile.role === "ethics_committee"` AND `report !== null` AND `report.status === "submitted"` AND `report.ec_id === profile.id`.

**Validates: Requirements 1.1, 1.2**

### Property 2: Coordinator report details present above buttons

For any `report` object with non-null `report_comment` and `submitted_at`, when the EC review section renders, the rendered output contains both the value of `report.report_comment` and the locale-formatted `report.submitted_at`.

**Validates: Requirements 1.3, 3.1, 3.2**

### Property 3: Whitespace-only rejection comment is rejected

For any string composed entirely of whitespace characters (including the empty string), clicking "Reject & Suspend Trial" with that string as the review comment SHALL result in `reviewAeReportApi` not being called and the error message "A rejection comment is required." being set.

**Validates: Requirements 2.1**

### Property 4: Approve does not require a comment

For any review comment value (empty, whitespace, or non-empty), clicking "Approve & Continue Trial" SHALL always call `reviewAeReportApi(report.id, "approved", reviewComment)` without blocking.

**Validates: Requirements 2.2**

### Property 5: Data refresh after successful review

For any outcome of `reviewAeReportApi` that resolves without throwing, the `loadEvent` function SHALL be called exactly once afterward, causing the report state to be refreshed.

**Validates: Requirements 2.3**
