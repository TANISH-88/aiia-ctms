import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import { getDashboardApi } from "../api/dashboardAPI";

import {
  dashboardStart,
  dashboardSuccess,
  dashboardFailure,
  clearDashboard,
  clearDashboardError,
} from "../state/dashboardSlice";

export const useDashboard = () => {
  const dispatch = useDispatch();

  const {
    data,
    loading,
    error,
  } = useSelector((state) => state.dashboard);

  const loadDashboard = useCallback(async () => {
    dispatch(dashboardStart());

    try {
      const dashboardData = await getDashboardApi();

      dispatch(dashboardSuccess(dashboardData));

      return dashboardData;
    } catch (error) {
      const message =
        error?.message || "Unable to load dashboard";

      dispatch(dashboardFailure(message));

      throw error;
    }
  }, [dispatch]);

  const resetDashboard = useCallback(() => {
    dispatch(clearDashboard());
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearDashboardError());
  }, [dispatch]);

  return {
    data,
    loading,
    error,
    loadDashboard,
    resetDashboard,
    clearError,
  };
};