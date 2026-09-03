import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";

export function ProtectedRoute() {
  const { isAuthenticated, initialized } = useAuth();

  const location = useLocation();

  // Wait until Supabase session restoration is complete
  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  // Only redirect after auth initialization is finished
  if (!isAuthenticated) {
    return (
      <Navigate to="/auth/login" replace state={{ from: location.pathname }} />
    );
  }

  return <Outlet />;
}
