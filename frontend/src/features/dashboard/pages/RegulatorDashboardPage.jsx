import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";
import { useDashboard } from "../hooks/useDashboard";

export function RegulatorDashboardPage() {
  const navigate = useNavigate();
  const {
    data: dashboardData,
    loading: dashboardLoading,
    error: dashboardError,
    loadDashboard,
  } = useDashboard();

  const { user, profile, isAuthenticated, initialized } = useAuth();

  useEffect(() => {
    if (!initialized || !isAuthenticated) {
      return;
    }

    loadDashboard().catch((error) => {
      console.error("Dashboard load error:", error);
    });
  }, [initialized, isAuthenticated, loadDashboard]);

  const summary = useMemo(() => {
    return dashboardData.reduce(
      (acc, study) => {
        acc.studies += 1;
        acc.targetEnrollment += Number(study.target_enrollment) || 0;
        acc.actualEnrollment += Number(study.actual_enrollment) || 0;
        acc.openAe += Number(study.open_ae_count) || 0;
        acc.overdueSae += Number(study.overdue_sae_count) || 0;
        acc.deviations += Number(study.deviation_count) || 0;
        return acc;
      },
      {
        studies: 0,
        targetEnrollment: 0,
        actualEnrollment: 0,
        openAe: 0,
        overdueSae: 0,
        deviations: 0,
      },
    );
  }, [dashboardData]);

  const overallEnrollmentPct = useMemo(() => {
    if (!summary.targetEnrollment) {
      return 0;
    }

    return Math.min(
      100,
      Math.round((summary.actualEnrollment / summary.targetEnrollment) * 100),
    );
  }, [summary.actualEnrollment, summary.targetEnrollment]);

  const attentionStudies = useMemo(() => {
    return dashboardData.filter((study) => {
      return (
        Number(study.open_ae_count) > 0 ||
        Number(study.overdue_sae_count) > 0 ||
        Number(study.deviation_count) > 0
      );
    });
  }, [dashboardData]);

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fc]">
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fc]">
        <p className="text-sm text-slate-500">
          Please login to access the dashboard.
        </p>
      </div>
    );
  }

  if (dashboardLoading && dashboardData.length === 0) {
    return <RegulatorDashboardSkeleton />;
  }

  if (dashboardError && dashboardData.length === 0) {
    return (
      <div className="min-h-screen bg-[#f6f8fc] px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto w-full max-w-[1400px]">
          <div className="rounded-xl border border-red-200 bg-white p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Unable to load dashboard
            </h2>

            <p className="mt-2 break-words text-sm text-red-600">
              {dashboardError}
            </p>

            <button
              type="button"
              onClick={() => loadDashboard()}
              className="mt-4 min-h-10 rounded-[5px] bg-[#1d5edb] px-4 py-2 text-sm font-medium text-white transition duration-150 hover:bg-[#174ec0] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d5edb]/25"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-w-0 overflow-x-hidden bg-[#f6f8fc] text-[#16233b]">
      <main className="mx-auto w-full max-w-[1400px] min-w-0 px-4 py-6 sm:px-6 sm:py-9">
        {/* Regulator Read-Only Notice */}
        <section className="mb-8">
          <div className="rounded-[5px] border border-blue-200 bg-blue-50 p-4 sm:p-5">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">
                i
              </div>

              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-blue-900">
                  Read-Only Access
                </h3>

                <p className="mt-1 break-words text-xs leading-5 text-blue-700">
                  You have read-only access to system data. No modifications or
                  administrative actions are permitted.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Overview */}
        <section>
          <div className="mb-7">
            <h2 className="text-[21px] font-semibold tracking-[-0.02em] text-[#17243b] sm:text-[22px]">
              System Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current status across all clinical trials (read-only)
            </p>
          </div>

          {/* KPI Cards - No click actions */}
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-5">
            {/* Active Studies */}
            <div className="min-w-0 rounded-[5px] border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.03)] sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-500">Active studies</p>

                <span className="h-3 w-3 shrink-0 rounded-full bg-[#2eaa72]" />
              </div>

              <p className="mt-5 text-[29px] font-semibold tracking-[-0.04em] text-[#17243b] sm:text-[32px]">
                {summary.studies}
              </p>

              <p className="mt-2 text-xs text-slate-400">Total studies</p>
            </div>

            {/* Enrollment */}
            <div className="min-w-0 rounded-[5px] border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.03)] sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-500">Enrollment</p>

                <span className="h-3 w-3 shrink-0 rounded-full bg-[#2eaa72]" />
              </div>

              <p className="mt-5 break-words text-[29px] font-semibold tracking-[-0.04em] text-[#17243b] sm:text-[32px]">
                {summary.actualEnrollment}
                <span className="text-[22px] sm:text-[25px]">
                  /{summary.targetEnrollment}
                </span>
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Participants enrolled
              </p>
            </div>

            {/* Open AEs */}
            <div className="min-w-0 rounded-[5px] border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.03)] sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-500">Open AEs</p>

                <span className="h-3 w-3 shrink-0 rounded-full bg-[#d48b16]" />
              </div>

              <p className="mt-5 text-[29px] font-semibold tracking-[-0.04em] text-[#d18a18] sm:text-[32px]">
                {summary.openAe}
              </p>

              <p className="mt-2 text-xs text-slate-400">Adverse events</p>
            </div>

            {/* Overdue SAEs */}
            <div className="min-w-0 rounded-[5px] border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.03)] sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-500">Overdue SAEs</p>

                <span className="h-3 w-3 shrink-0 rounded-full bg-[#d93c42]" />
              </div>

              <p className="mt-5 text-[29px] font-semibold tracking-[-0.04em] text-[#d33d43] sm:text-[32px]">
                {summary.overdueSae}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Requires attention
              </p>
            </div>

            {/* Deviations */}
            <div className="min-w-0 rounded-[5px] border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.03)] sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-500">Deviations</p>

                <span className="h-3 w-3 shrink-0 rounded-full bg-[#2eaa72]" />
              </div>

              <p className="mt-5 text-[29px] font-semibold tracking-[-0.04em] text-[#17243b] sm:text-[32px]">
                {summary.deviations}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Protocol deviations
              </p>
            </div>
          </div>
        </section>

        {/* Study Performance */}
        <section className="mt-10">
          <div className="mb-5">
            <h2 className="text-[21px] font-semibold tracking-[-0.02em] text-[#17243b] sm:text-[22px]">
              Study Performance
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Enrollment and safety indicators by study (read-only)
            </p>
          </div>

          <div className="overflow-hidden rounded-[5px] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
            <div
              className="overflow-x-auto"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              <table className="w-full min-w-[860px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#fbfcfe]">
                    <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                      Study
                    </th>

                    <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                      Enrollment
                    </th>

                    <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                      Deviations
                    </th>

                    <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                      Open AEs
                    </th>

                    <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                      Overdue SAEs
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {dashboardData.map((study) => {
                    const target = Number(study.target_enrollment) || 0;
                    const actual = Number(study.actual_enrollment) || 0;

                    const enrollmentPct =
                      Number(study.enrollment_pct) ||
                      (target ? (actual / target) * 100 : 0);

                    const progress = Math.min(
                      100,
                      Math.max(0, Math.round(enrollmentPct)),
                    );

                    const status = study.status || "unknown";

                    return (
                      <tr
                        key={study.study_id}
                        className="border-b border-slate-100 transition-colors last:border-b-0 hover:bg-[#fbfcfe]"
                      >
                        {/* Study */}
                        <td className="px-6 py-6">
                          <p className="max-w-[340px] break-words text-[16px] font-semibold leading-5 text-[#17243b]">
                            {study.title || "Untitled study"}
                          </p>

                          <p className="mt-2 text-[11px] text-slate-400">
                            {study.study_id}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-6">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                              status === "active"
                                ? "bg-[#eaf6ef] text-[#3a9b70]"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {status.charAt(0).toUpperCase() +
                              status.slice(1)}
                          </span>
                        </td>

                        {/* Enrollment */}
                        <td className="px-5 py-6">
                          <div className="w-[245px]">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-slate-500">
                                {actual} / {target}
                              </span>

                              <span className="text-sm font-semibold text-[#17243b]">
                                {progress}%
                              </span>
                            </div>

                            <div className="mt-2 h-[7px] overflow-hidden rounded-full bg-[#e9edf1]">
                              <div
                                className="h-full rounded-full bg-[#2eaa72]"
                                style={{
                                  width: `${progress}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Deviations */}
                        <td className="px-5 py-6 text-sm font-medium text-[#17243b]">
                          {Number(study.deviation_count) || 0}
                        </td>

                        {/* Open AEs */}
                        <td className="px-5 py-6 text-sm font-semibold text-[#d18a18]">
                          {Number(study.open_ae_count) || 0}
                        </td>

                        {/* Overdue SAEs */}
                        <td className="px-6 py-6 text-sm font-semibold text-[#d33d43]">
                          {Number(study.overdue_sae_count) || 0}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {dashboardData.length === 0 && (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-slate-500">
                  No study data available.
                </p>
              </div>
            )}
          </div>

          <p className="mt-2 text-[11px] text-slate-400 sm:hidden">
            Swipe horizontally to view all study metrics.
          </p>
        </section>

        {/* Attention Required */}
        <section className="mt-10 pb-10">
          <div className="mb-5">
            <h2 className="text-[21px] font-semibold tracking-[-0.02em] text-[#17243b] sm:text-[22px]">
              Attention Required
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Safety and compliance indicators requiring review (read-only)
            </p>
          </div>

          {attentionStudies.length === 0 ? (
            <div className="rounded-[5px] border border-slate-200 bg-white p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:items-center sm:gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eaf6ef] text-[#2eaa72]">
                  ✓
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#17243b]">
                    No issues requiring attention
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    All current safety and compliance indicators are within
                    range.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {attentionStudies.map((study) => {
                const openAe = Number(study.open_ae_count) || 0;
                const overdueSae = Number(study.overdue_sae_count) || 0;
                const deviations = Number(study.deviation_count) || 0;

                return (
                  <div
                    key={study.study_id}
                    className="w-full max-w-[690px] rounded-[5px] border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.03)] sm:p-6"
                  >
                    <div className="flex items-start gap-4">
                      {/* Alert Icon */}
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fff0ef] text-sm font-semibold text-[#d33d43]">
                        !
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 flex-col items-start justify-between gap-3 sm:flex-row sm:gap-5">
                          <div className="min-w-0">
                            <h3 className="break-words text-[16px] font-semibold leading-5 text-[#17243b]">
                              Serious adverse event requires attention
                            </h3>

                            <p className="mt-1 break-words text-sm text-slate-400">
                              {study.title || "Untitled study"}
                            </p>
                          </div>

                          {/* No action button for regulator */}
                          <span className="shrink-0 text-xs text-slate-400">
                            Read-only
                          </span>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-4">
                          <div>
                            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                              Open AE
                            </p>

                            <p className="mt-2 text-sm font-semibold text-[#17243b]">
                              {openAe}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                              Overdue SAE
                            </p>

                            <p className="mt-2 text-sm font-semibold text-[#d33d43]">
                              {overdueSae}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                              Deviations
                            </p>

                            <p className="mt-2 text-sm font-semibold text-[#17243b]">
                              {deviations}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Dashboard Loading Skeleton                                                 */
/* -------------------------------------------------------------------------- */

function RegulatorDashboardSkeleton() {
  return (
    <div
      className="min-h-screen min-w-0 overflow-x-hidden bg-[#f6f8fc]"
      aria-busy="true"
      aria-label="Loading dashboard"
    >
      <style>{`
        @keyframes regulatorSkeletonShimmer {
          0% {
            background-position: 200% 0;
          }

          100% {
            background-position: -200% 0;
          }
        }

        .regulator-skeleton {
          background: linear-gradient(
            90deg,
            #edf1f5 0%,
            #f8fafc 50%,
            #edf1f5 100%
          );
          background-size: 200% 100%;
          animation: regulatorSkeletonShimmer 1.5s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .regulator-skeleton {
            animation: none;
          }
        }
      `}</style>

      <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 sm:py-9">
        {/* Notice Skeleton */}
        <section className="mb-8">
          <div className="rounded-[5px] border border-slate-200 bg-white p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <span className="regulator-skeleton h-8 w-8 shrink-0 rounded-full" />

              <div className="min-w-0 flex-1">
                <span className="regulator-skeleton h-4 w-28 rounded-[4px]" />

                <span className="regulator-skeleton mt-2 h-3.5 w-full max-w-[620px] rounded-[4px]" />

                <span className="regulator-skeleton mt-1.5 h-3.5 w-[78%] max-w-[520px] rounded-[4px]" />
              </div>
            </div>
          </div>
        </section>

        {/* Overview Skeleton */}
        <section>
          <div className="mb-7">
            <span className="regulator-skeleton block h-6 w-44 rounded-[4px] sm:h-7 sm:w-48" />

            <span className="regulator-skeleton mt-2 block h-4 w-full max-w-[390px] rounded-[4px]" />
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-5">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="min-w-0 rounded-[5px] border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.03)] sm:p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="regulator-skeleton h-3.5 w-24 rounded-[4px]" />

                  <span className="regulator-skeleton h-3 w-3 shrink-0 rounded-full" />
                </div>

                <span className="regulator-skeleton mt-5 block h-8 w-16 rounded-[4px]" />

                <span className="regulator-skeleton mt-2 block h-3 w-24 rounded-[4px]" />
              </div>
            ))}
          </div>
        </section>

        {/* Study Performance Skeleton */}
        <section className="mt-10">
          <div className="mb-5">
            <span className="regulator-skeleton block h-6 w-48 rounded-[4px] sm:h-7 sm:w-52" />

            <span className="regulator-skeleton mt-2 block h-4 w-full max-w-[430px] rounded-[4px]" />
          </div>

          <div className="overflow-hidden rounded-[5px] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
            <div className="overflow-x-hidden">
              <div className="flex min-w-[860px] items-center gap-5 border-b border-slate-200 bg-[#fbfcfe] px-6 py-4">
                <span className="regulator-skeleton h-3 w-24 rounded-[4px]" />
                <span className="regulator-skeleton h-3 w-16 rounded-[4px]" />
                <span className="regulator-skeleton h-3 w-20 rounded-[4px]" />
                <span className="regulator-skeleton h-3 w-20 rounded-[4px]" />
                <span className="regulator-skeleton h-3 w-16 rounded-[4px]" />
                <span className="regulator-skeleton h-3 w-20 rounded-[4px]" />
              </div>

              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="flex min-w-[860px] items-center gap-5 border-b border-slate-100 px-6 py-6 last:border-b-0"
                >
                  <div className="w-[250px] shrink-0">
                    <span className="regulator-skeleton block h-4 w-44 rounded-[4px]" />

                    <span className="regulator-skeleton mt-2 block h-3 w-20 rounded-[4px]" />
                  </div>

                  <span className="regulator-skeleton h-6 w-20 shrink-0 rounded-full" />

                  <div className="w-[245px] shrink-0">
                    <div className="flex items-center justify-between">
                      <span className="regulator-skeleton h-3.5 w-16 rounded-[4px]" />

                      <span className="regulator-skeleton h-3.5 w-10 rounded-[4px]" />
                    </div>

                    <span className="regulator-skeleton mt-2 block h-[7px] w-full rounded-full" />
                  </div>

                  <span className="regulator-skeleton h-4 w-8 shrink-0 rounded-[4px]" />

                  <span className="regulator-skeleton h-4 w-8 shrink-0 rounded-[4px]" />

                  <span className="regulator-skeleton h-4 w-8 shrink-0 rounded-[4px]" />
                </div>
              ))}
            </div>
          </div>

          <p className="mt-2 text-[11px] text-slate-400 sm:hidden">
            Loading study performance…
          </p>
        </section>

        {/* Attention Skeleton */}
        <section className="mt-10 pb-10">
          <div className="mb-5">
            <span className="regulator-skeleton block h-6 w-44 rounded-[4px] sm:h-7 sm:w-48" />

            <span className="regulator-skeleton mt-2 block h-4 w-full max-w-[470px] rounded-[4px]" />
          </div>

          <div className="grid gap-4">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="w-full max-w-[690px] rounded-[5px] border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.03)] sm:p-6"
              >
                <div className="flex items-start gap-4">
                  <span className="regulator-skeleton h-11 w-11 shrink-0 rounded-full" />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <span className="regulator-skeleton block h-4 w-full max-w-[300px] rounded-[4px]" />

                        <span className="regulator-skeleton mt-2 block h-3.5 w-40 rounded-[4px]" />
                      </div>

                      <span className="regulator-skeleton h-3 w-16 shrink-0 rounded-[4px]" />
                    </div>

                    <div className="mt-5 flex flex-wrap gap-x-8 gap-y-4">
                      <div>
                        <span className="regulator-skeleton block h-2.5 w-14 rounded-[4px]" />

                        <span className="regulator-skeleton mt-2 block h-4 w-6 rounded-[4px]" />
                      </div>

                      <div>
                        <span className="regulator-skeleton block h-2.5 w-20 rounded-[4px]" />

                        <span className="regulator-skeleton mt-2 block h-4 w-6 rounded-[4px]" />
                      </div>

                      <div>
                        <span className="regulator-skeleton block h-2.5 w-16 rounded-[4px]" />

                        <span className="regulator-skeleton mt-2 block h-4 w-6 rounded-[4px]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default RegulatorDashboardPage;