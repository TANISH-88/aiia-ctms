import { useEffect, useState, createContext, useContext, useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

import { supabase } from "../../../api/supabase";

import { setSession, clearSession, setLoading } from "../state/authSlice";

// Create context for recovery flow state
const RecoveryFlowContext = createContext(null);

export const useRecoveryFlow = () => useContext(RecoveryFlowContext);

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isRecoveryFlow, setIsRecoveryFlow] = useState(false);
  const isRecoveryFlowRef = useRef(false);

  // Safe method to clear recovery flow - exposed via context
  const clearRecoveryFlow = useCallback(() => {
    setIsRecoveryFlow(false);
    isRecoveryFlowRef.current = false;
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      dispatch(setLoading(true));

      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Session restore error:", error);

          dispatch(clearSession());
          return;
        }

        if (!session) {
          dispatch(clearSession());
          return;
        }

        dispatch(
          setSession({
            user: session.user,
            session,
          }),
        );
      } catch (error) {
        console.error("Auth initialization error:", error);

        dispatch(clearSession());
      }
    };

    initializeAuth();

    // Listen for auth state changes, particularly PASSWORD_RECOVERY
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          // Set recovery flow flag and redirect only if not already on reset page
          setIsRecoveryFlow(true);
          isRecoveryFlowRef.current = true;
          if (location.pathname !== '/auth/reset-password') {
            navigate('/auth/reset-password', { replace: true });
          }
        } else if (event === 'SIGNED_IN' && session) {
          // Only clear recovery flow flag if NOT already in recovery flow
          // This prevents clearing the flag when SIGNED_IN follows PASSWORD_RECOVERY
          if (!isRecoveryFlowRef.current) {
            setIsRecoveryFlow(false);
          }
          dispatch(
            setSession({
              user: session.user,
              session,
            }),
          );
        } else if (event === 'SIGNED_OUT') {
          // Always clear recovery flow flag on sign-out
          setIsRecoveryFlow(false);
          isRecoveryFlowRef.current = false;
          dispatch(clearSession());
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch, navigate, location.pathname]);

  return (
    <RecoveryFlowContext.Provider value={{ isRecoveryFlow, clearRecoveryFlow }}>
      {children}
    </RecoveryFlowContext.Provider>
  );
};

export default AuthInitializer;
