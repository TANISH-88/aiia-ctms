import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/state/authSlice";
import dashboardReducer from "../features/dashboard/state/dashboardSlice";
import userReducer from "../features/user/state/userSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    dashboard:dashboardReducer,
  },
});
