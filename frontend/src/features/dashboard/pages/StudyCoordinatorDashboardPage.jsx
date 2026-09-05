import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../user/hooks/useUser";
import { getStudiesApi } from "../../studies/api/studiesAPI";
import { getAdverseEventsApi } from "../../adverseEvents/api/adverseEventsAPI";

// ── Shared helpers ─────────────────────────────────────────────────────────

const STATUS_STYLES = {
  active: "bg-[#eaf6ef] text-[#3a9b70]",
  enrolling: "bg-blue-50 text-blue-700",
  ec_approved: "bg-amber-50 text-amber-700",
  ec_approval_pending: "bg-amber-50 text-amber-700",
  protocol_draft: "bg-slate-100 text-slate-600",
  ctri_registered: "bg-indigo-50 text-indigo-700",
  closed: "bg-slate-100 text-slate-500",
  suspended: "bg-red-50 text-red-700",
};

function StatusBadge({ status }) {
  const cls = STATUS_STYLES[status] || "bg-slate-100 text-slate-600";
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${cls}`}>
      {(status || "Unknown").replace(/_/g, " ")}
    </span>
  );
}

function ActionButton({ label, onClick, primary = false, danger = false }) {
  const baseClass = "rounded-lg px-4 py-2 text-sm font-medium transition";
  const primaryClass = primary
    ? "bg-[#1d5edb] text-white hover:bg-[#174ec0]"
    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50";
  const dangerClass = danger
    ? "bg-[#d33d43] text-white hover:bg-[#c0363c]"
    : primaryClass;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseClass} ${primary ? primaryClass : dangerClass}`}
    >
      {label}
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function StudyCoordinatorDashboardPage() {
  const navigate = useNavigate();
  const { user: profile } = useUser();

  const [studies, setStudies] = useState([]);
  const [adverseEvents, setAdverseEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [studiesData, aeData] = await Promise.all([
        getStudiesApi(),
        getAdverseEventsApi(),
      ]);

      // Filter studies assigned to coordinator's site
      const assignedStudies = studiesData.filter(
        (study) => study.sites?.some((site) => site.id === profile?.site_id)
      );

      setStudies(assignedStudies);
      setAdverseEvents(aeData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [profile?.site_id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fc]">
        <p className="text-sm text-slate-500">Loading coordinator dashboard…</p>
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

  const assignedStudyIds = new Set(studies.map((s) => s.id));
  const myAdverseEvents = adverseEvents.filter((ae) => assignedStudyIds.has(ae.study_id));
  const openAes = myAdverseEvents.filter((ae) => ae.status === "open");
  const overdueSaes = openAes.filter(
    (ae) =>
      ae.is_serious &&
      ae.regulatory_deadline &&
      new Date(ae.regulatory_deadline).getTime() < Date.now()
  );

  const totalSubjects = studies.reduce((sum, study) => sum + (study.subjects?.length || 0), 0);
  const enrolledSubjects = studies.reduce(
    (sum, study) =>
      sum +
      (study.subjects?.filter((s) => ["enrolled", "randomized", "completed"].includes(s.status))
        .length || 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-[#16233b]">
      <main className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8 lg:px-10">

        {/* ── Page header ── */}
        <div className="border-b border-slate-200 pb-6 mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#3d9673]">
            AIIA-CTMS / Study Coordinator
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[#17243b]">
            Coordinator Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}. Perform study operations.
          </p>
        </div>

        {/* ── Primary Action Buttons ── */}
        <section className="mb-8">
          <div className="rounded-[5px] border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <ActionButton
                label="Log Adverse Event"
                onClick={() => navigate("/adverse-events")}
                primary
              />
              {studies.length > 0 && (
                <ActionButton
                  label="Add Subject"
                  onClick={() => navigate(`/studies/${studies[0].id}`)}
                />
              )}
              {overdueSaes.length > 0 && (
                <ActionButton
                  label="Submit AE Report"
                  onClick={() => navigate("/adverse-events?filter=overdue")}
                  danger
                />
              )}
            </div>
          </div>
        </section>

        {/* No studies assigned */}
        {studies.length === 0 && (
          <div className="rounded-[5px] border border-slate-200 bg-white p-8 text-center">
            <p className="text-sm font-medium text-slate-700">No studies assigned to your site</p>
            <p className="mt-1 text-sm text-slate-500">
              Contact your administrator to be assigned to a study site.
            </p>
          </div>
        )}

        {studies.length > 0 && (
          <div className="space-y-10">

            {/* ── Operational Overview ── */}
            <section>
              <h2 className="mb-5 text-[20px] font-semibold tracking-[-0.02em] text-[#17243b]">
                Operational Overview
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-[5px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
                  <p className="text-sm text-slate-500">Assigned Studies</p>
                  <p className="mt-4 text-[30px] font-semibold tracking-[-0.04em] text-[#17243b]">
                    {studies.length}
                  </p>
                </div>
                <div className="rounded-[5px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
                  <p className="text-sm text-slate-500">Total Subjects</p>
                  <p className="mt-4 text-[30px] font-semibold tracking-[-0.04em] text-[#17243b]">
                    {totalSubjects}
                  </p>
                  <p className="mt-1.5 text-xs text-slate-400">{enrolledSubjects} enrolled</p>
                </div>
                <div className="rounded-[5px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
                  <p className="text-sm text-slate-500">Open AEs</p>
                  <p className={`mt-4 text-[30px] font-semibold tracking-[-0.04em] ${openAes.length > 0 ? "text-[#d18a18]" : "text-[#17243b]"}`}>
                    {openAes.length}
                  </p>
                  <p className="mt-1.5 text-xs text-slate-400">Requires attention</p>
                </div>
                <div className="rounded-[5px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
                  <p className="text-sm text-slate-500">Overdue SAEs</p>
                  <p className={`mt-4 text-[30px] font-semibold tracking-[-0.04em] ${overdueSaes.length > 0 ? "text-[#d33d43]" : "text-[#17243b]"}`}>
                    {overdueSaes.length}
                  </p>
                  <p className="mt-1.5 text-xs text-slate-400">Urgent reporting required</p>
                </div>
              </div>
            </section>

            {/* ── Recent Subjects ── */}
            <section>
              <h2 className="mb-5 text-[20px] font-semibold tracking-[-0.02em] text-[#17243b]">
                Recent Subjects
              </h2>
              <div className="rounded-[5px] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
                {totalSubjects === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-sm text-slate-500">No subjects enrolled yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-slate-200 bg-[#fbfcfe]">
                        <tr>
                          <th className="px-5 py-3 text-left font-medium text-slate-700">Subject Code</th>
                          <th className="px-5 py-3 text-left font-medium text-slate-700">Study</th>
                          <th className="px-5 py-3 text-left font-medium text-slate-700">Status</th>
                          <th className="px-5 py-3 text-left font-medium text-slate-700">Enrollment Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studies.flatMap((study) =>
                          (study.subjects || [])
                            .slice(0, 5)
                            .map((subject) => (
                              <tr key={subject.id} className="border-b border-slate-100">
                                <td className="px-5 py-3 font-medium text-slate-900">
                                  {subject.subject_code}
                                </td>
                                <td className="px-5 py-3 text-slate-600">{study.title}</td>
                                <td className="px-5 py-3">
                                  <StatusBadge status={subject.status} />
                                </td>
                                <td className="px-5 py-3 text-slate-600">
                                  {subject.enrollment_date || "Not enrolled"}
                                </td>
                              </tr>
                            ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>

            {/* ── Open AEs / Operational Alerts ── */}
            <section>
              <h2 className="mb-5 text-[20px] font-semibold tracking-[-0.02em] text-[#17243b]">
                Open Adverse Events
              </h2>
              {openAes.length === 0 ? (
                <div className="rounded-[5px] border border-slate-200 bg-white p-6 flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eaf6ef] text-[#2eaa72] font-bold">
                    ✓
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#17243b]">No open adverse events</p>
                    <p className="mt-0.5 text-xs text-slate-500">All safety events are within acceptable range.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {openAes.slice(0, 5).map((ae) => (
                    <div
                      key={ae.id}
                      className="rounded-[5px] border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.03)]"
                    >
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
                          {ae.is_serious && ae.regulatory_deadline && (
                            <p className={`mt-1 text-xs ${new Date(ae.regulatory_deadline).getTime() < Date.now() ? "text-red-600 font-medium" : "text-slate-500"}`}>
                              Deadline: {new Date(ae.regulatory_deadline).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate(`/adverse-events/${ae.id}`)}
                          className="shrink-0 text-xs font-medium text-[#1d5edb] hover:underline"
                        >
                          Review →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ── Assigned Studies ── */}
            <section>
              <h2 className="mb-5 text-[20px] font-semibold tracking-[-0.02em] text-[#17243b]">
                Assigned Studies
              </h2>
              <div className="grid gap-4 lg:grid-cols-2">
                {studies.map((study) => (
                  <div key={study.id} className="rounded-[5px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="min-w-0">
                        <p className="font-semibold text-[15px] text-[#17243b] truncate">{study.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {study.phase ? `Phase ${study.phase}` : "Phase N/A"}
                        </p>
                      </div>
                      <StatusBadge status={study.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-center text-xs">
                      <div>
                        <p className="font-semibold text-[#17243b]">{study.subjects?.length || 0}</p>
                        <p className="text-slate-400 mt-0.5">Subjects</p>
                      </div>
                      <div>
                        <p className={`font-semibold ${study.subjects?.filter((s) => s.study_id === study.id && openAes.some((ae) => ae.study_id === study.id)).length > 0 ? "text-[#d18a18]" : "text-[#17243b]"}`}>
                          {openAes.filter((ae) => ae.study_id === study.id).length}
                        </p>
                        <p className="text-slate-400 mt-0.5">Open AEs</p>
                      </div>
                    </div>
                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        onClick={() => navigate(`/studies/${study.id}`)}
                        className="text-xs font-medium text-[#1d5edb] hover:underline"
                      >
                        Manage study →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}