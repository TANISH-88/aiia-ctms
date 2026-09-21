import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../user/hooks/useUser";
import { getAdverseEventsApi } from "../../adverseEvents/api/adverseEventsAPI";

// ── Shared helpers ─────────────────────────────────────────────────────────

const SEVERITY_STYLES = {
  mild: "bg-green-100 text-green-800",
  moderate: "bg-amber-100 text-amber-800",
  severe: "bg-orange-100 text-orange-800",
  life_threatening: "bg-red-100 text-red-800",
  fatal: "bg-red-900 text-red-100",
};

function SeverityBadge({ severity }) {
  const cls = SEVERITY_STYLES[severity] || "bg-slate-100 text-slate-600";
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${cls}`}>
      {(severity || "Unknown").replace(/_/g, " ")}
    </span>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function PharmacovigilanceDashboardPage() {
  const navigate = useNavigate();
  const { user: profile } = useUser();

  const [adverseEvents, setAdverseEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const aeData = await getAdverseEventsApi();
      setAdverseEvents(aeData);
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
      <div className="min-h-screen bg-[#f4f8fb] px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-350">
          <div className="border-b border-[#dfe7ef] pb-6"><div className="h-3 w-48 animate-pulse rounded bg-[#dfe7ef]" /><div className="mt-3 h-8 w-80 animate-pulse rounded bg-[#dfe7ef]" /><div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-[#dfe7ef]" /></div>
          <div className="mt-8 grid gap-px overflow-hidden border border-[#dfe7ef] sm:grid-cols-2 lg:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-28 animate-pulse bg-white p-5"><div className="h-3 w-24 rounded bg-[#edf1f5]" /><div className="mt-4 h-8 w-12 rounded bg-[#edf1f5]" /></div>)}</div>
          <div className="mt-7 h-28 animate-pulse border border-[#f1c8c2] bg-[#fff7f5]" />
          <div className="mt-6 h-72 animate-pulse border border-[#dfe7ef] bg-white" />
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

  const seriousAes = adverseEvents.filter((ae) => ae.is_serious);
  const openAes = adverseEvents.filter((ae) => ae.status === "open");
  const overdueSaes = openAes.filter(
    (ae) =>
      ae.is_serious &&
      ae.regulatory_deadline &&
      new Date(ae.regulatory_deadline).getTime() < Date.now()
  );

  const now = Date.now();
  const upcomingDeadlines = openAes
    .filter(
      (ae) =>
        ae.is_serious &&
        ae.regulatory_deadline &&
        new Date(ae.regulatory_deadline).getTime() > now &&
        new Date(ae.regulatory_deadline).getTime() < now + 7 * 24 * 60 * 60 * 1000 // Next 7 days
    )
    .sort((a, b) => new Date(a.regulatory_deadline).getTime() - new Date(b.regulatory_deadline).getTime());

  return (
    <div className="min-h-screen bg-[#f4f8fb] text-[#16324f]">
      <main className="mx-auto max-w-350 px-5 py-8 sm:px-8 lg:px-10">

        {/* ── Page header ── */}
        <div className="mb-8 flex flex-col gap-4 border-b border-[#dfe7ef] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0d9488]">
            AIIA-CTMS / Pharmacovigilance
          </p>
          <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-[#16324f]">
            Pharmacovigilance Dashboard
          </h1>
          <p className="mt-2 text-sm text-[#5d7187]">
            Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}. Cross-study safety monitoring.
          </p>
          </div>
          <p className="text-xs font-medium text-[#5d7187]">{adverseEvents.length} tracked events</p>
        </div>

        {/* ── Cross-Study Adverse Events (Primary Section) ── */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-[#16324f]">
            Cross-Study Adverse Events
          </h2>

          {/* Safety Overview */}
          <div className="mb-6 grid gap-px overflow-hidden border border-[#dfe7ef] sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white p-5">
              <p className="text-sm text-slate-500">Total AEs</p>
              <p className="mt-4 text-[30px] font-semibold tracking-[-0.04em] text-[#17243b]">
                {adverseEvents.length}
              </p>
            </div>
            <div className="bg-white p-5">
              <p className="text-sm text-slate-500">Serious AEs</p>
              <p className={`mt-4 text-[30px] font-semibold tracking-[-0.04em] ${seriousAes.length > 0 ? "text-[#d33d43]" : "text-[#17243b]"}`}>
                {seriousAes.length}
              </p>
            </div>
            <div className="bg-white p-5">
              <p className="text-sm text-slate-500">Open AEs</p>
              <p className={`mt-4 text-[30px] font-semibold tracking-[-0.04em] ${openAes.length > 0 ? "text-[#d18a18]" : "text-[#17243b]"}`}>
                {openAes.length}
              </p>
            </div>
            <div className="bg-white p-5">
              <p className="text-sm text-slate-500">Overdue SAEs</p>
              <p className={`mt-4 text-[30px] font-semibold tracking-[-0.04em] ${overdueSaes.length > 0 ? "text-[#d33d43]" : "text-[#17243b]"}`}>
                {overdueSaes.length}
              </p>
            </div>
          </div>

          {/* Urgent Attention Required */}
          {overdueSaes.length > 0 && (
            <div className="mb-6 rounded-[5px] border border-red-200 bg-red-50 p-5">
              <h3 className="mb-3 text-sm font-semibold text-red-900">
                Urgent: Overdue Serious Adverse Events
              </h3>
              <div className="space-y-3">
                {overdueSaes.slice(0, 3).map((ae) => (
                  <div key={ae.id} className="rounded border border-red-200 bg-white p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <SeverityBadge severity={ae.severity} />
                          <span className="text-xs text-red-600 font-medium">
                            Overdue: {ae.regulatory_deadline ? new Date(ae.regulatory_deadline).toLocaleDateString() : "Unknown"}
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-medium text-slate-900 line-clamp-2">
                          {ae.description}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Study: {ae.study_id} · Subject: {ae.subjects?.subject_code || "Unknown"}
                        </p>
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
            </div>
          )}

          {/* Upcoming Deadlines */}
          {upcomingDeadlines.length > 0 && (
            <div className="mb-6 rounded-[5px] border border-amber-200 bg-amber-50 p-5">
              <h3 className="mb-3 text-sm font-semibold text-amber-900">
                Upcoming Regulatory Deadlines (Next 7 Days)
              </h3>
              <div className="space-y-3">
                {upcomingDeadlines.slice(0, 3).map((ae) => (
                  <div key={ae.id} className="rounded border border-amber-200 bg-white p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <SeverityBadge severity={ae.severity} />
                          <span className="text-xs text-amber-600 font-medium">
                            Deadline: {ae.regulatory_deadline ? new Date(ae.regulatory_deadline).toLocaleDateString() : "Unknown"}
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-medium text-slate-900 line-clamp-2">
                          {ae.description}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Study: {ae.study_id} · Subject: {ae.subjects?.subject_code || "Unknown"}
                        </p>
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
            </div>
          )}

          {/* All Adverse Events Feed */}
          <div className="rounded-[5px] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
            {adverseEvents.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-slate-500">No adverse events recorded</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-200 bg-[#fbfcfe]">
                    <tr>
                      <th className="px-5 py-3 text-left font-medium text-slate-700">Description</th>
                      <th className="px-5 py-3 text-left font-medium text-slate-700">Study</th>
                      <th className="px-5 py-3 text-left font-medium text-slate-700">Subject</th>
                      <th className="px-5 py-3 text-left font-medium text-slate-700">Serious</th>
                      <th className="px-5 py-3 text-left font-medium text-slate-700">Severity</th>
                      <th className="px-5 py-3 text-left font-medium text-slate-700">Status</th>
                      <th className="px-5 py-3 text-left font-medium text-slate-700">Deadline</th>
                      <th className="px-5 py-3 text-left font-medium text-slate-700">Report Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adverseEvents.slice(0, 20).map((ae) => (
                      <tr key={ae.id} className="border-b border-slate-100">
                        <td className="px-5 py-3 max-w-xs">
                          <p className="font-medium text-slate-900 line-clamp-2">{ae.description}</p>
                        </td>
                        <td className="px-5 py-3 text-slate-600">{ae.study_id}</td>
                        <td className="px-5 py-3 text-slate-600">{ae.subjects?.subject_code || "Unknown"}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${ae.is_serious ? "bg-red-100 text-red-800" : "bg-slate-100 text-slate-600"}`}>
                            {ae.is_serious ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <SeverityBadge severity={ae.severity} />
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${ae.status === "open" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"}`}>
                            {ae.status}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          {ae.regulatory_deadline ? (
                            <span className={new Date(ae.regulatory_deadline).getTime() < Date.now() ? "text-red-600 font-medium" : "text-slate-600"}>
                              {new Date(ae.regulatory_deadline).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          {ae.ae_reports && ae.ae_reports.length > 0 ? (
                            <span className="inline-block rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                              Submitted
                            </span>
                          ) : (
                            <span className="inline-block rounded-full px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600">
                              Not Reported
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}