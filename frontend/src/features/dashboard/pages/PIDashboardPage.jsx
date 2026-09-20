import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../user/hooks/useUser";
import { getPiDashboardApi } from "../api/piDashboardAPI";

// ── Shared helpers ─────────────────────────────────────────────────────────

const STATUS_STYLES = {
  active:               "bg-[#eaf6ef] text-[#3a9b70]",
  enrolling:            "bg-blue-50 text-blue-700",
  ec_approved:          "bg-amber-50 text-amber-700",
  ec_approval_pending:  "bg-amber-50 text-amber-700",
  protocol_draft:       "bg-slate-100 text-slate-600",
  ctri_registered:      "bg-indigo-50 text-indigo-700",
  closed:               "bg-slate-100 text-slate-500",
  suspended:            "bg-red-50 text-red-700",
};

function StatusBadge({ status }) {
  const cls = STATUS_STYLES[status] || "bg-slate-100 text-slate-600";
  const label = status === "protocol_draft" ? "Pending Ethics Review" : (status || "Unknown").replace(/_/g, " ");
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${cls}`}>
      {label}
    </span>
  );
}

function KpiCard({ label, value, sub, color = "text-[#17243b]", dot, onClick }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`rounded-[5px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)] ${onClick ? "cursor-pointer text-left transition hover:border-[#1d5edb]" : ""}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        {dot && <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />}
      </div>
      <p className={`mt-4 text-[30px] font-semibold tracking-[-0.04em] ${color}`}>{value}</p>
      {sub && <p className="mt-1.5 text-xs text-slate-400">{sub}</p>}
    </Tag>
  );
}

function SectionHeader({ title, sub }) {
  return (
    <div className="mb-5">
      <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-[#17243b]">{title}</h2>
      {sub && <p className="mt-1 text-sm text-slate-500">{sub}</p>}
    </div>
  );
}

function EnrollmentBar({ actual, target }) {
  const pct = target ? Math.min(100, Math.round((actual / target) * 100)) : 0;
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>{actual} enrolled</span>
        <span className="font-semibold text-[#17243b]">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full bg-[#2eaa72]" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-xs text-slate-400">Target: {target}</p>
    </div>
  );
}

// Clearly marks a section as read-only oversight for the PI
function OversightNote({ children }) {
  return (
    <p className="mb-4 rounded-[5px] border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-500">
      {children}
    </p>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function PIDashboardPage() {
  const navigate = useNavigate();
  const { user: profile } = useUser();

  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPiDashboardApi();
      setDashData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fc]">
        <p className="text-sm text-slate-500">Loading PI dashboard…</p>
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

  const {
    studies = [],
    totals = {},
    alerts = [],
    pendingApprovals = [],
    recentEcDecisions = [],
    pendingAeReviews = [],
  } = dashData || {};

  const overallPct = totals.targetEnrollment
    ? Math.min(100, Math.round((totals.actualEnrollment / totals.targetEnrollment) * 100))
    : 0;

  const criticalAlerts = alerts.filter((a) => a.severity === "critical");
  const warningAlerts  = alerts.filter((a) => a.severity === "warning");

  // Submissions with EC feedback that the coordinator needs to act on
  // (PI monitors this — they do NOT resubmit; that's the coordinator's job)
  const submissionsNeedingCoordinatorAction = studies.filter(
    (s) => s.submission?.status === "rejected" || s.submission?.status === "changes_requested",
  );

  const hasMajorDecisions =
    pendingApprovals.length > 0 || recentEcDecisions.length > 0;

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-[#16233b]">
      <main className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8 lg:px-10">

        {/* ── Page header ── */}
        <div className="border-b border-slate-200 pb-6 mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#3d9673]">
            AIIA-CTMS / Principal Investigator
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[#17243b]">
            PI Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}. Study-level oversight across your portfolio.
          </p>
        </div>

        {/* No studies assigned */}
        {studies.length === 0 && (
          <div className="rounded-[5px] border border-slate-200 bg-white p-8 text-center">
            <p className="text-sm font-medium text-slate-700">No studies assigned to you</p>
            <p className="mt-1 text-sm text-slate-500">
              Contact your administrator to be assigned as Principal Investigator to a study.
            </p>
          </div>
        )}

        {studies.length > 0 && (
          <div className="space-y-10">

            {/* ── 1. Study Overview ── */}
            <section>
              <SectionHeader
                title="Study Overview"
                sub="Portfolio-level metrics across all studies you lead"
              />
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                <KpiCard label="Studies" value={totals.studies} sub="Assigned to you" dot="bg-[#2eaa72]" />
                <KpiCard
                  label="Subjects / Sites"
                  value={`${totals.subjects || 0}/${totals.sites || 0}`}
                  sub="Subjects across sites"
                  dot="bg-[#2eaa72]"
                />
                <KpiCard
                  label="Total Enrollment"
                  value={`${totals.actualEnrollment}/${totals.targetEnrollment}`}
                  sub={`${overallPct}% of target`}
                  dot="bg-[#2eaa72]"
                />
                <KpiCard
                  label="Open AEs"
                  value={totals.openAe}
                  sub="Adverse events (read-only)"
                  color={totals.openAe > 0 ? "text-[#d18a18]" : "text-[#17243b]"}
                  dot={totals.openAe > 0 ? "bg-[#d48b16]" : "bg-[#2eaa72]"}
                  onClick={totals.openAe > 0 ? () => navigate("/adverse-events?filter=open") : undefined}
                />
                <KpiCard
                  label="Overdue SAEs"
                  value={totals.overdueSae}
                  sub="Requires coordinator action"
                  color={totals.overdueSae > 0 ? "text-[#d33d43]" : "text-[#17243b]"}
                  dot={totals.overdueSae > 0 ? "bg-[#d93c42]" : "bg-[#2eaa72]"}
                  onClick={totals.overdueSae > 0 ? () => navigate("/adverse-events?filter=overdue") : undefined}
                />
                <KpiCard label="Protocol Deviations" value={totals.deviations} sub="Across all studies" dot="bg-[#2eaa72]" />
              </div>
            </section>

            {/* ── Major Study Decisions (PI review) ── */}
            <section>
              <SectionHeader
                title="Major Study Decisions"
                sub="Review pending and recent Ethics Committee decisions for your studies"
              />
              <OversightNote>
                PI reviews study-level decisions here. Formal EC approval/rejection is performed by the Ethics Committee.
                Resubmission after changes is a Coordinator responsibility.
              </OversightNote>

              {!hasMajorDecisions ? (
                <div className="rounded-[5px] border border-slate-200 bg-white p-6 flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eaf6ef] text-[#2eaa72] font-bold">✓</div>
                  <div>
                    <p className="text-sm font-semibold text-[#17243b]">No major decisions pending review</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      When EC submissions are pending or recently decided, they will appear here for your oversight.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingApprovals.length > 0 && (
                    <div className="overflow-hidden rounded-[5px] border border-amber-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
                      <div className="border-b border-amber-100 bg-amber-50 px-5 py-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                          Awaiting EC decision — {pendingApprovals.length} study{pendingApprovals.length > 1 ? "ies" : ""}
                        </p>
                      </div>
                      <ul className="divide-y divide-slate-100">
                        {pendingApprovals.map((study) => (
                          <li key={study.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[#17243b]">{study.title}</p>
                              <p className="mt-0.5 text-xs text-slate-500">
                                Submitted {study.submission?.submitted_at
                                  ? new Date(study.submission.submitted_at).toLocaleString()
                                  : "—"}
                                {" · "}Study status: <span className="capitalize">{study.status === "protocol_draft" ? "Pending Ethics Review" : (study.status || "").replace(/_/g, " ")}</span>
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                                Pending EC
                              </span>
                              <button
                                type="button"
                                onClick={() => navigate(`/studies/${study.id}`)}
                                className="text-xs font-medium text-[#1d5edb] hover:underline"
                              >
                                Review study →
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {recentEcDecisions.length > 0 && (
                    <div className="overflow-hidden rounded-[5px] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
                      <div className="border-b border-slate-100 bg-[#fbfcfe] px-5 py-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Recent EC outcomes — review &amp; acknowledge
                        </p>
                      </div>
                      <ul className="divide-y divide-slate-100">
                        {recentEcDecisions.map((study) => {
                          const status = study.submission?.status;
                          const badgeCls =
                            status === "approved"
                              ? "bg-green-100 text-green-800"
                              : status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-orange-100 text-orange-800";
                          return (
                            <li key={study.id} className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-[#17243b]">{study.title}</p>
                                <p className="mt-0.5 text-xs text-slate-500">
                                  Reviewed {study.submission?.reviewed_at
                                    ? new Date(study.submission.reviewed_at).toLocaleString()
                                    : "—"}
                                </p>
                                {study.submission?.review_comment && (
                                  <p className="mt-1 text-xs text-slate-600">
                                    EC: &ldquo;{study.submission.review_comment}&rdquo;
                                  </p>
                                )}
                                {status !== "approved" && (
                                  <p className="mt-1 text-xs text-slate-500">
                                    Coordinator must address feedback and resubmit — not a PI operational action.
                                  </p>
                                )}
                              </div>
                              <div className="flex shrink-0 items-center gap-3">
                                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${badgeCls}`}>
                                  {(status || "").replace(/_/g, " ")}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => navigate(`/studies/${study.id}`)}
                                  className="text-xs font-medium text-[#1d5edb] hover:underline"
                                >
                                  Review details →
                                </button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* ── 2. Recruitment & Progress ── */}
            <section>
              <SectionHeader
                title="Recruitment & Progress"
                sub="Enrollment progress and site safety metrics per study"
              />
              <OversightNote>
                Read-only. Subject enrollment and visit recording are performed by the Study Coordinator.
              </OversightNote>
              <div className="grid gap-4 lg:grid-cols-2">
                {studies.map((study) => (
                  <div key={study.id} className="rounded-[5px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="min-w-0">
                        <p className="font-semibold text-[15px] text-[#17243b] truncate">{study.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {study.phase ? `Phase ${study.phase}` : "Phase N/A"}
                          {study.ctri_number ? ` · ${study.ctri_number}` : ""}
                        </p>
                      </div>
                      <StatusBadge status={study.status} />
                    </div>
                    <EnrollmentBar actual={study.actual_enrollment} target={study.target_enrollment} />
                    <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4 text-center text-xs">
                      <div>
                        <p className="font-semibold text-[#17243b]">{study.deviation_count}</p>
                        <p className="text-slate-400 mt-0.5">Deviations</p>
                      </div>
                      <div>
                        <p className={`font-semibold ${study.open_ae_count > 0 ? "text-[#d18a18]" : "text-[#17243b]"}`}>
                          {study.open_ae_count}
                        </p>
                        <p className="text-slate-400 mt-0.5">Open AEs</p>
                      </div>
                      <div>
                        <p className={`font-semibold ${study.overdue_sae_count > 0 ? "text-[#d33d43]" : "text-[#17243b]"}`}>
                          {study.overdue_sae_count}
                        </p>
                        <p className="text-slate-400 mt-0.5">Overdue SAEs</p>
                      </div>
                    </div>
                    {/* Read-only navigation — no write actions */}
                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        onClick={() => navigate(`/studies/${study.id}`)}
                        className="text-xs font-medium text-[#1d5edb] hover:underline"
                      >
                        View full study details →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── 3. AE/SAE & Safety ── */}
            <section>
              <SectionHeader
                title="AE/SAE & Safety"
                sub="Safety signal overview across your studies"
              />
              <OversightNote>
                Read-only. AE/SAE reporting and submission to EC are performed by the Study Coordinator.
              </OversightNote>

              {studies.every((s) => s.open_ae_count === 0 && s.overdue_sae_count === 0) ? (
                <div className="rounded-[5px] border border-slate-200 bg-white p-6 flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eaf6ef] text-[#2eaa72] font-bold">✓</div>
                  <div>
                    <p className="text-sm font-semibold text-[#17243b]">No open safety events</p>
                    <p className="mt-0.5 text-xs text-slate-500">All AE/SAE indicators are within acceptable range.</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-hidden rounded-[5px] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
                  <table className="w-full min-w-[600px] border-collapse text-sm">
                    <thead className="bg-[#fbfcfe] border-b border-slate-200">
                      <tr>
                        {["Study", "Status", "Open AEs", "Overdue SAEs", "Total SAEs", "View"].map((h) => (
                          <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {studies.map((study) => (
                        <tr key={study.id} className="border-b border-slate-100 last:border-b-0">
                          <td className="px-5 py-4">
                            <p className="font-medium text-[#17243b] text-[13px]">{study.title}</p>
                          </td>
                          <td className="px-5 py-4"><StatusBadge status={study.status} /></td>
                          <td className="px-5 py-4">
                            <span className={`font-semibold ${study.open_ae_count > 0 ? "text-[#d18a18]" : "text-[#17243b]"}`}>
                              {study.open_ae_count}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`font-semibold ${study.overdue_sae_count > 0 ? "text-[#d33d43]" : "text-[#17243b]"}`}>
                              {study.overdue_sae_count}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-[#17243b] font-medium">{study.total_sae_count}</td>
                          <td className="px-5 py-4">
                            <button
                              type="button"
                              onClick={() => navigate("/adverse-events")}
                              className="text-[#1d5edb] text-xs font-medium hover:underline"
                            >
                              View AE list →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* AE reports awaiting EC review — PI can see the status, not act on it */}
              {pendingAeReviews.length > 0 && (
                <div className="mt-4 rounded-[5px] border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-amber-900">
                    {pendingAeReviews.length} AE report{pendingAeReviews.length > 1 ? "s" : ""} submitted and awaiting Ethics Committee review
                  </p>
                  <p className="mt-1 text-xs text-amber-700">
                    The coordinator has submitted these reports. No action required from PI — the assigned Ethics Committee will review.
                  </p>
                </div>
              )}
            </section>

            {/* ── 4. Regulatory & EC Submission Status ── */}
            <section>
              <SectionHeader
                title="Regulatory & EC Submission Status"
                sub="Monitor the status of Ethics Committee submissions for your studies"
              />
              <OversightNote>
                Read-only oversight. EC submissions are prepared and submitted by the Study Coordinator. EC approval decisions are made by the Ethics Committee.
              </OversightNote>

              <div className="overflow-hidden rounded-[5px] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
                <table className="w-full min-w-[640px] border-collapse text-sm">
                  <thead className="bg-[#fbfcfe] border-b border-slate-200">
                    <tr>
                      {["Study", "Study Status", "EC Submission", "EC Approval Date", "CTRI Number", "View"].map((h) => (
                        <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {studies.map((study) => {
                      const submissionStatus = study.submission?.status || "not submitted";
                      const submissionColors = {
                        pending:           "bg-amber-100 text-amber-800",
                        approved:          "bg-green-100 text-green-800",
                        rejected:          "bg-red-100 text-red-800",
                        changes_requested: "bg-orange-100 text-orange-800",
                        "not submitted":   "bg-slate-100 text-slate-600",
                      };
                      return (
                        <tr key={study.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                          <td className="px-5 py-4">
                            <p className="font-semibold text-[#17243b] text-[13px] max-w-[200px] truncate">{study.title}</p>
                          </td>
                          <td className="px-5 py-4"><StatusBadge status={study.status} /></td>
                          <td className="px-5 py-4">
                            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${submissionColors[submissionStatus] || "bg-slate-100 text-slate-600"}`}>
                              {submissionStatus.replace(/_/g, " ")}
                            </span>
                            {/* Show EC review comment for visibility — PI reads, doesn't act */}
                            {study.submission?.review_comment && (
                              <p className="mt-1 text-[11px] text-slate-500 max-w-[200px]">
                                EC: "{study.submission.review_comment}"
                              </p>
                            )}
                          </td>
                          <td className="px-5 py-4 text-xs text-slate-600">
                            {study.ec_approval_date || "—"}
                          </td>
                          <td className="px-5 py-4 text-xs text-slate-600 font-mono">
                            {study.ctri_number || "Not registered"}
                          </td>
                          <td className="px-5 py-4">
                            <button
                              type="button"
                              onClick={() => navigate(`/studies/${study.id}`)}
                              className="text-[#1d5edb] text-xs font-medium hover:underline"
                            >
                              Study details →
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Coordinator follow-up needed — PI is informed, coordinator acts */}
              {submissionsNeedingCoordinatorAction.length > 0 && (
                <div className="mt-4 rounded-[5px] border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-semibold text-red-900 mb-2">
                    EC action required on {submissionsNeedingCoordinatorAction.length} submission{submissionsNeedingCoordinatorAction.length > 1 ? "s" : ""}
                  </p>
                  {submissionsNeedingCoordinatorAction.map((study) => (
                    <div key={study.id} className="flex items-start justify-between gap-4 py-2 border-t border-red-200 first:border-0">
                      <div>
                        <p className="text-sm font-medium text-red-900">{study.title}</p>
                        <p className="text-xs text-red-700 mt-0.5 capitalize">
                          {study.submission.status.replace("_", " ")}
                          {study.submission.review_comment ? ` — "${study.submission.review_comment}"` : ""}
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                          The Study Coordinator must address this and resubmit.
                        </p>
                      </div>
                      <span className="shrink-0 inline-block rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 capitalize">
                        {study.submission.status.replace("_", " ")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ── 5. Study Alerts ── */}
            <section>
              <SectionHeader
                title="Study Alerts"
                sub="Active compliance and safety alerts for your studies"
              />
              {alerts.length === 0 ? (
                <div className="rounded-[5px] border border-slate-200 bg-white p-6 flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eaf6ef] text-[#2eaa72] font-bold">✓</div>
                  <div>
                    <p className="text-sm font-semibold text-[#17243b]">No active alerts</p>
                    <p className="mt-0.5 text-xs text-slate-500">All compliance deadlines are within range.</p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-3">
                  {criticalAlerts.length > 0 && (
                    <div className="rounded-[5px] border border-red-200 bg-red-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-red-700 mb-3">
                        Critical — {criticalAlerts.length} alert{criticalAlerts.length > 1 ? "s" : ""}
                      </p>
                      {criticalAlerts.map((alert, i) => (
                        <div key={i} className="flex items-start gap-3 py-2 border-t border-red-200 first:border-0">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-700">!</span>
                          <div>
                            <p className="text-sm font-medium text-red-900">{alert.message}</p>
                            {alert.due_at && (
                              <p className="text-xs text-red-600 mt-0.5">Due: {new Date(alert.due_at).toLocaleString()}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {warningAlerts.length > 0 && (
                    <div className="rounded-[5px] border border-amber-200 bg-amber-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-3">
                        Warning — {warningAlerts.length} alert{warningAlerts.length > 1 ? "s" : ""}
                      </p>
                      {warningAlerts.map((alert, i) => (
                        <div key={i} className="flex items-start gap-3 py-2 border-t border-amber-200 first:border-0">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700">!</span>
                          <div>
                            <p className="text-sm font-medium text-amber-900">{alert.message}</p>
                            {alert.due_at && (
                              <p className="text-xs text-amber-600 mt-0.5">Due: {new Date(alert.due_at).toLocaleDateString()}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* ── Subjects & Sites Overview ── */}
            <section>
              <SectionHeader
                title="Subjects & Sites Overview"
                sub="High-level view of enrollment and site activation across your studies"
              />
              <OversightNote>
                Read-only. Adding subjects and recording visits are Coordinator responsibilities.
              </OversightNote>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {studies.map((study) => (
                  <div key={study.id} className="rounded-[5px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <p className="font-semibold text-[14px] text-[#17243b] truncate">{study.title}</p>
                      <StatusBadge status={study.status} />
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Sites</span>
                        <span className="font-medium text-[#17243b]">
                          {study.activated_site_count}/{study.site_count} activated
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Subjects</span>
                        <span className="font-medium text-[#17243b]">
                          {study.subject_count} total · {study.enrolled_subject_count} enrolled
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Enrollment progress</span>
                        <span className="font-medium text-[#17243b]">
                          {study.actual_enrollment}/{study.target_enrollment}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Phase</span>
                        <span className="text-slate-700">{study.phase || "—"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Deviations</span>
                        <span className={`font-medium ${study.deviation_count > 0 ? "text-amber-700" : "text-[#17243b]"}`}>
                          {study.deviation_count}
                        </span>
                      </div>
                    </div>
                    {study.sites?.length > 0 && (
                      <div className="mt-3 border-t border-slate-100 pt-3">
                        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Sites</p>
                        <ul className="space-y-1">
                          {study.sites.slice(0, 3).map((site) => (
                            <li key={site.id} className="flex justify-between text-xs text-slate-600">
                              <span className="truncate">{site.name}</span>
                              <span className={site.activated_at ? "text-[#2eaa72]" : "text-slate-400"}>
                                {site.activated_at ? "Active" : "Pending"}
                              </span>
                            </li>
                          ))}
                          {study.sites.length > 3 && (
                            <li className="text-xs text-slate-400">+{study.sites.length - 3} more</li>
                          )}
                        </ul>
                      </div>
                    )}
                    <div className="mt-4 border-t border-slate-100 pt-3">
                      <button
                        type="button"
                        onClick={() => navigate(`/studies/${study.id}`)}
                        className="text-xs font-medium text-[#1d5edb] hover:underline"
                      >
                        View subjects & sites →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── 7. Regulatory Documents ── */}
            <section>
              <SectionHeader
                title="Regulatory Documents"
                sub="EC approval status, CTRI registration, and protocol dates"
              />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {studies.map((study) => (
                  <div key={study.id} className="rounded-[5px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
                    <p className="text-sm font-semibold text-[#17243b] truncate mb-3">{study.title}</p>
                    <div className="space-y-2.5">
                      {[
                        {
                          label: "EC Approval",
                          value: study.ec_approval_date || null,
                          present: !!study.ec_approval_date,
                        },
                        {
                          label: "CTRI Registration",
                          value: study.ctri_number || null,
                          present: !!study.ctri_number,
                        },
                        {
                          label: "Study Start",
                          value: study.start_date || null,
                          present: !!study.start_date,
                        },
                        {
                          label: "Study End",
                          value: study.end_date || null,
                          present: !!study.end_date,
                        },
                      ].map((doc) => (
                        <div key={doc.label} className="flex items-center justify-between text-xs">
                          <span className="text-slate-600">{doc.label}</span>
                          <span className={doc.present ? "text-[#2eaa72] font-medium" : "text-slate-400"}>
                            {doc.value || "Not on file"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-400">
                Document upload and management will be available in a future release.
              </p>
            </section>

            {/* ── 8. PI Quick Actions (oversight only) ── */}
            <section className="pb-10">
              <SectionHeader
                title="Quick Access"
                sub="Navigate to oversight views — all actions here are read-only for PI"
              />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                {/* View AE/SAE list — read-only */}
                <button
                  type="button"
                  onClick={() => navigate("/adverse-events")}
                  className="rounded-[5px] border border-slate-200 bg-white p-5 text-left shadow-[0_1px_3px_rgba(15,23,42,0.03)] transition hover:border-[#1d5edb] hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff0ef] mb-3">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#d33d43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
                      <path d="M12 3 2 21h20L12 3Zm0 5v6m0 4v.1" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-[#17243b]">AE/SAE Overview</p>
                  <p className="mt-0.5 text-xs text-slate-500">Monitor adverse event status (view only)</p>
                </button>

                {/* View EC submission status — read-only */}
                <button
                  type="button"
                  onClick={() => navigate("/ethics/submissions")}
                  className="rounded-[5px] border border-slate-200 bg-white p-5 text-left shadow-[0_1px_3px_rgba(15,23,42,0.03)] transition hover:border-[#1d5edb] hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef3ff] mb-3">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#1d5edb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
                      <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm-2-5-4-4 1.4-1.4L10 14.2l6.6-6.6L18 9l-8 8Z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-[#17243b]">EC Submission Status</p>
                  <p className="mt-0.5 text-xs text-slate-500">Track study approval pipeline (view only)</p>
                </button>

                {/* View participant records — read-only */}
                <button
                  type="button"
                  onClick={() => navigate("/participants")}
                  className="rounded-[5px] border border-slate-200 bg-white p-5 text-left shadow-[0_1px_3px_rgba(15,23,42,0.03)] transition hover:border-[#1d5edb] hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eaf6ef] mb-3">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#2eaa72" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
                      <path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7-7a4 4 0 0 1 0 7.75M22 20v-2a4 4 0 0 0-3-3.87" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-[#17243b]">Participant Records</p>
                  <p className="mt-0.5 text-xs text-slate-500">Enrolled participant list (view only)</p>
                </button>

                {/* View clinical trials list — read-only */}
                <button
                  type="button"
                  onClick={() => navigate("/clinical-trials")}
                  className="rounded-[5px] border border-slate-200 bg-white p-5 text-left shadow-[0_1px_3px_rgba(15,23,42,0.03)] transition hover:border-[#1d5edb] hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3f0ff] mb-3">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
                      <path d="M8 4h8v3H8zM6 5H4v15h16V5h-2v4H6zM8 13h8v2H8z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-[#17243b]">Study Portfolio</p>
                  <p className="mt-0.5 text-xs text-slate-500">Full study list and protocol details</p>
                </button>

              </div>

              {/* Role clarity note */}
              <div className="mt-6 rounded-[5px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-700 mb-2">PI vs Coordinator responsibilities</p>
                <div className="grid sm:grid-cols-2 gap-4 text-xs text-slate-600">
                  <div>
                    <p className="font-medium text-[#2eaa72] mb-1">✓ PI oversight (this dashboard)</p>
                    <ul className="space-y-0.5 text-slate-500">
                      <li>Monitor study status and safety signals</li>
                      <li>Subjects &amp; sites portfolio overview</li>
                      <li>AE/SAE summary and regulatory status</li>
                      <li>Review major study / EC decisions</li>
                      <li>Track important compliance alerts</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-slate-400 mb-1">✗ Coordinator operations (not on PI dashboard)</p>
                    <ul className="space-y-0.5 text-slate-400">
                      <li>Adding subjects or recording visits</li>
                      <li>Reporting AEs/SAEs to EC</li>
                      <li>Submitting or resubmitting to Ethics Committee</li>
                      <li>Marking AEs as reported to regulator</li>
                      <li>Approving or rejecting EC submissions (EC role)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

          </div>
        )}
      </main>
    </div>
  );
}
