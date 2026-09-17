import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../user/hooks/useUser";
import { getStudiesApi } from "../../studies/api/studiesAPI";
import { getAdverseEventsApi } from "../../adverseEvents/api/adverseEventsAPI";
import { StudyCoordinatorDashboardSkeleton } from "../../../components/DashboardSkeleton";

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  active:              "bg-[#eaf6ef] text-[#2d9a66]",
  enrolled:            "bg-[#eaf6ef] text-[#2d9a66]",
  enrolling:           "bg-blue-50 text-blue-700",
  ec_approved:         "bg-amber-50 text-amber-800",
  ec_approval_pending: "bg-amber-50 text-amber-800",
  protocol_draft:      "bg-[#f4f8fb] text-[#5d7187]",
  ctri_registered:     "bg-indigo-50 text-indigo-700",
  closed:              "bg-[#f4f8fb] text-[#5d7187]",
  suspended:           "bg-red-50 text-red-700",
  randomized:          "bg-indigo-50 text-indigo-700",
  completed:           "bg-[#eaf6ef] text-[#2d9a66]",
  screened:            "bg-blue-50 text-blue-700",
  screen_failed:       "bg-red-50 text-red-600",
  withdrawn:           "bg-[#f4f8fb] text-[#5d7187]",
};

function StatusBadge({ status }) {
  const cls = STATUS_STYLES[status] || "bg-[#f4f8fb] text-[#5d7187]";
  return (
    <span className={`inline-block rounded-[4px] px-2 py-0.5 text-xs font-medium capitalize ${cls}`}>
      {(status || "Unknown").replace(/_/g, " ")}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

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
      const assignedStudies = studiesData.filter(
        (study) => study.sites?.some((site) => site.id === profile?.site_id),
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

  if (loading) return <StudyCoordinatorDashboardSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen bg-[#f4f8fb] px-4 py-8 sm:px-6">
        <div className="rounded-[6px] border border-red-200 bg-white p-6">
          <h2 className="text-[15px] font-semibold text-[#16324f]">Unable to load dashboard</h2>
          <p className="mt-2 text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={load}
            className="mt-4 rounded-[5px] bg-[#1f74d8] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#145db5]"
          >
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
      new Date(ae.regulatory_deadline).getTime() < Date.now(),
  );

  const totalSubjects = studies.reduce((sum, s) => sum + (s.subjects?.length || 0), 0);
  const enrolledSubjects = studies.reduce(
    (sum, s) =>
      sum +
      (s.subjects?.filter((sub) =>
        ["enrolled", "randomized", "completed"].includes(sub.status),
      ).length || 0),
    0,
  );

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full overflow-x-hidden bg-[#f4f8fb] text-[#16324f]">
      {/* Responsive horizontal padding: tight on mobile, comfortable on desktop */}
      <main className="mx-auto w-full min-w-0 max-w-[1400px] box-border px-3 py-5 sm:px-6 sm:py-8 lg:px-8">

        {/* ── Page header ── */}
        <div className="mb-6 border-b border-[#dfe7ef] pb-5 sm:mb-8 sm:pb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#2eaa72]">
            AIIA-CTMS / Study Coordinator
          </p>
          <h1 className="mt-1.5 text-xl font-semibold tracking-[-0.02em] text-[#16324f] sm:text-[22px]">
            Coordinator Dashboard
          </h1>
          <p className="mt-1 max-w-full break-words text-sm leading-5 text-[#5d7187]">
            Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}. Perform study operations.
          </p>
        </div>

        {/* ── Quick actions ──
            Mobile: label on its own line, buttons below in a wrapping row.
            Desktop: all inline. ── */}
        <div className="mb-6 sm:mb-8">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#5d7187]">
            Quick actions
          </p>
          <div className="flex w-full min-w-0 flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate("/adverse-events")}
              className="min-h-10 rounded-[6px] bg-[#1f74d8] px-3.5 py-2 text-sm font-medium text-white shadow-[0_1px_2px_rgba(31,116,216,0.18)] outline-none transition-all duration-150 hover:-translate-y-px hover:bg-[#145db5] hover:shadow-[0_3px_8px_rgba(31,116,216,0.18)] active:translate-y-0 active:bg-[#1058af] focus-visible:ring-2 focus-visible:ring-[#1f74d8]/30 focus-visible:ring-offset-2"
            >
              Log Adverse Event
            </button>
            {studies.length > 0 && (
              <button
                type="button"
                onClick={() => navigate(`/studies/${studies[0].id}`)}
                className="min-h-10 rounded-[6px] border border-[#dfe7ef] bg-white px-3.5 py-2 text-sm font-medium text-[#16324f] shadow-[0_1px_2px_rgba(19,52,80,0.04)] outline-none transition-all duration-150 hover:-translate-y-px hover:border-[#cbd8e5] hover:bg-[#f8fafc] hover:shadow-[0_3px_8px_rgba(19,52,80,0.08)] active:translate-y-0 focus-visible:ring-2 focus-visible:ring-[#1f74d8]/25 focus-visible:ring-offset-2"
              >
                Add Subject
              </button>
            )}
            {overdueSaes.length > 0 && (
              <button
                type="button"
                onClick={() => navigate("/adverse-events?filter=overdue")}
                className="flex min-h-10 items-center gap-1.5 rounded-[6px] bg-[#d33d43] px-3.5 py-2 text-sm font-medium text-white shadow-[0_1px_2px_rgba(211,61,67,0.16)] outline-none transition-all duration-150 hover:-translate-y-px hover:bg-[#bb3339] hover:shadow-[0_3px_8px_rgba(211,61,67,0.18)] active:translate-y-0 active:bg-[#a02e34] focus-visible:ring-2 focus-visible:ring-[#d33d43]/30 focus-visible:ring-offset-2"
              >
                Submit AE Report
                <span className="rounded-full bg-white/25 px-1.5 py-0.5 text-xs font-semibold leading-none">
                  {overdueSaes.length}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* ── KPI strip ──
            Mobile: 2 columns. Tablet+: 4 columns. ── */}
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-3 text-[15px] font-semibold text-[#16324f] sm:mb-4">
            Operational Overview
          </h2>
          <div className="grid min-w-0 grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
            <KpiCard label="Assigned Studies" value={studies.length} />
            <KpiCard
              label="Total Subjects"
              value={totalSubjects}
              sub={`${enrolledSubjects} enrolled`}
            />
            <KpiCard
              label="Open AEs"
              value={openAes.length}
              sub="Requires attention"
              valueColor={openAes.length > 0 ? "text-[#d48b16]" : undefined}
              dotColor={openAes.length > 0 ? "bg-[#d48b16]" : undefined}
              onClick={openAes.length > 0 ? () => navigate("/adverse-events?filter=open") : undefined}
            />
            <KpiCard
              label="Overdue SAEs"
              value={overdueSaes.length}
              sub="Urgent reporting"
              valueColor={overdueSaes.length > 0 ? "text-[#d33d43]" : undefined}
              dotColor={overdueSaes.length > 0 ? "bg-[#d93c42]" : undefined}
              onClick={
                overdueSaes.length > 0
                  ? () => navigate("/adverse-events?filter=overdue")
                  : undefined
              }
            />
          </div>
        </section>

        {/* ── No studies assigned ── */}
        {studies.length === 0 && (
          <div className="rounded-[6px] border border-[#dfe7ef] bg-white px-6 py-10 text-center">
            <p className="text-sm font-medium text-[#16324f]">No studies assigned to your site</p>
            <p className="mt-1 break-words text-[11px] leading-4 text-[#5d7187] sm:text-xs">
              Contact your administrator to be assigned to a study site.
            </p>
          </div>
        )}

        {studies.length > 0 && (
          <div className="min-w-0 space-y-8 sm:space-y-10">

            {/* ── Open adverse events ── */}
            <section>
              <div className="mb-3 flex min-w-0 items-center justify-between gap-3 sm:mb-4">
                <h2 className="text-[15px] font-semibold text-[#16324f] sm:text-[16px]">
                  Open Adverse Events
                </h2>
                {openAes.length > 0 && (
                  <button
                    type="button"
                    onClick={() => navigate("/adverse-events?filter=open")}
                    className="shrink-0 rounded-[5px] px-1.5 py-1 text-sm font-medium text-[#1f74d8] outline-none transition-colors hover:bg-[#eaf3fd] hover:text-[#145db5] focus-visible:ring-2 focus-visible:ring-[#1f74d8]/25"
                  >
                    View all →
                  </button>
                )}
              </div>

              {openAes.length === 0 ? (
                <AllClear
                  title="No open adverse events"
                  description="All safety events are within acceptable range."
                />
              ) : (
                <div className="min-w-0 overflow-hidden rounded-[8px] border border-[#dfe7ef] bg-white shadow-[0_1px_2px_rgba(19,52,80,0.06)]">
                  {openAes.slice(0, 5).map((ae, i) => {
                    const isOverdue =
                      ae.is_serious &&
                      ae.regulatory_deadline &&
                      new Date(ae.regulatory_deadline).getTime() < Date.now();
                    const isLast = i === Math.min(openAes.length, 5) - 1;
                    return (
                      <div
                        key={ae.id}
                        className={`px-4 py-4 sm:px-5 ${!isLast ? "border-b border-[#dfe7ef]" : ""}`}
                      >
                        {/* Top row: icon + badges + review button */}
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#fff4e5] text-xs font-bold text-[#d48b16]">
                            !
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span
                                className={`inline-block rounded-[4px] px-2 py-0.5 text-xs font-medium ${
                                  ae.is_serious
                                    ? "bg-red-50 text-red-700"
                                    : "bg-amber-50 text-amber-800"
                                }`}
                              >
                                {ae.is_serious ? "Serious" : "Non-serious"}
                              </span>
                              {ae.severity && (
                                <span className="text-xs capitalize text-[#5d7187]">
                                  {ae.severity.replace(/_/g, " ")}
                                </span>
                              )}
                              {isOverdue && (
                                <span className="rounded-[4px] bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
                                  Overdue
                                </span>
                              )}
                            </div>
                            <p className="mt-1.5 line-clamp-2 break-words text-sm font-medium leading-5 text-[#16324f]">
                              {ae.description}
                            </p>
                            <p className="mt-1 break-words text-[11px] leading-4 text-[#5d7187] sm:text-xs">
                              Subject: {ae.subjects?.subject_code || "Unknown"}
                              {ae.reported_at
                                ? ` · ${new Date(ae.reported_at).toLocaleDateString()}`
                                : ""}
                              {ae.is_serious && ae.regulatory_deadline
                                ? ` · Deadline: ${new Date(ae.regulatory_deadline).toLocaleDateString()}`
                                : ""}
                            </p>
                          </div>
                          {/* Review link — hidden on smallest screens, shown inline on sm+ */}
                          <button
                            type="button"
                            onClick={() => navigate(`/adverse-events/${ae.id}`)}
                            className="hidden shrink-0 text-sm font-medium text-[#1f74d8] transition hover:text-[#145db5] sm:block"
                          >
                            Review →
                          </button>
                        </div>
                        {/* On mobile, review link sits below as a full-width touch target */}
                        <div className="mt-3 sm:hidden">
                          <button
                            type="button"
                            onClick={() => navigate(`/adverse-events/${ae.id}`)}
                            className="min-h-10 w-full rounded-[6px] border border-[#dfe7ef] bg-[#f8fafc] px-3 py-2 text-center text-sm font-medium text-[#1f74d8] outline-none transition-colors hover:border-[#cbd8e5] hover:bg-[#f1f6fb] active:bg-[#eaf1f7] focus-visible:ring-2 focus-visible:ring-[#1f74d8]/25"
                          >
                            Review →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ── Recent subjects ──
                Desktop/tablet: standard table with overflow-x scroll.
                Mobile: stacked card rows — no horizontal scrolling. ── */}
            <section>
              <h2 className="mb-3 text-[15px] font-semibold text-[#16324f] sm:mb-4 sm:text-[16px]">
                Recent Subjects
              </h2>

              {totalSubjects === 0 ? (
                <div className="rounded-[6px] border border-[#dfe7ef] bg-white px-6 py-10 text-center">
                  <p className="text-sm text-[#5d7187]">No subjects enrolled yet.</p>
                </div>
              ) : (
                <div className="min-w-0 overflow-hidden rounded-[8px] border border-[#dfe7ef] bg-white shadow-[0_1px_2px_rgba(19,52,80,0.06)]">
                  {/* Table view — tablet and up */}
                  <div className="hidden overflow-x-auto sm:block">
                    <table className="w-full min-w-[500px]">
                      <thead>
                        <tr className="border-b border-[#dfe7ef] bg-[#f8fafc]">
                          <th className="py-3.5 pl-6 pr-4 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[#5d7187]">
                            Subject Code
                          </th>
                          <th className="px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[#5d7187]">
                            Study
                          </th>
                          <th className="px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[#5d7187]">
                            Status
                          </th>
                          <th className="py-3.5 pl-4 pr-6 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[#5d7187]">
                            Enrolled
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {studies.flatMap((study) =>
                          (study.subjects || []).slice(0, 5).map((subject) => (
                            <tr
                              key={subject.id}
                              className="border-b border-[#dfe7ef] last:border-b-0 hover:bg-[#f8fafc]"
                            >
                              <td className="py-4 pl-6 pr-4 text-sm font-semibold text-[#16324f]">
                                {subject.subject_code}
                              </td>
                              <td className="px-4 py-4 text-sm text-[#5d7187]">
                                <span className="line-clamp-1 max-w-[240px]">{study.title}</span>
                              </td>
                              <td className="px-4 py-4">
                                <StatusBadge status={subject.status} />
                              </td>
                              <td className="py-4 pl-4 pr-6 text-sm text-[#5d7187]">
                                {subject.enrollment_date
                                  ? new Date(subject.enrollment_date).toLocaleDateString()
                                  : "—"}
                              </td>
                            </tr>
                          )),
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Card list — mobile only */}
                  <div className="min-w-0 divide-y divide-[#dfe7ef] sm:hidden">
                    {studies.flatMap((study) =>
                      (study.subjects || []).slice(0, 5).map((subject) => (
                        <div key={subject.id} className="px-4 py-3.5">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-[#16324f]">
                              {subject.subject_code}
                            </p>
                            <StatusBadge status={subject.status} />
                          </div>
                          <p className="mt-1 truncate text-xs text-[#5d7187]">{study.title}</p>
                          <p className="mt-0.5 text-xs text-[#5d7187]">
                            Enrolled:{" "}
                            {subject.enrollment_date
                              ? new Date(subject.enrollment_date).toLocaleDateString()
                              : "—"}
                          </p>
                        </div>
                      )),
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* ── Assigned studies ──
                Mobile: single column. lg+: two columns. ── */}
            <section className="min-w-0 pb-8 sm:pb-10">
              <div className="mb-3 flex min-w-0 items-center justify-between gap-3 sm:mb-4">
                <h2 className="text-[15px] font-semibold text-[#16324f] sm:text-[16px]">
                  Assigned Studies
                </h2>
                <button
                  type="button"
                  onClick={() => navigate("/clinical-trials")}
                  className="shrink-0 rounded-[5px] px-1.5 py-1 text-sm font-medium text-[#1f74d8] outline-none transition-colors hover:bg-[#eaf3fd] hover:text-[#145db5] focus-visible:ring-2 focus-visible:ring-[#1f74d8]/25"
                >
                  View all →
                </button>
              </div>

              <div className="grid min-w-0 gap-3 lg:grid-cols-2">
                {studies.map((study) => {
                  const studyOpenAes = openAes.filter((ae) => ae.study_id === study.id).length;
                  const target = Number(study.target_enrollment) || 0;
                  const actual = Number(study.subjects?.length) || 0;
                  const pct = target ? Math.min(100, Math.round((actual / target) * 100)) : 0;

                  return (
                    <div
                      key={study.id}
                      className="min-w-0 rounded-[8px] border border-[#dfe7ef] bg-white p-4 shadow-[0_1px_2px_rgba(19,52,80,0.06)] transition-all duration-150 hover:-translate-y-px hover:border-[#cbd8e5] hover:shadow-[0_5px_14px_rgba(19,52,80,0.08)] sm:p-5"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[14px] font-semibold text-[#16324f]">
                            {study.title}
                          </p>
                          <p className="mt-0.5 text-xs text-[#5d7187]">
                            {study.phase ? `Phase ${study.phase}` : "Phase N/A"}
                            {study.ctri_number ? ` · ${study.ctri_number}` : ""}
                          </p>
                        </div>
                        <StatusBadge status={study.status} />
                      </div>

                      {/* Enrollment progress bar */}
                      {target > 0 && (
                        <div className="mb-4">
                          <div className="mb-1 flex justify-between text-xs text-[#5d7187]">
                            <span>Enrollment</span>
                            <span className="font-semibold text-[#16324f]">
                              {actual}/{target} ({pct}%)
                            </span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-[#e9edf1]">
                            <div
                              className="h-full rounded-full bg-[#2eaa72] transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between border-t border-[#f0f4f8] pt-3 sm:pt-4">
                        <div className="flex items-center gap-4 text-xs sm:gap-5">
                          <div>
                            <p className="font-semibold text-[#16324f]">
                              {study.subjects?.length || 0}
                            </p>
                            <p className="mt-0.5 text-[#5d7187]">Subjects</p>
                          </div>
                          <div>
                            <p
                              className={`font-semibold ${studyOpenAes > 0 ? "text-[#d48b16]" : "text-[#16324f]"}`}
                            >
                              {studyOpenAes}
                            </p>
                            <p className="mt-0.5 text-[#5d7187]">Open AEs</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate(`/studies/${study.id}`)}
                          className="shrink-0 rounded-[5px] px-1.5 py-1 text-sm font-medium text-[#1f74d8] outline-none transition-colors hover:bg-[#eaf3fd] hover:text-[#145db5] focus-visible:ring-2 focus-visible:ring-[#1f74d8]/25"
                        >
                          Manage →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Local sub-components ─────────────────────────────────────────────────────

function KpiCard({ label, value, sub, valueColor, dotColor, onClick }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      aria-label={onClick ? `${label}: ${value}. View details.` : undefined}
      className={`min-w-0 rounded-[8px] border border-[#dfe7ef] bg-white p-3 shadow-[0_1px_2px_rgba(19,52,80,0.06)] sm:p-5 ${
        onClick
          ? "cursor-pointer text-left outline-none transition-all duration-150 hover:-translate-y-px hover:border-[#cbd8e5] hover:shadow-[0_5px_12px_rgba(19,52,80,0.08)] active:translate-y-0 focus-visible:ring-2 focus-visible:ring-[#1f74d8]/25 focus-visible:ring-offset-2"
          : ""
      }`}
    >
      <div className="flex min-w-0 items-center justify-between gap-2">
        <p className="min-w-0 break-words text-[11px] font-medium leading-4 text-[#5d7187] sm:text-sm">
          {label}
        </p>
        <span className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full sm:h-2 sm:w-2 ${dotColor || "bg-[#2eaa72]"}`} />
      </div>
      <p
        className={`mt-2 text-[22px] font-semibold leading-none tracking-[-0.04em] sm:mt-4 sm:text-[28px] ${
          valueColor || "text-[#16324f]"
        }`}
      >
        {value}
      </p>
      {sub && (
        <p className="mt-1.5 line-clamp-2 break-words text-[10px] leading-4 text-[#5d7187] sm:text-xs">
          {sub}
        </p>
      )}
    </Tag>
  );
}

function AllClear({ title, description }) {
  return (
    <div className="flex items-center gap-3 rounded-[6px] border border-[#dfe7ef] bg-white px-4 py-4 sm:gap-4 sm:px-5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eaf6ef] text-sm font-bold text-[#2eaa72]">
        ✓
      </span>
      <div>
        <p className="text-sm font-semibold text-[#16324f]">{title}</p>
        {description && <p className="mt-0.5 text-xs text-[#5d7187]">{description}</p>}
      </div>
    </div>
  );
}
