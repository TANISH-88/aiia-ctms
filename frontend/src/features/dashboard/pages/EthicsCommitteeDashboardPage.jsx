import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../user/hooks/useUser";
import { getStudySubmissionsApi } from "../../studySubmissions/api/studySubmissionsAPI";
import { getAdverseEventsApi } from "../../adverseEvents/api/adverseEventsAPI";

// ── Shared helpers ─────────────────────────────────────────────────────────

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  changes_requested: "bg-orange-100 text-orange-800",
  submitted: "bg-blue-100 text-blue-800",
  reviewed: "bg-slate-100 text-slate-600",
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
  const [aeReports, setAeReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [submissionsData, aeData] = await Promise.all([
        getStudySubmissionsApi({ ecId: profile?.id }),
        getAdverseEventsApi(),
      ]);

      // Filter AE reports for this EC and pending review
      const pendingAeReports = aeData.filter(
        (ae) =>
          ae.ae_reports?.some(
            (report) => report.ec_id === profile?.id && report.status === "submitted"
          )
      );

      setStudySubmissions(submissionsData);
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
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fc]">
        <p className="text-sm text-slate-500">Loading Ethics Committee dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f6f8fc] px-6 py-10">
        <div className="rounded-[5px] border border-red-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Unable to load dashboard</h2>
          <p className="mt-2 text-sm text-red-600">{error}</p>
          <button type="button" onClick={load} className="mt-4 rounded-lg bg-[#1d5edb] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#174ec0]">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const pendingStudySubmissions = studySubmissions.filter((s) => s.status === "pending");
  const pendingAeReportsCount = aeReports.length;

  const hasPendingReviews = pendingStudySubmissions.length > 0 || pendingAeReportsCount > 0;

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-[#16233b]">
      <main className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8 lg:px-10">

        {/* ── Page header ── */}
        <div className="border-b border-slate-200 pb-6 mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#3d9673]">
            AIIA-CTMS / Ethics Committee
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[#17243b]">
            Ethics Committee Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}. Review pending submissions.
          </p>
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
                              onClick={() => navigate(`/ethics/submissions/${submission.id}`)}
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

        {/* ── Recent Activity ── */}
        <section>
          <h2 className="mb-5 text-[20px] font-semibold tracking-[-0.02em] text-[#17243b]">
            Recent Activity
          </h2>
          <div className="rounded-[5px] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
            {studySubmissions.length === 0 && aeReports.length === 0 ? (
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
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}