import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useUser } from "../../user/hooks/useUser";
import { needsProfileSetup } from "../../user/api/userAPI";

/**
 * Forces incomplete accounts onto /auth/setup before any CTMS pages.
 * Setup page itself is exempt (handled by route structure).
 */
export default function RequireProfileSetup({ children }) {
  const location = useLocation();
  const { isAuthenticated, initialized: authInitialized } = useAuth();
  const {
    user: profile,
    loading: profileLoading,
    initialized: profileInitialized,
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

  if (!authInitialized || (isAuthenticated && (!profileInitialized || profileLoading))) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fc]">
        <p className="text-sm text-slate-500">Loading account...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />;
  }

  if (needsProfileSetup(profile) && location.pathname !== "/auth/setup") {
    return <Navigate to="/auth/setup" replace />;
  }

  if (!needsProfileSetup(profile) && location.pathname === "/auth/setup") {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? children : <Outlet />;
}
