import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../user/hooks/useUser";
import { getStudySubmissionsApi, getAssignedStudiesForEC } from "../../studySubmissions/api/studySubmissionsAPI";
import { getAdverseEventsApi } from "../../adverseEvents/api/adverseEventsAPI";

// ── Shared helpers ─────────────────────────────────────────────────────────

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  changes_requested: "bg-orange-100 text-orange-800",
  submitted: "bg-blue-100 text-blue-800",
  reviewed: "bg-slate-100 text-slate-600",
  awaiting_submission: "bg-slate-100 text-slate-600",
};

function StatusBadge({ status }) {
  const cls = STATUS_STYLES[status] || "bg-slate-100 text-slate-600";
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${cls}`}>
      {(status || "Unknown").replace(/_/g, " ")}
    </span>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function EthicsCommitteeDashboardPage() {
  const navigate = useNavigate();
  const { user: profile } = useUser();

  const [studySubmissions, setStudySubmissions] = useState([]);
  const [assignedStudies, setAssignedStudies] = useState([]);
  const [aeReports, setAeReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [submissionsData, assignedData, aeData] = await Promise.all([
        getStudySubmissionsApi({ ecId: profile?.id }),
        getAssignedStudiesForEC({ ecId: profile?.id }),
        getAdverseEventsApi(),
      ]);

      // Filter AE reports for this EC and pending review
      const pendingAeReports = aeData.filter(
        (ae) =>
          ae.ae_reports?.some(
            (report) => report.ec_id === profile?.id && report.status === "submitted"
          )
      );

      // Merge submissions and assigned studies, avoiding duplicates
      // Submissions take precedence over assignments
      const submissionStudyIds = new Set(submissionsData.map(s => s.study_id));
      const uniqueAssignedStudies = assignedData.filter(
        a => !submissionStudyIds.has(a.studies?.id)
      );

      setStudySubmissions(submissionsData);
      setAssignedStudies(uniqueAssignedStudies);
      setAeReports(pendingAeReports);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f8fb] px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-350">
          <div className="border-b border-[#dfe7ef] pb-6"><div className="h-3 w-48 animate-pulse rounded bg-[#dfe7ef]" /><div className="mt-3 h-8 w-80 animate-pulse rounded bg-[#dfe7ef]" /><div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-[#dfe7ef]" /></div>
          <div className="mt-8 h-6 w-48 animate-pulse rounded bg-[#dfe7ef]" />
          <div className="mt-5 border border-[#dfe7ef] bg-white p-5"><div className="h-3 w-56 animate-pulse rounded bg-[#edf1f5]" />{[1, 2].map((item) => <div key={item} className="mt-5 border-t border-[#edf1f5] pt-5"><div className="h-4 w-72 animate-pulse rounded bg-[#edf1f5]" /><div className="mt-2 h-3 w-40 animate-pulse rounded bg-[#edf1f5]" /></div>)}</div>
          <div className="mt-8 h-6 w-48 animate-pulse rounded bg-[#dfe7ef]" /><div className="mt-5 h-28 animate-pulse border border-[#dfe7ef] bg-white" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f4f8fb] px-6 py-10">
        <div className="border-l-4 border-[#c65345] bg-white px-5 py-5 shadow-[0_8px_24px_rgba(19,52,80,0.06)]">
          <h2 className="text-base font-semibold text-[#16324f]">Unable to load dashboard</h2>
          <p className="mt-2 text-sm text-[#a43d31]">{error}</p>
          <button type="button" onClick={load} className="mt-4 cursor-pointer rounded-[5px] bg-[#1f74d8] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#145db5]">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const pendingStudySubmissions = studySubmissions.filter((s) => s.status === "pending");
  const awaitingSubmissionStudies = assignedStudies.filter((s) => s.status === "awaiting_submission");
  const pendingAeReportsCount = aeReports.length;

  const hasPendingReviews = pendingStudySubmissions.length > 0 || pendingAeReportsCount > 0;
  const hasAssignedStudies = awaitingSubmissionStudies.length > 0;

  return (
    <div className="min-h-screen bg-[#f4f8fb] text-[#16324f]">
      <main className="mx-auto max-w-350 px-5 py-8 sm:px-8 lg:px-10">

        {/* ── Page header ── */}
        <div className="mb-8 flex flex-col gap-4 border-b border-[#dfe7ef] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0d9488]">
            AIIA-CTMS / Ethics Committee
          </p>
          <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-[#16324f]">
            Ethics Committee Dashboard
          </h1>
          <p className="mt-2 text-sm text-[#5d7187]">
            Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}. Review pending submissions.
          </p>
          </div>
          <p className="text-xs font-medium text-[#5d7187]">{pendingStudySubmissions.length + pendingAeReportsCount} pending reviews</p>
        </div>

        {/* ── Pending Reviews (Primary Section) ── */}
        <section className="mb-10">
          <h2 className="mb-5 text-[20px] font-semibold tracking-[-0.02em] text-[#17243b]">
            Pending Reviews
          </h2>

          {!hasPendingReviews ? (
            <div className="rounded-[5px] border border-slate-200 bg-white p-6 flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eaf6ef] text-[#2eaa72] font-bold">
                ✓
              </div>
              <div>
                <p className="text-sm font-semibold text-[#17243b]">No pending reviews</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  All study submissions and AE reports have been reviewed.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Pending Study Submissions */}
              {pendingStudySubmissions.length > 0 && (
                <div className="rounded-[5px] border border-amber-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
                  <div className="border-b border-amber-100 bg-amber-50 px-5 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                      Study Submissions — {pendingStudySubmissions.length} pending
                    </p>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {pendingStudySubmissions.map((submission) => (
                      <div key={submission.id} className="px-5 py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-[#17243b]">
                              {submission.studies?.title || "Untitled Study"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Submitted {submission.submitted_at
                                ? new Date(submission.submitted_at).toLocaleString()
                                : "—"}
                            </p>
                            {submission.comment && (
                              <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded">
                                Coordinator note: {submission.comment}
                              </p>
                            )}
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <StatusBadge status={submission.status} />
                            <button
                              type="button"
                              onClick={() => navigate(`/ethics/submissions/${submission.study_id}`)}
                              className="text-xs font-medium text-[#1d5edb] hover:underline"
                            >
                              Review →
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending AE Reports */}
              {pendingAeReportsCount > 0 && (
                <div className="rounded-[5px] border border-amber-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
                  <div className="border-b border-amber-100 bg-amber-50 px-5 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                      AE Reports — {pendingAeReportsCount} pending
                    </p>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {aeReports.map((ae) => {
                      const pendingReport = ae.ae_reports?.find(
                        (report) => report.ec_id === profile?.id && report.status === "submitted"
                      );
                      if (!pendingReport) return null;

                      return (
                        <div key={ae.id} className="px-5 py-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${ae.is_serious ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>
                                  {ae.is_serious ? "Serious" : "Non-serious"}
                                </span>
                                <span className="text-xs text-slate-500">
                                  {ae.severity || "Unknown severity"}
                                </span>
                              </div>
                              <p className="mt-2 text-sm font-medium text-slate-900 line-clamp-2">
                                {ae.description}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                Subject: {ae.subjects?.subject_code || "Unknown"} · Reported:{" "}
                                {ae.reported_at ? new Date(ae.reported_at).toLocaleDateString() : "Unknown"}
                              </p>
                              {pendingReport.report_comment && (
                                <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded">
                                  Coordinator note: {pendingReport.report_comment}
                                </p>
                              )}
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <StatusBadge status={pendingReport.status} />
                              <button
                                type="button"
                                onClick={() => navigate(`/adverse-events/${ae.id}`)}
                                className="text-xs font-medium text-[#1d5edb] hover:underline"
                              >
                                Review →
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ── Assigned Studies (Awaiting Submission) ── */}
        {hasAssignedStudies && (
          <section className="mb-10">
            <h2 className="mb-5 text-[20px] font-semibold tracking-[-0.02em] text-[#17243b]">
              Assigned Studies — Awaiting Coordinator Submission
            </h2>
            <div className="rounded-[5px] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
              <div className="divide-y divide-slate-100">
                {awaitingSubmissionStudies.map((study) => (
                  <div key={study.studies?.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#17243b]">
                          {study.studies?.title || "Untitled Study"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Phase: {study.studies?.phase || "Not specified"} · Status: {study.studies?.status || "Unknown"}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <StatusBadge status="awaiting_submission" />
                        <button
                          type="button"
                          onClick={() => navigate(`/studies/${study.studies?.id}`)}
                          className="text-xs font-medium text-[#1d5edb] hover:underline"
                        >
                          View details →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Recent Activity ── */}
        <section>
          <h2 className="mb-5 text-[20px] font-semibold tracking-[-0.02em] text-[#17243b]">
            Recent Activity
          </h2>
          <div className="rounded-[5px] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
            {studySubmissions.length === 0 && assignedStudies.length === 0 && aeReports.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-slate-500">No recent activity</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {/* Recent study submissions */}
                {studySubmissions
                  .filter((s) => s.status !== "pending")
                  .slice(0, 5)
                  .map((submission) => (
                    <div key={submission.id} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900">
                            {submission.studies?.title || "Untitled Study"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Reviewed {submission.reviewed_at
                              ? new Date(submission.reviewed_at).toLocaleString()
                              : "—"}
                          </p>
                          {submission.review_comment && (
                            <p className="mt-1 text-xs text-slate-600">
                              Your decision: {submission.review_comment}
                            </p>
                          )}
                        </div>
                        <StatusBadge status={submission.status} />
                      </div>
                    </div>
                  ))}
                {/* Recent assigned studies (awaiting submission) */}
                {assignedStudies
                  .filter((s) => s.status === "awaiting_submission")
                  .slice(0, 3)
                  .map((study) => (
                    <div key={study.studies?.id} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900">
                            {study.studies?.title || "Untitled Study"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Assigned {study.studies?.created_at
                              ? new Date(study.studies.created_at).toLocaleDateString()
                              : "—"}
                          </p>
                        </div>
                        <StatusBadge status="awaiting_submission" />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}