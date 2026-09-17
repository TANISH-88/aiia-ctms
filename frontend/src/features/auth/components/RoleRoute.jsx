import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useUser } from "../../user/hooks/useUser";
import InvalidAccessPage from "../../../pages/InvalidAccessPage";

export default function RoleRoute({ allowedRoles }) {
  const { isAuthenticated, initialized: authInitialized } = useAuth();
  const {
    user: profile,
    loading: profileLoading,
    initialized: profileInitialized,
    error: profileError,
    loadUser,
  } = useUser();

  useEffect(() => {
    if (
      authInitialized &&
      isAuthenticated &&
      !profile &&
      !profileLoading &&
      !profileInitialized
    ) {
      loadUser().catch(() => {});
    }
  }, [
    authInitialized,
    isAuthenticated,
    profile,
    profileLoading,
    profileInitialized,
    loadUser,
  ]);

  if (
    !authInitialized ||
    (isAuthenticated && (!profileInitialized || profileLoading))
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fc]">
        <p className="text-sm text-slate-500">Loading access...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Profile fetch failed — retry instead of a permanent 403
  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fc] px-6">
        <div className="max-w-md rounded-[5px] border border-red-200 bg-white p-6 text-center">
          <h2 className="text-lg font-semibold text-slate-900">
            Unable to verify role
          </h2>
          <p className="mt-2 text-sm text-red-600">
            {profileError || "Your profile could not be loaded."}
          </p>
          <button
            type="button"
            onClick={() => loadUser().catch(() => {})}
            className="mt-4 rounded-lg bg-[#1d5edb] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#174ec0]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!allowedRoles.includes(profile.role)) {
    return <InvalidAccessPage />;
  }

  return <Outlet />;
}
