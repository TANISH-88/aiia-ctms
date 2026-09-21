import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  data: [],
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",

  initialState,

  reducers: {
    dashboardStart: (state) => {
      state.loading = true;
      state.error = null;
    },

    dashboardSuccess: (state, action) => {
      state.loading = false;
      state.data = action.payload ?? [];
      state.error = null;
    },

    dashboardFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    clearDashboard: (state) => {
      state.data = [];
      state.loading = false;
      state.error = null;
    },

    clearDashboardError: (state) => {
      state.error = null;
    },
  },
});

export const {
  dashboardStart,
  dashboardSuccess,
  dashboardFailure,
  clearDashboard,
  clearDashboardError,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;