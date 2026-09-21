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
import ResetPasswordPage from "../features/auth/pages/ResetPasswordPage";
import AuthInitializer from "../features/auth/components/AuthInitializer";

import InvalidAccessPage from "../pages/InvalidAccessPage";
import RoleDashboardPage from "../features/dashboard/pages/RoleDashboardPage";
import ProfilePage from "../features/user/pages/ProfilePage";

import CTMSLayout from "./CTMSLayout";

import Trial from "../features/clinicalTrial/pages/Trial";
import ParticipantsPage from "../features/participants/pages/ParticipantsPage";
import InterestInboxPage from "../features/participants/pages/InterestInboxPage";

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
import CreateTrialPage from "../features/dashboard/pages/CreateTrialPage";

// NEW: Public research search page
import ResearchSearchPage from "../features/search/pages/ResearchSearchPage";
import ResearchSearchDetailPage from "../features/search/pages/ResearchSearchDetailPage";

export const router = createBrowserRouter([
  {
    element: (
      <AuthInitializer>
        <AppLayout />
      </AuthInitializer>
    ),

    children: [
      // =========================================
      // PUBLIC ROUTES — NO LOGIN REQUIRED
      // =========================================

      {
        path: "/",
        element: <HomePage />,
      },

      {
        path: "/apply",
        element: <ApplicationModal inline />,
      },

      // NEW: Research Search — publicly accessible
      {
        path: "/research/search",
        element: <ResearchSearchPage />,
      },
      {
        path:"/research/paper/:id",
        element: <ResearchSearchDetailPage/>
      },

      // =========================================
      // AUTHENTICATION PUBLIC ROUTES
      // =========================================

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
            path: "/auth/reset-password",
            element: <ResetPasswordPage />,
          },
          {
            path: "/403",
            element: <InvalidAccessPage />,
          },
        ],
      },

      // =========================================
      // PRIVATE ROUTES — LOGIN REQUIRED
      // =========================================

      {
        element: <ProtectedRoute />,

        children: [
          {
            // Authenticated users must complete profile setup
            element: <RequireProfileSetup />,

            children: [
              {
                path: "/auth/setup",
                element: <FirstLoginSetupPage />,
              },

              {
                element: <CTMSLayout />,

                children: [
                  // =========================================
                  // DASHBOARD — ALL AUTHORIZED ROLES
                  // =========================================

                  {
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
                      {
                        path: "/dashboard",
                        element: <RoleDashboardPage />,
                      },
                    ],
                  },

                  // =========================================
                  // CLINICAL TRIALS & PARTICIPANTS
                  // =========================================

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
                      {
                        path: "/clinical-trials",
                        element: <Trial />,
                      },
                      {
                        path: "/participants",
                        element: <ParticipantsPage />,
                      },
                      {
                        path: "/participants/interest",
                        element: <InterestInboxPage />,
                      },
                    ],
                  },

                  // =========================================
                  // STUDY DETAILS
                  // =========================================

                  {
                    element: (
                      <RoleRoute
                        allowedRoles={[
                          "admin",
                          "study_coordinator",
                          "principal_investigator",
                          "monitor",
                          "ethics_committee",
                        ]}
                      />
                    ),

                    children: [
                      {
                        path: "/studies/:id",
                        element: <StudyDetailPage />,
                      },
                    ],
                  },

                  // =========================================
                  // STUDY MANAGEMENT & AE REPORTING
                  // =========================================

                  {
                    element: (
                      <RoleRoute
                        allowedRoles={[
                          "admin",
                          "study_coordinator",
                        ]}
                      />
                    ),

                    children: [
                      {
                        path: "/study",
                        element: <Study />,
                      },
                      {
                        path: "/studies/:id/report-ae",
                        element: <ReportAEPage />,
                      },
                    ],
                  },

                  // =========================================
                  // ETHICS & ADVERSE EVENTS
                  // =========================================

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

                  // =========================================
                  // ETHICS REVIEW — ADMIN & EC
                  // =========================================

                  {
                    element: (
                      <RoleRoute
                        allowedRoles={[
                          "admin",
                          "ethics_committee",
                        ]}
                      />
                    ),

                    children: [
                      {
                        path: "/ethics/submissions/:id",
                        element: <ReviewStudyPage />,
                      },
                    ],
                  },

                  // =========================================
                  // ADMIN ROUTES
                  // =========================================

                  {
                    element: (
                      <RoleRoute allowedRoles={["admin"]} />
                    ),

                    children: [
                      {
                        path: "/alerts",
                        element: <AlertsPage />,
                      },
                      {
                        path: "/audit-trail",
                        element: <AuditLogPage />,
                      },
                      {
                        path: "/interoperability",
                        element: <InteroperabilityPage />,
                      },
                      {
                        path: "/admin/create-trial",
                        element: <CreateTrialPage />,
                      },
                    ],
                  },
                ],
              },

              // =========================================
              // USER PROFILE
              // =========================================

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

  // =========================================
  // FALLBACK ROUTE
  // =========================================

  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);