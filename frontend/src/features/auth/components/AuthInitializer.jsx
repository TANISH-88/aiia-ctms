import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { supabase } from "../../../api/supabase";

import { setSession, clearSession, setLoading } from "../state/authSlice";

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();

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
  }, [dispatch]);

  return children;
};

export default AuthInitializer;
