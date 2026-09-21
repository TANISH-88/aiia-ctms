import { useEffect } from "react";
import { useUser } from "../../user/hooks/useUser";
import { DashboardPage } from "./DashboardPage";
import PIDashboardPage from "./PIDashboardPage";
import StudyCoordinatorDashboardPage from "./StudyCoordinatorDashboardPage";
import MonitorDashboardPage from "./MonitorDashboardPage";
import EthicsCommitteeDashboardPage from "./EthicsCommitteeDashboardPage";
import PharmacovigilanceDashboardPage from "./PharmacovigilanceDashboardPage";
import AdminDashboardPage from "./AdminDashboardPage";
import RegulatorDashboardPage from "./RegulatorDashboardPage";

function formatRole(role) {
  if (!role) return "User";
  return role
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/**
 * Lightweight landing for roles that share /dashboard but do not have
 * a dedicated operational dashboard yet (permissions unchanged).
 */
function RoleLandingPage({ role, name }) {
  return (
    <div className="min-h-screen bg-[#f6f8fc] px-5 py-10 text-[#16233b] sm:px-8">
      <div className="mx-auto max-w-3xl rounded-[5px] border border-slate-200 bg-white p-8 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#3d9673]">
          AIIA-CTMS
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[#17243b]">
          Welcome{name ? `, ${name}` : ""}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          You are signed in as <span className="font-medium text-slate-700">{formatRole(role)}</span>.
          Your assigned permissions are unchanged. Use the navigation for pages available to your role.
        </p>
      </div>
    </div>
  );
}

/**
 * Role-aware dashboard entry for /dashboard.
 */
export default function RoleDashboardPage() {
  const {
    user: profile,
    loading,
    initialized,
    loadUser,
  } = useUser();

  useEffect(() => {
    if (!profile && !loading && !initialized) {
      loadUser().catch(() => {});
    }
  }, [profile, loading, initialized, loadUser]);

  if (loading && !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fc]">
        <p className="text-sm text-slate-500">Loading dashboard...</p>
      </div>
    );
  }

  const role = profile?.role;

  if (role === "principal_investigator") {
    return <PIDashboardPage />;
  }

  if (role === "study_coordinator") {
    return <StudyCoordinatorDashboardPage />;
  }

  if (role === "monitor") {
    return <MonitorDashboardPage />;
  }

  if (role === "ethics_committee") {
    return <EthicsCommitteeDashboardPage />;
  }

  if (role === "pharmacovigilance") {
    return <PharmacovigilanceDashboardPage />;
  }

  if (role === "admin") {
    return <AdminDashboardPage />;
  }

  if (role === "regulator_readonly") {
    return <RegulatorDashboardPage />;
  }

  return (
    <RoleLandingPage role={role} name={profile?.full_name} />
  );
}
