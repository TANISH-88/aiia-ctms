import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  loading: false,
  error: null,
  initialized: false,
};

const userSlice = createSlice({
  name: "user",

  initialState,

  reducers: {
    userStart: (state) => {
      state.loading = true;
      state.error = null;
    },

    userSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.error = null;
      state.initialized = true;
    },

    userFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.initialized = true;
    },

    clearUser: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
      state.initialized = true;
    },

    clearUserError: (state) => {
      state.error = null;
    },
  },
});

export const {
  userStart,
  userSuccess,
  userFailure,
  clearUser,
  clearUserError,
} = userSlice.actions;

export default userSlice.reducer;