# Requirements Document

## Introduction

The Ethics Committee (EC) review action buttons ("Approve & Continue Trial" and "Reject & Suspend Trial") exist in `AdverseEventDetailPage.jsx` but do not appear reliably for EC users. The root cause is a race condition: `loadEvent` runs on mount before the Redux `user` slice has finished loading the EC user's profile, so `profile?.id` is `undefined` at the time `assignedEc` is first evaluated. Because `loadEvent` has `[id]` as its only dependency, it never re-runs when `profile` loads later. The component re-renders when Redux updates, so `assignedEc` recalculates correctly in theory — but only if `profile` has been fully initialised before or during the first render cycle that the component is visible. In practice, when the page is deep-linked or hard-refreshed, `profile` arrives after loading finishes, causing the buttons to never appear.

This spec covers the minimal, targeted fixes required to make the EC review actions reliably visible and functional, without changing coordinator workflows, the 24-hour timer, or the underlying database schema.

## Glossary

- **AdverseEventDetailPage**: The React page component at `/adverse-events/:id`.
- **EC User**: A user whose `profiles.role` is `"ethics_committee"`.
- **Assigned EC**: The EC user whose `profiles.id` matches `ae_reports.ec_id` for the current report.
- **Report**: The latest `ae_reports` row for the current adverse event, fetched by `getLatestAeReportApi`.
- **Profile**: The current user's record in the Redux `user` slice, provided by `useUser()`.
- **assignedEc**: The derived boolean `report?.ec_id === profile?.id`, used to gate EC review actions.
- **profile.initialized**: The `initialized` flag from the Redux `user` slice, which becomes `true` after the first successful or failed profile fetch.
- **reviewAeReportApi**: The existing API function that calls the `review_ae_report` Supabase RPC.
- **loadEvent**: The `useCallback` inside `AdverseEventDetailPage` that fetches the adverse event, latest report, and study in parallel.

## Requirements

### Requirement 1

**User Story:** As an EC user, I want the "Approve & Continue Trial" and "Reject & Suspend Trial" buttons to appear on the AE detail page when I am the assigned reviewer and the report has been submitted, so that I can act on the report.

#### Acceptance Criteria

1. WHEN an EC user navigates to `/adverse-events/:id` AND `profile.initialized` is `false` at the time `loadEvent` completes, THEN the AdverseEventDetailPage SHALL defer rendering the EC review section until `profile.initialized` becomes `true`.
2. WHEN `profile.initialized` is `true` AND `profile.role` is `"ethics_committee"` AND `report` is non-null AND `report.status` is `"submitted"` AND `report.ec_id` equals `profile.id`, THEN the AdverseEventDetailPage SHALL display the review comment textarea, the "Approve & Continue Trial" button, and the "Reject & Suspend Trial" button.
3. WHEN `profile.initialized` is `true` AND `profile.role` is `"ethics_committee"` AND `assignedEc` is `true` AND `report.status` is `"submitted"`, THEN the AdverseEventDetailPage SHALL display the coordinator's `report_comment` and `submitted_at` timestamp immediately above the review action buttons.
4. WHILE `profile.initialized` is `false` AND `profile.role` would be `"ethics_committee"`, THE AdverseEventDetailPage SHALL render a non-intrusive loading indicator in place of the EC review section rather than nothing.

### Requirement 2

**User Story:** As an EC user, I want rejection to require a non-empty review comment, so that coordinators always receive a reason for suspension.

#### Acceptance Criteria

1. WHEN an EC user clicks "Reject & Suspend Trial" AND the review comment field is empty or contains only whitespace, THEN the AdverseEventDetailPage SHALL prevent the `reviewAeReportApi` call and display the error message "A rejection comment is required."
2. WHEN an EC user clicks "Approve & Continue Trial", THEN the AdverseEventDetailPage SHALL call `reviewAeReportApi(report.id, "approved", reviewComment)` regardless of whether the review comment field is empty.
3. AFTER `reviewAeReportApi` resolves successfully, THE AdverseEventDetailPage SHALL call `loadEvent` to refresh all data, causing the review buttons to disappear and the updated report status to appear.

### Requirement 3

**User Story:** As an EC user, I want to see the coordinator's submitted report details before I act, so that I have full context for my decision.

#### Acceptance Criteria

1. WHEN `report` is non-null AND `report.report_comment` is non-null, THEN the AdverseEventDetailPage SHALL display the value of `report.report_comment` labelled "Coordinator's Report" in the EC review section.
2. WHEN `report` is non-null AND `report.submitted_at` is non-null, THEN the AdverseEventDetailPage SHALL display `report.submitted_at` formatted as a locale date-time string labelled "Submitted" in the EC review section.
3. THE `getLatestAeReportApi` function SHALL use `select("*")` so that `ec_id`, `report_comment`, `submitted_at`, `review_comment`, and `id` are all available on the returned `report` object.

### Requirement 4

**User Story:** As a developer, I want `getAdverseEventApi` to include `ec_id` in its `ae_reports` join, so that any future use of the inline join data is consistent with the separate report fetch.

#### Acceptance Criteria

1. THE `getAdverseEventApi` function SHALL use `.select("*, subjects(subject_code), ae_reports(status, submitted_at, ec_id)")` so that `ec_id` is present on embedded `ae_reports` rows.
