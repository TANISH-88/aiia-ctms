import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import { getUserApi } from "../api/userAPI";

import {
  userStart,
  userSuccess,
  userFailure,
  clearUser,
  clearUserError,
} from "../state/userSlice";

export const useUser = () => {
  const dispatch = useDispatch();

  const {
    user,
    loading,
    error,
    initialized,
  } = useSelector((state) => state.user);

  const loadUser = useCallback(async () => {
    dispatch(userStart());

    try {
      const userData = await getUserApi();

      dispatch(userSuccess(userData));

      return userData;
    } catch (error) {
      const message =
        error?.message || "Unable to load user";

      dispatch(userFailure(message));

      throw error;
    }
  }, [dispatch]);

  const resetUser = useCallback(() => {
    dispatch(clearUser());
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearUserError());
  }, [dispatch]);

  return {
    user,
    loading,
    error,
    initialized,
    loadUser,
    resetUser,
    clearError,
  };
};