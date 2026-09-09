import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "./AppLayout";
import HomePage from "../pages/HomePage";
import { LoginPage } from "../features/auth/pages/LoginPage";
import FirstLoginSetupPage from "../features/auth/pages/FirstLoginSetupPage";
import { ProtectedRoute } from "../features/auth/components/ProtectedRoute";
import RoleRoute from "../features/auth/components/RoleRoute";
import RequireProfileSetup from "../features/auth/components/RequireProfileSetup";
import { PublicRoute } from "../features/auth/components/PublicRoute";
import ForgetPasswordPage from "../features/auth/pages/ForgetPasswordPage";
import InvalidAccessPage from "../pages/InvalidAccessPage";
import RoleDashboardPage from "../features/dashboard/pages/RoleDashboardPage";
import ProfilePage from "../features/user/pages/ProfilePage";
import CTMSLayout from "./CTMSLayout";
import Trial from "../features/clinicalTrial/pages/Trial";
import ParticipantsPage from "../features/participants/pages/ParticipantsPage";
import Study from "../features/study/pages/Study";
import StudyDetailPage from "../features/studies/pages/StudyDetailPage";
import ReportAEPage from "../features/studies/pages/ReportAEPage";
import AlertsPage from "../features/alerts/pages/AlertsPage";
import AuditLogPage from "../features/auditLog/pages/AuditLogPage";
import StudySubmissionsPage from "../features/ethicsCommittee/pages/StudySubmissionsPage";
import ReviewStudyPage from "../features/ethicsCommittee/pages/ReviewStudyPage";
import AdverseEventsPage from "../features/adverseEvents/pages/AdverseEventsPage";
import AdverseEventDetailPage from "../features/adverseEvents/pages/AdverseEventDetailPage";
import InteroperabilityPage from "../features/interoperability/pages/InteroperabilityPage";
import ApplicationModal from "../components/ApplicationModal";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
            {
              path: "/apply",
              element: <ApplicationModal inline />,
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
            // First-login setup — authenticated but profile incomplete
            element: <RequireProfileSetup />,
            children: [
              {
                path: "/auth/setup",
                element: <FirstLoginSetupPage />,
              },
              {
                element: <CTMSLayout />,
                children: [
                  {
                    // Landing for all roles after setup; page UI still role-gated inside
                    element: (
                      <RoleRoute
                        allowedRoles={[
                          "admin",
                          "study_coordinator",
                          "ethics_committee",
                          "principal_investigator",
                          "monitor",
                          "pharmacovigilance",
                          "regulator_readonly",
                        ]}
                      />
                    ),
                    children: [
                      { path: "/dashboard", element: <RoleDashboardPage /> },
                    ],
                  },
                  {
                    element: (
                      <RoleRoute
                        allowedRoles={[
                          "admin",
                          "study_coordinator",
                          "principal_investigator",
                        ]}
                      />
                    ),
                    children: [
                      { path: "/clinical-trials", element: <Trial /> },
                      { path: "/participants", element: <ParticipantsPage /> },
                    ],
                  },
                  {
                    element: (
                      <RoleRoute
                        allowedRoles={[
                          "admin",
                          "study_coordinator",
                          "principal_investigator",
                          "monitor",
                        ]}
                      />
                    ),
                    children: [
                      { path: "/studies/:id", element: <StudyDetailPage /> },
                    ],
                  },
                  {
                    element: (
                      <RoleRoute allowedRoles={["admin", "study_coordinator"]} />
                    ),
                    children: [
                      { path: "/study", element: <Study /> },
                      {
                        path: "/studies/:id/report-ae",
                        element: <ReportAEPage />,
                      },
                    ],
                  },
                  {
                    element: (
                      <RoleRoute
                        allowedRoles={[
                          "admin",
                          "study_coordinator",
                          "ethics_committee",
                          "principal_investigator",
                        ]}
                      />
                    ),
                    children: [
                      {
                        path: "/ethics/submissions",
                        element: <StudySubmissionsPage />,
                      },
                      {
                        path: "/adverse-events",
                        element: <AdverseEventsPage />,
                      },
                      {
                        path: "/adverse-events/:id",
                        element: <AdverseEventDetailPage />,
                      },
                    ],
                  },
                  {
                    element: (
                      <RoleRoute allowedRoles={["admin", "ethics_committee"]} />
                    ),
                    children: [
                      {
                        path: "/ethics/submissions/:id",
                        element: <ReviewStudyPage />,
                      },
                    ],
                  },
                  {
                    element: <RoleRoute allowedRoles={["admin"]} />,
                    children: [
                      { path: "/alerts", element: <AlertsPage /> },
                      { path: "/audit-trail", element: <AuditLogPage /> },
                      { path: "/interoperability", element: <InteroperabilityPage /> },
                    ],
                  },
                ],
              },
              {
                path: "/user/profile",
                element: <ProfilePage />,
              },
            ],
          },
        ],
      },
    ],
  },

  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
