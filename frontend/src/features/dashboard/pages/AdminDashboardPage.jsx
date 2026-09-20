import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";
import { useDashboard } from "../hooks/useDashboard";
import { AdminDashboardSkeleton } from "../../../components/DashboardSkeleton";
import { changeUserEmailApi } from "../../user/api/userAPI";

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const {
    data: dashboardData,
    loading: dashboardLoading,
    error: dashboardError,
    loadDashboard,
  } = useDashboard();

  const { isAuthenticated, initialized } = useAuth();

  // --- Admin email-change form state ---
  const [emailChangeUserId, setEmailChangeUserId] = useState("");
  const [emailChangeNewEmail, setEmailChangeNewEmail] = useState("");
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);
  const [emailChangeResult, setEmailChangeResult] = useState(null); // { success, message } | null
  const [emailChangeError, setEmailChangeError] = useState(null);

  const handleChangeEmail = async (event) => {
    event.preventDefault();
    setEmailChangeError(null);
    setEmailChangeResult(null);

    const trimmedUserId = emailChangeUserId.trim();
    const trimmedEmail = emailChangeNewEmail.trim();

    if (!trimmedUserId || !trimmedEmail) {
      setEmailChangeError("Both User ID and New Email are required.");
      return;
    }

    try {
      setEmailChangeLoading(true);
      const result = await changeUserEmailApi(trimmedUserId, trimmedEmail);
      setEmailChangeResult({
        message: `Email changed from ${result.old_email} → ${result.new_email}`,
      });
      setEmailChangeUserId("");
      setEmailChangeNewEmail("");
    } catch (err) {
      setEmailChangeError(err.message);
    } finally {
      setEmailChangeLoading(false);
    }
  };
  // --- end email-change form state ---

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
      <div className="flex min-h-screen items-center justify-center bg-[#f4f8fb]">
        <p className="text-sm text-[#5d7187]">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f8fb]">
        <p className="text-sm text-[#5d7187]">
          Please login to access the dashboard.
        </p>
      </div>
    );
  }

  if (dashboardLoading && dashboardData.length === 0) {
    return <AdminDashboardSkeleton />;
  }

  if (dashboardError && dashboardData.length === 0) {
    return (
      <div className="min-h-screen bg-[#f4f8fb] px-6 py-8">
        <div className="mx-auto max-w-[1400px]">
          <div className="rounded-xl border border-red-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-[#16324f]">
              Unable to load dashboard
            </h2>

            <p className="mt-2 text-sm text-red-600">{dashboardError}</p>

            <button
              type="button"
              onClick={() => loadDashboard()}
              className="mt-4 rounded-lg bg-[#1f74d8] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#145db5]"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f8fb] text-[#16324f]">
      {/* Dashboard Header */}
      <main className="mx-auto max-w-[1400px] px-6 py-9">
        {/* Admin Governance Section (Prominent) */}
        <section className="mb-10">
          <div className="mb-6">
            <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-[#16324f]">
              Administrative Governance
            </h2>

            <p className="mt-1 text-sm text-[#5d7187]">
              System oversight and administrative controls
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Audit Log */}
            <button
              type="button"
              onClick={() => navigate("/audit-trail")}
              className="group rounded-[6px] border border-[#dfe7ef] bg-white p-5 text-left shadow-[0_1px_2px_rgba(19,52,80,0.08)] transition-all duration-200 hover:border-[#1f74d8] hover:shadow-[0_4px_12px_rgba(19,52,80,0.12)]"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#5d7187]">Audit Log</p>

                <span className="h-2.5 w-2.5 rounded-full bg-[#1f74d8]" />
              </div>

              <p className="mt-4 text-[15px] font-semibold tracking-[-0.02em] text-[#16324f]">
                View System Activity
              </p>

              <p className="mt-2 text-xs text-[#5d7187]">
                Track all system changes and actions
              </p>
            </button>

            {/* Alerts */}
            <button
              type="button"
              onClick={() => navigate("/alerts")}
              className="group rounded-[6px] border border-[#dfe7ef] bg-white p-5 text-left shadow-[0_1px_2px_rgba(19,52,80,0.08)] transition-all duration-200 hover:border-[#d48b16] hover:shadow-[0_4px_12px_rgba(19,52,80,0.12)]"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#5d7187]">System Alerts</p>

                <span className="h-2.5 w-2.5 rounded-full bg-[#d48b16]" />
              </div>

              <p className="mt-4 text-[15px] font-semibold tracking-[-0.02em] text-[#16324f]">
                Manage Alerts
              </p>

              <p className="mt-2 text-xs text-[#5d7187]">
                Configure and monitor system alerts
              </p>
            </button>

            {/* Users */}
            <button
              type="button"
              onClick={() => navigate("/participants")}
              className="group rounded-[6px] border border-[#dfe7ef] bg-white p-5 text-left shadow-[0_1px_2px_rgba(19,52,80,0.08)] transition-all duration-200 hover:border-[#2eaa72] hover:shadow-[0_4px_12px_rgba(19,52,80,0.12)]"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#5d7187]">User Management</p>

                <span className="h-2.5 w-2.5 rounded-full bg-[#2eaa72]" />
              </div>

              <p className="mt-4 text-[15px] font-semibold tracking-[-0.02em] text-[#16324f]">
                Manage Users
              </p>

              <p className="mt-2 text-xs text-[#5d7187]">
                User roles and permissions
              </p>
            </button>

            {/* Create Trial */}
            <button
              type="button"
              onClick={() => navigate("/admin/create-trial")}
              className="group rounded-[6px] border border-[#dfe7ef] bg-white p-5 text-left shadow-[0_1px_2px_rgba(19,52,80,0.08)] transition-all duration-200 hover:border-[#7c5ce9] hover:shadow-[0_4px_12px_rgba(19,52,80,0.12)]"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#5d7187]">Create Trial</p>

                <span className="h-2.5 w-2.5 rounded-full bg-[#7c5ce9]" />
              </div>

              <p className="mt-4 text-[15px] font-semibold tracking-[-0.02em] text-[#16324f]">
                New Clinical Trial
              </p>

              <p className="mt-2 text-xs text-[#5d7187]">
                Create study and provision team accounts
              </p>
            </button>
          </div>

          {/* Change User Email — admin-only panel */}
          <div className="mt-5 rounded-[6px] border border-[#dfe7ef] bg-white p-5 shadow-[0_1px_2px_rgba(19,52,80,0.08)]">
            <p className="text-sm font-medium text-[#5d7187]">Change User Email</p>
            <p className="mt-1 text-[15px] font-semibold tracking-[-0.02em] text-[#16324f]">
              Admin — Change a user&apos;s login email
            </p>
            <p className="mt-1 text-xs text-[#5d7187]">
              Uses the secure server-side Edge Function. The target user will be able to log in with the new email immediately.
            </p>

            <form onSubmit={handleChangeEmail} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <div className="flex flex-col gap-1">
                <label htmlFor="emailChangeUserId" className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#5d7187]">
                  User ID (UUID)
                </label>
                <input
                  id="emailChangeUserId"
                  type="text"
                  value={emailChangeUserId}
                  onChange={(e) => setEmailChangeUserId(e.target.value)}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  className="h-9 rounded-[5px] border border-[#cfdbe7] bg-[#f8fafc] px-3 font-mono text-xs text-[#16324f] outline-none transition placeholder:text-[#8a9bad] focus:border-[#1f74d8] focus:bg-white focus:ring-2 focus:ring-[#dfeeff]"
                  disabled={emailChangeLoading}
                  autoComplete="off"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="emailChangeNewEmail" className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#5d7187]">
                  New Email Address
                </label>
                <input
                  id="emailChangeNewEmail"
                  type="email"
                  value={emailChangeNewEmail}
                  onChange={(e) => setEmailChangeNewEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="h-9 rounded-[5px] border border-[#cfdbe7] bg-[#f8fafc] px-3 text-xs text-[#16324f] outline-none transition placeholder:text-[#8a9bad] focus:border-[#1f74d8] focus:bg-white focus:ring-2 focus:ring-[#dfeeff]"
                  disabled={emailChangeLoading}
                  autoComplete="off"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={emailChangeLoading}
                  className="h-9 rounded-[5px] bg-[#1f74d8] px-4 text-xs font-semibold text-white transition hover:bg-[#145db5] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {emailChangeLoading ? "Changing\u2026" : "Change Email"}
                </button>
              </div>
            </form>

            {emailChangeResult && (
              <p className="mt-3 rounded-[5px] border border-[#c3e6cb] bg-[#eaf6ef] px-3 py-2 text-xs font-medium text-[#14734c]">
                ✓ {emailChangeResult.message}
              </p>
            )}

            {emailChangeError && (
              <p className="mt-3 rounded-[5px] border border-[#f1c8c2] bg-[#fff5f4] px-3 py-2 text-xs font-medium text-[#9f3f32]">
                ✗ {emailChangeError}
              </p>
            )}
          </div>
        </section>

        {/* Overview */}
        <section>
          <div className="mb-7">
            <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-[#16324f]">
              System Overview
            </h2>

            <p className="mt-1 text-sm text-[#5d7187]">
              Current status across all clinical trials
            </p>
          </div>

          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {/* Active Studies */}
            <div className="rounded-[6px] border border-[#dfe7ef] bg-white p-5 shadow-[0_1px_2px_rgba(19,52,80,0.08)]">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#5d7187]">Active studies</p>

                <span className="h-2.5 w-2.5 rounded-full bg-[#2eaa72]" />
              </div>

              <p className="mt-4 text-[28px] font-semibold tracking-[-0.04em] text-[#16324f]">
                {summary.studies}
              </p>

              <p className="mt-2 text-xs text-[#5d7187]">Total studies</p>
            </div>

            {/* Enrollment */}
            <div className="rounded-[6px] border border-[#dfe7ef] bg-white p-5 shadow-[0_1px_2px_rgba(19,52,80,0.08)]">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#5d7187]">Enrollment</p>

                <span className="h-2.5 w-2.5 rounded-full bg-[#2eaa72]" />
              </div>

              <p className="mt-4 text-[28px] font-semibold tracking-[-0.04em] text-[#16324f]">
                {summary.actualEnrollment}
                <span className="text-[22px] text-[#5d7187]">/{summary.targetEnrollment}</span>
              </p>

              <p className="mt-2 text-xs text-[#5d7187]">
                Participants enrolled
              </p>
            </div>

            {/* Open AEs */}
            <button type="button" onClick={() => navigate("/adverse-events?filter=open")} className="group rounded-[6px] border border-[#dfe7ef] bg-white p-5 text-left shadow-[0_1px_2px_rgba(19,52,80,0.08)] transition-all duration-200 hover:border-[#d48b16] hover:shadow-[0_4px_12px_rgba(19,52,80,0.12)]">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#5d7187]">Open AEs</p>

                <span className="h-2.5 w-2.5 rounded-full bg-[#d48b16]" />
              </div>

              <p className="mt-4 text-[28px] font-semibold tracking-[-0.04em] text-[#d18a18]">
                {summary.openAe}
              </p>

              <p className="mt-2 text-xs text-[#5d7187]">Adverse events</p>
            </button>

            {/* Overdue SAEs */}
            <button type="button" onClick={() => navigate("/adverse-events?filter=overdue")} className="group rounded-[6px] border border-[#dfe7ef] bg-white p-5 text-left shadow-[0_1px_2px_rgba(19,52,80,0.08)] transition-all duration-200 hover:border-[#d93c42] hover:shadow-[0_4px_12px_rgba(19,52,80,0.12)]">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#5d7187]">Overdue SAEs</p>

                <span className="h-2.5 w-2.5 rounded-full bg-[#d93c42]" />
              </div>

              <p className="mt-4 text-[28px] font-semibold tracking-[-0.04em] text-[#d33d43]">
                {summary.overdueSae}
              </p>

              <p className="mt-2 text-xs text-[#5d7187]">Requires attention</p>
            </button>

            {/* Deviations */}
            <div className="rounded-[6px] border border-[#dfe7ef] bg-white p-5 shadow-[0_1px_2px_rgba(19,52,80,0.08)]">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#5d7187]">Deviations</p>

                <span className="h-2.5 w-2.5 rounded-full bg-[#2eaa72]" />
              </div>

              <p className="mt-4 text-[28px] font-semibold tracking-[-0.04em] text-[#16324f]">
                {summary.deviations}
              </p>

              <p className="mt-2 text-xs text-[#5d7187]">Protocol deviations</p>
            </div>
          </div>
        </section>

        {/* Study Performance */}
        <section className="mt-10">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-[#16324f]">
                Study Performance
              </h2>

              <p className="mt-1 text-sm text-[#5d7187]">
                Enrollment and safety indicators by study
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/clinical-trials")}
              className="hidden cursor-pointer text-sm font-medium text-[#1f74d8] transition hover:text-[#145db5] sm:block"
            >
              View all studies →
            </button>
          </div>

          <div className="overflow-hidden rounded-[6px] border border-[#dfe7ef] bg-white shadow-[0_1px_2px_rgba(19,52,80,0.08)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-[#dfe7ef] bg-[#f8fafc]">
                    <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5d7187]">
                      Study
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5d7187]">
                      Status
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5d7187]">
                      Enrollment
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5d7187]">
                      Deviations
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5d7187]">
                      Open AEs
                    </th>

                    <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5d7187]">
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
                        className="border-b border-[#dfe7ef] last:border-b-0 hover:bg-[#f8fafc]"
                      >
                        {/* Study */}
                        <td className="px-6 py-5">
                          <p className="max-w-[340px] text-[15px] font-semibold leading-5 text-[#16324f]">
                            {study.title || "Untitled study"}
                          </p>

                          <p className="mt-1.5 text-[11px] text-[#5d7187]">
                            {study.study_id}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                              status === "active"
                                ? "bg-[#eaf6ef] text-[#3a9b70]"
                                : "bg-[#f8fafc] text-[#5d7187]"
                            }`}
                          >
                            {status === "protocol_draft" ? "Pending Ethics Review" : status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </td>

                        {/* Enrollment */}
                        <td className="px-5 py-5">
                          <div className="w-[245px]">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-[#5d7187]">
                                {actual} / {target}
                              </span>

                              <span className="text-sm font-semibold text-[#16324f]">
                                {progress}%
                              </span>
                            </div>

                            <div className="mt-2 h-[6px] overflow-hidden rounded-full bg-[#e9edf1]">
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
                        <td className="px-5 py-5 text-sm font-medium text-[#16324f]">
                          {Number(study.deviation_count) || 0}
                        </td>

                        {/* Open AEs */}
                        <td className="px-5 py-5 text-sm font-semibold text-[#d18a18]">
                          {Number(study.open_ae_count) || 0}
                        </td>

                        {/* Overdue SAEs */}
                        <td className="px-6 py-5 text-sm font-semibold text-[#d33d43]">
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
                <p className="text-sm text-[#5d7187]">
                  No study data available.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Attention Required */}
        <section className="mt-10 pb-10">
          <div className="mb-6">
            <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-[#16324f]">
              Attention Required
            </h2>

            <p className="mt-1 text-sm text-[#5d7187]">
              Safety and compliance indicators requiring review
            </p>
          </div>

          {attentionStudies.length === 0 ? (
            <div className="rounded-[6px] border border-[#dfe7ef] bg-white p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eaf6ef] text-[#2eaa72]">
                  ✓
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#16324f]">
                    No issues requiring attention
                  </p>

                  <p className="mt-1 text-xs text-[#5d7187]">
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
                    className="max-w-[690px] rounded-[6px] border border-[#dfe7ef] bg-white p-6 shadow-[0_1px_2px_rgba(19,52,80,0.08)]"
                  >
                    <div className="flex items-start gap-4">
                      {/* Alert Icon */}
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fff0ef] text-sm font-semibold text-[#d33d43]">
                        !
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-5">
                          <div>
                            <h3 className="text-[15px] font-semibold text-[#16324f]">
                              Serious adverse event requires attention
                            </h3>

                            <p className="mt-1 text-sm text-[#5d7187]">
                              {study.title || "Untitled study"}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => navigate(`/studies/${study.study_id}`)}
                            className="shrink-0 cursor-pointer text-sm font-medium text-[#1f74d8] transition hover:text-[#145db5]"
                          >
                            Review →
                          </button>
                        </div>

                        <div className="mt-5 flex items-center gap-8">
                          <div>
                            <p className="text-[10px] font-medium uppercase tracking-wide text-[#5d7187]">
                              Open AE
                            </p>

                            <p className="mt-2 text-sm font-semibold text-[#16324f]">
                              {openAe}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] font-medium uppercase tracking-wide text-[#5d7187]">
                              Overdue SAE
                            </p>

                            <p className="mt-2 text-sm font-semibold text-[#d33d43]">
                              {overdueSae}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] font-medium uppercase tracking-wide text-[#5d7187]">
                              Deviations
                            </p>

                            <p className="mt-2 text-sm font-semibold text-[#16324f]">
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

export default AdminDashboardPage;