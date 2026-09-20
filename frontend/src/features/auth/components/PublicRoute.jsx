import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useUser } from "../../user/hooks/useUser";
import { needsProfileSetup } from "../../user/api/userAPI";

/**
 * Public routes (login, etc.). Authenticated users are sent to setup or dashboard.
 * Exception: /auth/reset-password is allowed for authenticated users (recovery session).
 */
export function PublicRoute() {
  const { isAuthenticated, initialized: authInitialized } = useAuth();
  const {
    user: profile,
    loading: profileLoading,
    initialized: profileInitialized,
    loadUser,
  } = useUser();
  const location = useLocation();

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

  if (!authInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fc]">
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    );
  }

  // Allow reset-password page even when authenticated (recovery session)
  if (location.pathname === "/auth/reset-password") {
    return <Outlet />;
  }

  if (isAuthenticated) {
    if (!profileInitialized || profileLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#f6f8fc]">
          <p className="text-sm text-slate-500">Loading account...</p>
        </div>
      );
    }

    if (needsProfileSetup(profile)) {
      return <Navigate to="/auth/setup" replace />;
    }

    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
