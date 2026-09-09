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
      <main
        className="flex min-h-screen items-center justify-center bg-[#f4f8fb] px-4 py-6 text-[#16324f] sm:px-6"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="flex flex-col items-center text-center">
          <span
            className="flex h-10 w-10 items-center justify-center text-[#1f74d8]"
            aria-hidden="true"
          >
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
          </span>
          <span className="mt-3 block text-sm font-semibold leading-5">
            Preparing your workspace
          </span>
          <span className="mt-1 block text-xs leading-4 text-[#5d7187]">
            Checking your account securely
          </span>
        </div>
      </main>
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
