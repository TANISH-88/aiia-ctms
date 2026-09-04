# Implementation Plan: EC AE Review Actions

## Overview

Two files require changes. The fix is confined to render logic in `AdverseEventDetailPage.jsx` and one select-string change in `adverseEventsAPI.js`. No schema changes, no new RPC functions, no new components.

## Tasks

- [ ] 1. Fix `getAdverseEventApi` select string to include `ec_id`
  - In `frontend/src/features/adverseEvents/api/adverseEventsAPI.js`, update the `.select(...)` call inside `getAdverseEventApi` from:
    ```
    "*, subjects(subject_code), ae_reports(status, submitted_at)"
    ```
    to:
    ```
    "*, subjects(subject_code), ae_reports(status, submitted_at, ec_id)"
    ```
  - Do not touch any other function in the file.
  - _Requirements: 4.1_

- [ ] 2. Destructure `initialized` from `useUser()` in `AdverseEventDetailPage`
  - In `frontend/src/features/adverseEvents/pages/AdverseEventDetailPage.jsx`, change:
    ```js
    const { user: profile } = useUser();
    ```
    to:
    ```js
    const { user: profile, initialized } = useUser();
    ```
  - `initialized` comes from the Redux `user` slice and becomes `true` once the profile fetch has completed (success or failure).
  - _Requirements: 1.1, 1.4_

- [ ] 3. Replace the EC review section render guard with profile-aware logic
  - Locate the existing JSX block gated on:
    ```jsx
    {profile?.role === "ethics_committee" && assignedEc && report &&
      ["pending", "submitted"].includes(report.status) && ( ... )}
    ```
  - Replace the entire block with the three-branch structure described in the design:
    1. If `profile?.role === "ethics_committee"` is true but `!initialized` → render an inline "Loading review options…" paragraph.
    2. If `initialized && assignedEc && report && report.status === "submitted"` → render the full EC review section (coordinator report details + textarea + buttons).
    3. Otherwise → render nothing (`null`).
  - Narrow the status check to `report.status === "submitted"` only (remove the `"pending"` entry from the array; buttons must not appear for a merely-pending report).
  - _Requirements: 1.1, 1.2, 1.4_

- [ ] 4. Add coordinator report details above the EC action buttons
  - Inside the truthy branch from Task 3, immediately above the review-comment `<label>`, insert a `<div>` that displays:
    - A "Coordinator's Report" heading
    - `report.report_comment` (only when non-null/non-empty)
    - `new Date(report.submitted_at).toLocaleString()` labelled "Submitted"
  - Use the existing Tailwind slate-50 card style already used for the report summary card in the Reporting Timer section so the design is consistent.
  - _Requirements: 1.3, 3.1, 3.2_

- [ ] 5. Checkpoint — verify EC review section behaviour
  - Ensure all existing tests pass.
  - Manually verify (or write a quick smoke test) that:
    - When `initialized=false`, an EC user sees "Loading review options…" and not the buttons.
    - When `initialized=true` and all conditions are met, both buttons appear with coordinator report details above them.
    - When `initialized=true` but `report.status` is not `"submitted"` (e.g. `"approved"`), the section is hidden.
  - Ask the user if any questions arise before continuing.

- [ ]* 6.1 Write property test — EC buttons visible iff all conditions satisfied
  - **Property 1: EC review buttons visible iff all conditions satisfied**
  - Generate combinations of `{ initialized, role, reportStatus, ecIdMatch }` and assert that the Approve and Reject buttons are present in the rendered output if and only if all four conditions are true.
  - Use React Testing Library + Vitest (already in the project's test setup).
  - **Validates: Requirements 1.1, 1.2**

- [ ]* 6.2 Write property test — coordinator report details present above buttons
  - **Property 2: Coordinator report details present above buttons**
  - Generate random `report_comment` strings and `submitted_at` ISO timestamps; render the EC review section with those values and assert both appear in the output.
  - **Validates: Requirements 1.3, 3.1, 3.2**

- [ ]* 6.3 Write property test — whitespace-only rejection comment is blocked
  - **Property 3: Whitespace-only rejection comment is rejected**
  - Generate strings composed entirely of whitespace characters (empty string, spaces, tabs, mixed). For each, simulate clicking "Reject & Suspend Trial" and assert `reviewAeReportApi` is NOT called and the error state equals "A rejection comment is required."
  - **Validates: Requirements 2.1**

- [ ]* 6.4 Write unit test — approve always calls reviewAeReportApi
  - **Property 4: Approve does not require a comment**
  - Test that clicking "Approve & Continue Trial" with an empty review comment still calls `reviewAeReportApi(report.id, "approved", "")` (or whatever trimmed value).
  - **Validates: Requirements 2.2**

- [ ]* 6.5 Write unit test — loadEvent called after successful review
  - **Property 5: Data refresh after successful review**
  - Mock `reviewAeReportApi` to resolve successfully. Click either button and assert that `loadEvent` (or the data-fetching side-effect) fires once after the API resolves.
  - **Validates: Requirements 2.3**

- [ ] 7. Final checkpoint — ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster fix.
- The `reviewReport` validation for empty rejection comments is **already correct** in the existing code — do not modify it.
- The `getLatestAeReportApi` already uses `select("*")` — do not change it.
- The `resumeStudy` button and its condition (`study?.ec_id === profile.id`) are unrelated to this bug fix — do not touch them.
- Do not modify `adverseEventTimer.js` or the 24-hour deadline logic in any way.
