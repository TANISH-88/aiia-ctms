import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  session: null,
  isAuthenticated: false,
  loading: false,
  initialized: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    /*
     * LOGIN
     */
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },

    loginSuccess: (state, action) => {
      state.loading = false;

      state.user = action.payload.user;
      state.session = action.payload.session;

      state.isAuthenticated = true;
      state.initialized = true;

      state.error = null;
    },

    loginFailure: (state, action) => {
      state.loading = false;

      state.error = action.payload;

      state.isAuthenticated = false;
      state.user = null;
      state.session = null;
    },

    /*
     * RESTORE SESSION AFTER PAGE RELOAD
     */
    setSession: (state, action) => {
      state.user = action.payload.user;
      state.session = action.payload.session;

      state.isAuthenticated = true;
      state.initialized = true;

      state.loading = false;
      state.error = null;
    },

    /*
     * NO SESSION FOUND
     */
    clearSession: (state) => {
      state.user = null;
      state.session = null;

      state.isAuthenticated = false;

      state.initialized = true;
      state.loading = false;

      state.error = null;
    },

    /*
     * LOGOUT
     */
    logoutSuccess: (state) => {
      state.user = null;
      state.session = null;

      state.isAuthenticated = false;

      state.initialized = true;
      state.loading = false;

      state.error = null;
    },

    /*
     * LOADING
     */
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    /*
     * CLEAR ERROR
     */
    clearAuthError: (state) => {
      state.error = null;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  setSession,
  clearSession,
  logoutSuccess,
  setLoading,
  clearAuthError,
} = authSlice.actions;

export default authSlice.reducer;
