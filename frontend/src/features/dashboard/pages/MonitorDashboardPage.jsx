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

// ── Main component ─────────────────────────────────────────────────────────

export default function MonitorDashboardPage() {
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

      // Filter studies assigned to monitor's site
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
        <p className="text-sm text-slate-500">Loading monitor dashboard…</p>
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
  const seriousAes = myAdverseEvents.filter((ae) => ae.is_serious);

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-[#16233b]">
      <main className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8 lg:px-10">

        {/* ── Page header ── */}
        <div className="border-b border-slate-200 pb-6 mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#3d9673]">
            AIIA-CTMS / Monitor
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[#17243b]">
            Monitor Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}. Oversight of assigned sites.
          </p>
        </div>

        {/* No sites assigned */}
        {studies.length === 0 && (
          <div className="rounded-[5px] border border-slate-200 bg-white p-8 text-center">
            <p className="text-sm font-medium text-slate-700">No sites assigned for monitoring</p>
            <p className="mt-1 text-sm text-slate-500">
              Contact your administrator to be assigned to a study site.
            </p>
          </div>
        )}

        {studies.length > 0 && (
          <div className="space-y-10">

            {/* ── My Assigned Sites (Primary Section) ── */}
            <section>
              <h2 className="mb-5 text-[20px] font-semibold tracking-[-0.02em] text-[#17243b]">
                My Assigned Sites
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

                    {/* Site Information */}
                    <div className="mb-4">
                      <p className="text-xs font-medium text-slate-700 mb-2">Site Information</p>
                      {study.sites && study.sites.length > 0 ? (
                        <div className="space-y-2">
                          {study.sites.map((site) => (
                            <div key={site.id} className="rounded border border-slate-100 p-2">
                              <p className="text-sm font-medium text-slate-900">{site.name}</p>
                              <p className="text-xs text-slate-600">{site.location || "No location"}</p>
                              {site.activated_at && (
                                <p className="text-xs text-slate-500">
                                  Activated: {new Date(site.activated_at).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500">No site information available</p>
                      )}
                    </div>

                    {/* Site Progress/Enrollment */}
                    <div className="mb-4">
                      <p className="text-xs font-medium text-slate-700 mb-2">Site Progress</p>
                      <div className="grid grid-cols-2 gap-3 text-center text-xs">
                        <div>
                          <p className="font-semibold text-[#17243b]">{study.subjects?.length || 0}</p>
                          <p className="text-slate-400 mt-0.5">Total Subjects</p>
                        </div>
                        <div>
                          <p className="font-semibold text-[#17243b]">
                            {study.subjects?.filter((s) => ["enrolled", "randomized", "completed"].includes(s.status)).length || 0}
                          </p>
                          <p className="text-slate-400 mt-0.5">Enrolled</p>
                        </div>
                      </div>
                      {study.target_enrollment && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>Enrollment Progress</span>
                            <span className="font-semibold text-[#17243b]">
                              {Math.round(((study.subjects?.length || 0) / study.target_enrollment) * 100)}%
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#2eaa72]"
                              style={{
                                width: `${Math.min(100, Math.round(((study.subjects?.length || 0) / study.target_enrollment) * 100))}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Deviations */}
                    <div className="mb-4">
                      <p className="text-xs font-medium text-slate-700 mb-2">Protocol Deviations</p>
                      <p className="text-sm text-slate-600">
                        {/* This would come from deviations data when available */}
                        No deviation data available in current schema
                      </p>
                    </div>

                    {/* Adverse Event Oversight */}
                    <div className="border-t border-slate-100 pt-4">
                      <p className="text-xs font-medium text-slate-700 mb-2">Adverse Event Oversight</p>
                      <div className="grid grid-cols-2 gap-3 text-center text-xs">
                        <div>
                          <p className={`font-semibold ${openAes.filter((ae) => ae.study_id === study.id).length > 0 ? "text-[#d18a18]" : "text-[#17243b]"}`}>
                            {openAes.filter((ae) => ae.study_id === study.id).length}
                          </p>
                          <p className="text-slate-400 mt-0.5">Open AEs</p>
                        </div>
                        <div>
                          <p className={`font-semibold ${seriousAes.filter((ae) => ae.study_id === study.id).length > 0 ? "text-[#d33d43]" : "text-[#17243b]"}`}>
                            {seriousAes.filter((ae) => ae.study_id === study.id).length}
                          </p>
                          <p className="text-slate-400 mt-0.5">Serious AEs</p>
                        </div>
                      </div>
                    </div>

                    {/* Read-only navigation */}
                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        onClick={() => navigate(`/studies/${study.id}`)}
                        className="text-xs font-medium text-[#1d5edb] hover:underline"
                      >
                        View site details →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Oversight Summary ── */}
            <section>
              <h2 className="mb-5 text-[20px] font-semibold tracking-[-0.02em] text-[#17243b]">
                Oversight Summary
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
                    {studies.reduce((sum, study) => sum + (study.subjects?.length || 0), 0)}
                  </p>
                </div>
                <div className="rounded-[5px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
                  <p className="text-sm text-slate-500">Open AEs</p>
                  <p className={`mt-4 text-[30px] font-semibold tracking-[-0.04em] ${openAes.length > 0 ? "text-[#d18a18]" : "text-[#17243b]"}`}>
                    {openAes.length}
                  </p>
                </div>
                <div className="rounded-[5px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
                  <p className="text-sm text-slate-500">Serious AEs</p>
                  <p className={`mt-4 text-[30px] font-semibold tracking-[-0.04em] ${seriousAes.length > 0 ? "text-[#d33d43]" : "text-[#17243b]"}`}>
                    {seriousAes.length}
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}