import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "./AppLayout";
import HomePage from "../pages/HomePage";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { ProtectedRoute } from "../features/auth/components/ProtectedRoute";
import { PublicRoute } from "../features/auth/components/PublicRoute";
import ForgetPasswordPage from "../features/auth/pages/ForgetPasswordPage";
import InvalidAccessPage from "../pages/InvalidAccessPage";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import ProfilePage from "../features/user/pages/ProfilePage";
import CTMSLayout from "./CTMSLayout";
import Trial from "../features/clinicalTrial/pages/Trial";
import ParticipantsPage from "../features/participants/pages/ParticipantsPage";
import Study from "../features/study/pages/Study";
export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        element: <PublicRoute />,
        children: [
          {
            path: "/auth/login",
            element: <LoginPage />,
          },
          {
            path: "/auth/forget-password",
            element: <ForgetPasswordPage />,
          },
          {
            path: "/403",
            element: <InvalidAccessPage />,
          },
        ],
      },

      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <CTMSLayout />,
            children: [
              {
                path: "/dashboard",
                element: <DashboardPage />,
              },
              {
                path: "/clinical-trials",
                element: <Trial />,
              },
              {
                path: "/participants",
                element: <ParticipantsPage />,
              },
              {
                path: "/study",
                element: <Study />,
              },
            ],
          },
          {
            path:"/user/profile",
            element:<ProfilePage />,
          }
        ],
      },
    ],
  },

  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
