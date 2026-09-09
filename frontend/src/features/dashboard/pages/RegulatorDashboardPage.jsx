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
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fc]">
        <p className="text-sm text-slate-500">Loading dashboard...</p>
      </div>
    );
  }

  if (dashboardError && dashboardData.length === 0) {
    return (
      <div className="min-h-screen bg-[#f6f8fc] px-6 py-8">
        <div className="mx-auto max-w-[1400px]">
          <div className="rounded-xl border border-red-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Unable to load dashboard
            </h2>

            <p className="mt-2 text-sm text-red-600">{dashboardError}</p>

            <button
              type="button"
              onClick={() => loadDashboard()}
              className="mt-4 rounded-lg bg-[#1d5edb] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#174ec0]"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-[#16233b]">
      {/* Dashboard Header */}
      <main className="mx-auto max-w-[1400px] px-6 py-9">
        {/* Regulator Read-Only Notice */}
        <section className="mb-8">
          <div className="rounded-[5px] border border-blue-200 bg-blue-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
                i
              </div>
              <div>
                <h3 className="text-sm font-semibold text-blue-900">Read-Only Access</h3>
                <p className="mt-1 text-xs text-blue-700">
                  You have read-only access to system data. No modifications or administrative actions are permitted.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Overview */}
        <section>
          <div className="mb-7">
            <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-[#17243b]">
              System Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current status across all clinical trials (read-only)
            </p>
          </div>

          {/* KPI Cards - No click actions */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {/* Active Studies */}
            <div className="rounded-[5px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Active studies</p>

                <span className="h-3 w-3 rounded-full bg-[#2eaa72]" />
              </div>

              <p className="mt-5 text-[32px] font-semibold tracking-[-0.04em] text-[#17243b]">
                {summary.studies}
              </p>

              <p className="mt-2 text-xs text-slate-400">Total studies</p>
            </div>

            {/* Enrollment */}
            <div className="rounded-[5px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Enrollment</p>

                <span className="h-3 w-3 rounded-full bg-[#2eaa72]" />
              </div>

              <p className="mt-5 text-[32px] font-semibold tracking-[-0.04em] text-[#17243b]">
                {summary.actualEnrollment}
                <span className="text-[25px]">/{summary.targetEnrollment}</span>
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Participants enrolled
              </p>
            </div>

            {/* Open AEs - No click action */}
            <div className="rounded-[5px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Open AEs</p>

                <span className="h-3 w-3 rounded-full bg-[#d48b16]" />
              </div>

              <p className="mt-5 text-[32px] font-semibold tracking-[-0.04em] text-[#d18a18]">
                {summary.openAe}
              </p>

              <p className="mt-2 text-xs text-slate-400">Adverse events</p>
            </div>

            {/* Overdue SAEs - No click action */}
            <div className="rounded-[5px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Overdue SAEs</p>

                <span className="h-3 w-3 rounded-full bg-[#d93c42]" />
              </div>

              <p className="mt-5 text-[32px] font-semibold tracking-[-0.04em] text-[#d33d43]">
                {summary.overdueSae}
              </p>

              <p className="mt-2 text-xs text-slate-400">Requires attention</p>
            </div>

            {/* Deviations */}
            <div className="rounded-[5px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Deviations</p>

                <span className="h-3 w-3 rounded-full bg-[#2eaa72]" />
              </div>

              <p className="mt-5 text-[32px] font-semibold tracking-[-0.04em] text-[#17243b]">
                {summary.deviations}
              </p>

              <p className="mt-2 text-xs text-slate-400">Protocol deviations</p>
            </div>
          </div>
        </section>

        {/* Study Performance */}
        <section className="mt-10">
          <div className="mb-5">
            <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-[#17243b]">
              Study Performance
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Enrollment and safety indicators by study (read-only)
            </p>
          </div>

          <div className="overflow-hidden rounded-[5px] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
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
                        className="border-b border-slate-100 last:border-b-0"
                      >
                        {/* Study */}
                        <td className="px-6 py-6">
                          <p className="max-w-[340px] text-[16px] font-semibold leading-5 text-[#17243b]">
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
                            {status.charAt(0).toUpperCase() + status.slice(1)}
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
        </section>

        {/* Attention Required - Read-only only */}
        <section className="mt-10 pb-10">
          <div className="mb-5">
            <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-[#17243b]">
              Attention Required
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Safety and compliance indicators requiring review (read-only)
            </p>
          </div>

          {attentionStudies.length === 0 ? (
            <div className="rounded-[5px] border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eaf6ef] text-[#2eaa72]">
                  ✓
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#17243b]">
                    No issues requiring attention
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
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
                    className="max-w-[690px] rounded-[5px] border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)]"
                  >
                    <div className="flex items-start gap-4">
                      {/* Alert Icon */}
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fff0ef] text-sm font-semibold text-[#d33d43]">
                        !
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-5">
                          <div>
                            <h3 className="text-[16px] font-semibold text-[#17243b]">
                              Serious adverse event requires attention
                            </h3>

                            <p className="mt-1 text-sm text-slate-400">
                              {study.title || "Untitled study"}
                            </p>
                          </div>

                          {/* No action button for regulator */}
                          <span className="shrink-0 text-xs text-slate-400">Read-only</span>
                        </div>

                        <div className="mt-5 flex items-center gap-8">
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

export default RegulatorDashboardPage;