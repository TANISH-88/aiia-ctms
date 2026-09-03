import { useDispatch, useSelector } from "react-redux";

import {
  loginApi,
  logoutApi,
} from "../api/authApi";

import {
  loginStart,
  loginSuccess,
  loginFailure,
  logoutSuccess,
  setLoading,
  clearAuthError,
} from "../state/authSlice";

export const useAuth = () => {
  const dispatch = useDispatch();

  const {
    user,
    session,
    isAuthenticated,
    loading,
    initialized,
    error,
  } = useSelector((state) => state.auth);

  /*
   * LOGIN
   */
  const login = async (email, password) => {
    dispatch(loginStart());

    try {
      const data = await loginApi({
        email,
        password,
      });

      dispatch(
        loginSuccess({
          user: data.user,
          session: data.session,
        }),
      );

      return data;
    } catch (error) {
      const message =
        error?.message || "Unable to login";

      dispatch(loginFailure(message));

      throw error;
    }
  };

  /*
   * LOGOUT
   */
  const logout = async () => {
    dispatch(setLoading(true));

    try {
      await logoutApi();

      dispatch(logoutSuccess());
    } catch (error) {
      const message =
        error?.message || "Unable to logout";

      console.error(message);

      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  /*
   * CLEAR AUTH ERROR
   */
  const clearError = () => {
    dispatch(clearAuthError());
  };

  return {
    user,
    session,
    isAuthenticated,
    loading,
    initialized,
    error,

    login,
    logout,
    clearError,
  };
};