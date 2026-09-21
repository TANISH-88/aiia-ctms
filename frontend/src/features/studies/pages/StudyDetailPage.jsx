import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStudyApi, deleteStudyApi } from "../api/studiesAPI.js";
import { supabase } from "../../../api/supabase";
import { useUser } from "../../user/hooks/useUser";
import { getProfileByIdApi } from "../../user/api/userAPI";
import {
  createStudySubmissionApi,
  getStudySubmissionApi,
} from "../../studySubmissions/api/studySubmissionsAPI";
import { buildFhirBundle } from "../../interoperability/utils/fhirBundle";
import { downloadSdtmDm } from "../../interoperability/utils/sdtmDm";
import { downloadSdtmAe } from "../../interoperability/utils/sdtmAe";
import { downloadDefineXml } from "../../interoperability/utils/defineXml";
import { getDemoAbhaId } from "../../interoperability/utils/abha";
import FhirBundleModal from "../../interoperability/components/FhirBundleModal";

export function StudyDetailPage() {
  const { id: studyId } = useParams();
  const navigate = useNavigate();
  const [study, setStudy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [subjectCode, setSubjectCode] = useState("");
  const [subjectStatus, setSubjectStatus] = useState("screening");
  const [enrollmentDate, setEnrollmentDate] = useState("");
  const [subjectError, setSubjectError] = useState(null);
  const [savingSubject, setSavingSubject] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [ethicsCommittee, setEthicsCommittee] = useState(null);
  const [principalInvestigator, setPrincipalInvestigator] = useState(null);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [submissionComment, setSubmissionComment] = useState("");
  const [submissionError, setSubmissionError] = useState(null);
  const [submittingStudy, setSubmittingStudy] = useState(false);
  const [showFhirModal, setShowFhirModal] = useState(false);
  const [fhirBundle, setFhirBundle] = useState(null);
  
  // Progress Report State
  const [showProgressForm, setShowProgressForm] = useState(false);
  const [progressStartDate, setProgressStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split("T")[0];
  });
  const [progressEndDate, setProgressEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [progressSummary, setProgressSummary] = useState("");
  const [progressEnrollment, setProgressEnrollment] = useState("");
  const [progressIssues, setProgressIssues] = useState("");
  const [progressError, setProgressError] = useState(null);
  const [progressSuccess, setProgressSuccess] = useState(false);
  const [submittingProgress, setSubmittingProgress] = useState(false);
  
  const [progressReports, setProgressReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [reportsError, setReportsError] = useState(null);

  const {
    user: currentUser,
    loading: userLoading,
    initialized: userInitialized,
    loadUser,
  } = useUser();

  useEffect(() => {
    const loadStudy = async () => {
      try {
        setLoading(true);
        const data = await getStudyApi(studyId);
        setStudy(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadStudy();
  }, [studyId]);

  useEffect(() => {
    if (!currentUser && !userLoading && !userInitialized) {
      loadUser().catch(() => {});
    }
  }, [currentUser, userLoading, userInitialized, loadUser]);

  useEffect(() => {
    if (!study) {
      return;
    }

    const loadSubmission = async () => {
      try {
        const data = await getStudySubmissionApi(study.id);
        setSubmission(data);

        if (study.ethics_committee_id) {
          try {
            setEthicsCommittee(
              await getProfileByIdApi(study.ethics_committee_id)
            );
          } catch {
            setEthicsCommittee(null);
          }
        }

        if (study.pi_id) {
          try {
            setPrincipalInvestigator(await getProfileByIdApi(study.pi_id));
          } catch {
            // PI profile not found — show raw UUID fallback
          }
        }
      } catch (err) {
        setSubmissionError(err.message);
      }
    };

    loadSubmission();

    const channel = supabase
      .channel(`study-submission-${study.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "study_submissions",
          filter: `study_id=eq.${study.id}`,
        },
        (payload) => {
          setSubmission(payload.new);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [study]);

  const fetchProgressReports = async () => {
    if (!study) return;
    try {
      setLoadingReports(true);
      const { data: reports, error: fetchErr } = await supabase
        .from("study_progress_reports")
        .select("*, profiles(full_name)")
        .eq("study_id", study.id)
        .order("created_at", { ascending: false });
      if (fetchErr) throw new Error(fetchErr.message);
      setProgressReports(reports || []);
    } catch (err) {
      setReportsError(err.message);
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    fetchProgressReports();
  }, [study]);

  // Maps DB study status enum values to human-readable labels.
  const formatStudyStatus = (status) => {
    const labels = {
      protocol_draft: "Awaiting Coordinator Submission",
      ec_approval_pending: "Pending Ethics Committee Review",
      ec_approved: "EC Approved",
      ctri_registered: "CTRI Registered",
      enrolling: "Enrolling",
      active: "Active",
      closed: "Closed",
      suspended: "Suspended",
    };
    return labels[status] ?? status?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ?? "Unknown";
  };

  const isAssignedCoordinator =
    currentUser?.role === "study_coordinator" &&
    study?.study_assignments?.some((assignment) => 
      assignment.profile_id === currentUser.id && assignment.role === "study_coordinator"
    );
  const isPi = currentUser?.role === "principal_investigator";
  const backPath = currentUser?.role === "monitor" ? "/dashboard" : "/clinical-trials";
  const backLabel = currentUser?.role === "monitor" ? "Back to Dashboard" : "Back to Clinical Trials";
  const hasStudyAccess =
    currentUser?.role !== "study_coordinator" || isAssignedCoordinator;
  const submissionStatus = submission?.status || "awaiting_submission";
  const canSubmit =
    isAssignedCoordinator &&
    ["awaiting_submission", "pending", "rejected", "changes_requested"].includes(submissionStatus);
  const isAssignedEc =
    currentUser?.role === "ethics_committee" &&
    study?.ec_id === currentUser.id;
  const [resuming, setResuming] = useState(false);
  const [resumeError, setResumeError] = useState(null);

  // Get status guidance message based on current study status
  const getStatusGuidance = () => {
    switch (study.status) {
      case "protocol_draft":
        return {
          message: "The study is in draft. The assigned Study Coordinator must submit it for Ethics Committee review.",
          type: "info",
        };
      case "ec_approval_pending":
        return {
          message: "The study is awaiting Ethics Committee review and approval.",
          type: "warning",
        };
      case "ec_approved":
        return {
          message: "The study has been approved by the Ethics Committee and can proceed according to the established workflow.",
          type: "success",
        };
      case "ctri_registered":
        return {
          message: "The study is CTRI registered and active.",
          type: "success",
        };
      case "enrolling":
        return {
          message: "The study is actively enrolling subjects.",
          type: "success",
        };
      case "active":
        return {
          message: "The study is active and operations are in progress.",
          type: "success",
        };
      case "suspended":
        return {
          message: "The study is suspended. An authorized Ethics Committee member may resume the study.",
          type: "error",
        };
      case "closed":
        return {
          message: "The study is closed. No further lifecycle actions are available.",
          type: "neutral",
        };
      default:
        return {
          message: `Study status: ${formatStudyStatus(study.status)}`,
          type: "info",
        };
    }
  };

  const handleResumeStudy = async () => {
    try {
      setResuming(true);
      setResumeError(null);
      const { data, error } = await supabase.rpc("resume_suspended_study", {
        p_study_id: study.id,
      });
      if (error) {
        throw new Error(error.message);
      }
      const refreshedStudy = await getStudyApi(studyId);
      setStudy(refreshedStudy);
    } catch (err) {
      setResumeError(err.message);
    } finally {
      setResuming(false);
    }
  };

  const handleSubmitToEthics = async (event) => {
    event.preventDefault();

    if (study.status === "suspended") {
      setSubmissionError("This study is suspended. Coordinator actions are disabled.");
      return;
    }

    if (!study.ethics_committee_id) {
      setSubmissionError("No Ethics Committee is assigned to this study.");
      return;
    }

    try {
      setSubmittingStudy(true);
      setSubmissionError(null);
      const savedSubmission = await createStudySubmissionApi({
        studyId: study.id,
        ecId: study.ethics_committee_id,
        comment: submissionComment,
      });
      const refreshedSubmission = await getStudySubmissionApi(study.id);
      setSubmission(refreshedSubmission || savedSubmission);
      setSubmissionComment("");
      setShowSubmissionForm(false);
    } catch (err) {
      setSubmissionError(err.message);
    } finally {
      setSubmittingStudy(false);
    }
  };

  const handleAddSubject = async (event) => {
    event.preventDefault();

    // Subjects can only be enrolled after Ethics Committee approval
    const approvedStatuses = ["ec_approved", "ctri_registered", "enrolling", "active"];
    if (!approvedStatuses.includes(study.status)) {
      setSubjectError(
        study.status === "suspended"
          ? "This study is suspended. Subject management is disabled."
          : "Subjects can only be enrolled after Ethics Committee approval. Current status: " +
            formatStudyStatus(study.status),
      );
      return;
    }

    if (!subjectCode.trim()) {
      setSubjectError("Subject code is required.");
      return;
    }

    if (!currentUser?.site_id) {
      setSubjectError("Your account does not have an assigned site.");
      return;
    }

    try {
      setSavingSubject(true);
      setSubjectError(null);

      const { error: insertError } = await supabase.from("subjects").insert({
        subject_code: subjectCode.trim(),
        status: subjectStatus,
        enrollment_date: enrollmentDate || null,
        study_id: studyId,
        site_id: currentUser.site_id,
      });

      if (insertError) {
        throw new Error(insertError.message);
      }

      const refreshedStudy = await getStudyApi(studyId);
      setStudy(refreshedStudy);
      setSubjectCode("");
      setSubjectStatus("screening");
      setEnrollmentDate("");
      setShowSubjectForm(false);
    } catch (err) {
      setSubjectError(err.message);
    } finally {
      setSavingSubject(false);
    }
  };

  const handleSubmitProgress = async (e) => {
    e.preventDefault();
    if (!progressSummary.trim()) {
      setProgressError("Summary is required.");
      return;
    }
    
    setSubmittingProgress(true);
    setProgressError(null);
    setProgressSuccess(false);

    try {
      const { error: insertError } = await supabase
        .from("study_progress_reports")
        .insert({
          study_id: study.id,
          submitted_by: currentUser.id,
          report_period_start: progressStartDate,
          report_period_end: progressEndDate,
          summary: progressSummary.trim(),
          enrollment_update: progressEnrollment.trim() || null,
          issues_noted: progressIssues.trim() || null
        });

      if (insertError) {
        if (insertError.code === "42501" || insertError.message.toLowerCase().includes("row-level security")) {
           throw new Error("You are not assigned as coordinator for this study.");
        }
        throw new Error(insertError.message);
      }

      setProgressSuccess(true);
      
      const d = new Date();
      setProgressEndDate(d.toISOString().split("T")[0]);
      d.setDate(d.getDate() - 7);
      setProgressStartDate(d.toISOString().split("T")[0]);
      
      setProgressSummary("");
      setProgressEnrollment("");
      setProgressIssues("");
      
      fetchProgressReports();
      
    } catch (err) {
      setProgressError(err.message);
    } finally {
      setSubmittingProgress(false);
    }
  };

  const [deletingStudy, setDeletingStudy] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const handleDeleteDraftStudy = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this draft study? This action cannot be undone.")) {
      return;
    }

    try {
      setDeletingStudy(true);
      setDeleteError(null);
      await deleteStudyApi(study.id);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setDeleteError(err.message);
      setDeletingStudy(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f8fb] px-5 py-8 sm:px-8 lg:px-10">
        <div className="border-b border-[#dfe7ef] pb-6">
          <div className="h-4 w-40 animate-pulse rounded bg-[#dfe7ef]" />
          <div className="mt-5 h-3 w-24 animate-pulse rounded bg-[#dfe7ef]" />
          <div className="mt-3 h-8 w-96 max-w-full animate-pulse rounded bg-[#dfe7ef]" />
          <div className="mt-3 h-4 w-64 animate-pulse rounded bg-[#dfe7ef]" />
        </div>
        <div className="mt-8 grid items-start gap-6 lg:grid-cols-2">
          <div className="border border-[#dfe7ef] bg-white p-6">
            <div className="h-6 w-36 animate-pulse rounded bg-[#edf1f5]" />
            <div className="mt-6 grid gap-5 sm:grid-cols-2">{[1, 2, 3, 4, 5, 6].map((item) => <div key={item}><div className="h-3 w-24 animate-pulse rounded bg-[#edf1f5]" /><div className="mt-2 h-4 w-32 animate-pulse rounded bg-[#edf1f5]" /></div>)}</div>
          </div>
          <div className="border border-[#dfe7ef] bg-white p-6">
            <div className="h-6 w-44 animate-pulse rounded bg-[#edf1f5]" />
            <div className="mt-6 flex gap-3"><div className="h-10 w-36 animate-pulse rounded bg-[#edf1f5]" /><div className="h-10 w-40 animate-pulse rounded bg-[#edf1f5]" /></div>
            <div className="mt-5 h-4 w-full animate-pulse rounded bg-[#edf1f5]" />
            <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-[#edf1f5]" />
          </div>
        </div>
        <div className="mt-6 h-48 animate-pulse border border-[#dfe7ef] bg-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f6f8fc] px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[5px] border border-red-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Unable to load study
            </h2>
            <p className="mt-2 text-sm text-red-600">{error}</p>
            <button
              onClick={() => navigate(backPath)}
              className="mt-5 rounded-lg bg-[#1d5edb] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#174ec0]"
            >
              {backLabel}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!study) {
    return null;
  }

  if (!hasStudyAccess) {
    return (
      <div className="min-h-screen bg-[#f6f8fc] px-6 py-10">
        <div className="rounded-[5px] border border-red-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Access Denied</h2>
          <p className="mt-2 text-sm text-red-600">
            This study is not assigned to your site.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fc] px-5 py-8 text-[#16233b] sm:px-8 lg:px-10">
      <div className="w-full">
        <div className="border-b border-slate-200 pb-6">
          <button
            onClick={() => navigate(backPath)}
            className="mb-4 text-sm text-[#1d5edb] hover:underline"
          >
            ← {backLabel}
          </button>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#3d9673]">
            AIIA-CTMS
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[#17243b]">
            {study.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-slate-500">Study ID: {study.id}</p>
            {currentUser?.role === "admin" && study.status === "protocol_draft" && (
              <button
                type="button"
                onClick={handleDeleteDraftStudy}
                disabled={deletingStudy}
                className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
              >
                {deletingStudy ? "Deleting..." : "Delete Draft Study"}
              </button>
            )}
          </div>
          {deleteError && (
            <p className="mt-3 text-sm font-medium text-red-600">{deleteError}</p>
          )}
        </div>

        {/* Status Guidance Banner */}
        <div
          className={`mt-6 rounded-[5px] border p-4 ${
            getStatusGuidance().type === "error"
              ? "border-red-200 bg-red-50"
              : getStatusGuidance().type === "warning"
              ? "border-amber-200 bg-amber-50"
              : getStatusGuidance().type === "success"
              ? "border-green-200 bg-green-50"
              : "border-slate-200 bg-slate-50"
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1">
              <p
                className={`text-sm ${
                  getStatusGuidance().type === "error"
                    ? "text-red-800"
                    : getStatusGuidance().type === "warning"
                    ? "text-amber-800"
                    : getStatusGuidance().type === "success"
                    ? "text-green-800"
                    : "text-slate-700"
                }`}
              >
                {getStatusGuidance().message}
              </p>
            </div>
            {study.status === "suspended" && isAssignedEc && (
              <button
                type="button"
                onClick={handleResumeStudy}
                disabled={resuming}
                className="rounded-lg bg-[#1d5edb] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#174ec0] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {resuming ? "Resuming..." : "Resume Study"}
              </button>
            )}
          </div>
          {resumeError && (
            <p className="mt-3 text-sm text-red-700">{resumeError}</p>
          )}
        </div>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-2">
          {/* Study Details */}
          <div className="rounded-[5px] border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Study Details
            </h2>
            <dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-medium text-slate-700">Status</dt>
                <dd className="mt-1 font-medium text-slate-900">{formatStudyStatus(study.status)}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-700">Phase</dt>
                <dd className="mt-1 text-slate-600">{study.phase || "N/A"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-medium text-slate-700">CTRI Number</dt>
                <dd className="mt-1 text-slate-600">
                  {study.ctri_number ? (
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{study.ctri_number}</span>
                      <span className="inline-flex items-center rounded-full bg-[#dffaf2] px-2 py-0.5 text-xs font-medium text-[#0d7559]">
                        Registered
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-500">Not registered (demo placeholder)</span>
                  )}
                </dd>
                {/* DEMO ONLY: CTRI sync status is static; no live CTRI API is connected. */}
                {study.ctri_number && (
                  <dd className="mt-1 text-xs text-slate-400">Last synced: 3 hours ago</dd>
                )}
              </div>
              <div className="sm:col-span-2">
                <dt className="font-medium text-slate-700">Organization</dt>
                <dd className="mt-1 text-slate-600">
                  {study.organizations?.name ?? "Not specified"}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-slate-700">Principal Investigator</dt>
                <dd className="mt-1 text-slate-600">
                  {principalInvestigator?.full_name || study.pi_id || "Not assigned"}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-slate-700">Target Enrollment</dt>
                <dd className="mt-1 text-slate-600">{study.target_enrollment}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-700">EC Approval Date</dt>
                <dd className="mt-1 text-slate-600">
                  {study.ec_approval_date || "Pending"}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-slate-700">Start Date</dt>
                <dd className="mt-1 text-slate-600">{study.start_date || "TBD"}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-700">End Date</dt>
                <dd className="mt-1 text-slate-600">{study.end_date || "TBD"}</dd>
              </div>
            </dl>
          </div>

          {/* Interoperability */}
          <div className="self-start rounded-[5px] border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Interoperability
              <span className="ml-2 text-xs font-normal text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-0.5">
                Demo Only
              </span>
            </h2>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const bundle = buildFhirBundle(study);
                    setFhirBundle(bundle);
                    setShowFhirModal(true);
                  }}
                  className="rounded-lg bg-[#1d5edb] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#174ec0]"
                >
                  View FHIR Bundle
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const bundle = buildFhirBundle(study);
                    const json = JSON.stringify(bundle, null, 2);
                    const blob = new Blob([json], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `AIIA_${study.id}_FHIR_Bundle.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Export FHIR Bundle
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => downloadSdtmDm(study)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Export SDTM Dataset (DM)
                </button>
                <button
                  type="button"
                  onClick={() => downloadSdtmAe(study)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Export SDTM Dataset (AE domain)
                </button>
                <button
                  type="button"
                  onClick={() => downloadDefineXml()}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Export Define-XML
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {/* DEMO ONLY: This is a client-side sample FHIR R4 Bundle. No FHIR server or ABDM/FHIR API is connected. */}
                {/* DEMO ONLY: SDTM DM/AE datasets are generated client-side from de-identified study data; no CDISC service is connected. */}
                FHIR Bundle and SDTM DM/AE are generated client-side from de-identified study data. No external APIs are connected.
              </p>
            </div>
          </div>

          {/* Sites */}
          <div className="self-start rounded-[5px] border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Sites</h2>
            {study.sites && study.sites.length > 0 ? (
              <ul className="space-y-3">
                {study.sites.map((site) => (
                  <li key={site.id} className="rounded border border-slate-100 p-3">
                    <p className="font-medium text-slate-900">{site.name}</p>
                    <p className="text-sm text-slate-600">
                      {site.location || "No location"}
                    </p>
                    {site.activated_at && (
                      <p className="text-xs text-slate-500">
                        Activated: {site.activated_at}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No sites assigned yet.</p>
            )}
          </div>

          {/* Subjects */}
          <div className="rounded-[5px] border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)] lg:col-span-2">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">
                Subjects ({study.subjects?.length || 0})
              </h2>
              {isAssignedCoordinator && (
                <button
                  type="button"
                  disabled={study.status === "suspended"}
                  onClick={() => {
                    setSubjectError(null);
                    setShowSubjectForm((visible) => !visible);
                  }}
                  className="rounded-lg bg-[#1d5edb] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#174ec0] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {showSubjectForm ? "Cancel" : "Add Subject"}
                </button>
              )}
            </div>

            {isPi && (
              <p className="mb-4 rounded-[5px] border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-500">
                Read-only oversight. Adding subjects and recording visits are performed by the Study Coordinator.
              </p>
            )}

            {subjectError && (
              <p className="mb-4 rounded-[5px] border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {subjectError}
              </p>
            )}

            {showSubjectForm && isAssignedCoordinator && (
              <form
                onSubmit={handleAddSubject}
                className="mb-5 max-w-2xl rounded-[5px] border border-slate-200 bg-slate-50 p-4"
              >
                <h3 className="text-sm font-semibold text-slate-900">Enroll a subject</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Coordinator operational action — subjects are linked to your assigned site.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div>
                    <label htmlFor="subjectCode" className="block text-xs font-medium text-slate-700">
                      Subject code
                    </label>
                    <input
                      id="subjectCode"
                      value={subjectCode}
                      onChange={(e) => setSubjectCode(e.target.value)}
                      required
                      className="mt-1 w-full rounded-[5px] border border-slate-300 px-3 py-2 text-sm focus:border-[#1d5edb] focus:outline-none focus:ring-1 focus:ring-[#1d5edb]"
                    />
                  </div>
                  <div>
                    <label htmlFor="subjectStatus" className="block text-xs font-medium text-slate-700">
                      Status
                    </label>
                    <select
                      id="subjectStatus"
                      value={subjectStatus}
                      onChange={(e) => setSubjectStatus(e.target.value)}
                      className="mt-1 w-full rounded-[5px] border border-slate-300 px-3 py-2 text-sm focus:border-[#1d5edb] focus:outline-none focus:ring-1 focus:ring-[#1d5edb]"
                    >
                      <option value="screening">Screening</option>
                      <option value="enrolled">Enrolled</option>
                      <option value="randomized">Randomized</option>
                      <option value="completed">Completed</option>
                      <option value="withdrawn">Withdrawn</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="enrollmentDate" className="block text-xs font-medium text-slate-700">
                      Enrollment date
                    </label>
                    <input
                      id="enrollmentDate"
                      type="date"
                      value={enrollmentDate}
                      onChange={(e) => setEnrollmentDate(e.target.value)}
                      className="mt-1 w-full rounded-[5px] border border-slate-300 px-3 py-2 text-sm focus:border-[#1d5edb] focus:outline-none focus:ring-1 focus:ring-[#1d5edb]"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={savingSubject}
                  className="mt-4 rounded-lg bg-[#1d5edb] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#174ec0] disabled:opacity-50"
                >
                  {savingSubject ? "Saving..." : "Save subject"}
                </button>
              </form>
            )}

            {study.subjects && study.subjects.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-slate-700">
                        Subject Code
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-slate-700">
                        Status
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-slate-700">
                        Enrollment Date
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-slate-700">
                        ABHA ID
                        <span className="ml-1 text-xs font-normal text-amber-600">(demo)</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {study.subjects.map((subject) => (
                      <tr key={subject.id} className="border-b border-slate-100">
                        <td className="px-4 py-3">{subject.subject_code}</td>
                        <td className="px-4 py-3">
                          <span className="inline-block rounded-full bg-[#dffaf2] px-2 py-1 text-xs font-medium text-[#0d7559]">
                            {subject.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {subject.enrollment_date || "Not enrolled"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span className="font-mono text-xs text-slate-600">
                              {getDemoAbhaId(subject.id)}
                            </span>
                            <span className="inline-flex items-center rounded-full bg-[#dffaf2] px-2 py-0.5 text-xs font-medium text-[#0d7559]">
                              Linked to ABDM ✓
                            </span>
                          </div>
                          {/* DEMO ONLY: ABHA/ABDM linkage is visual placeholder data; no ABDM service is connected. */}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No subjects enrolled yet.</p>
            )}
          </div>
        </div>

        <section className="mt-6 rounded-[5px] border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Ethics Committee Submission
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Status: <span className="font-medium capitalize text-slate-700">{submissionStatus.replaceAll("_", " ")}</span>
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Assigned Ethics Committee: {ethicsCommittee?.full_name || study.ethics_committee_id || "Not assigned"}
              </p>
              {submission?.review_comment && (
                <p className="mt-3 rounded-[5px] bg-slate-50 p-3 text-sm text-slate-700">
                  EC comment: {submission.review_comment}
                </p>
              )}
            </div>
            {canSubmit && !isPi && (
              <button
                type="button"
                onClick={() => {
                  setSubmissionError(null);
                  setShowSubmissionForm((visible) => !visible);
                }}
                className="rounded-lg bg-[#1d5edb] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#174ec0]"
              >
                {submissionStatus === "awaiting_submission" || submissionStatus === "pending" ? "Submit to Ethics Committee" : "Resubmit to Ethics Committee"}
              </button>
            )}
          </div>

          {submissionError && (
            <p className="mt-4 rounded-[5px] border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {submissionError}
            </p>
          )}

          {showSubmissionForm && canSubmit && !isPi && (
            <form onSubmit={handleSubmitToEthics} className="mt-5 max-w-2xl border-t border-slate-200 pt-5">
              <h3 className="text-sm font-semibold text-slate-900">Confirm study submission</h3>
              <p className="mt-1 text-sm text-slate-500">
                The Ethics Committee will review the study title, protocol fields, dates, enrollment target, assigned sites, and enrolled subjects shown above.
              </p>
              <dl className="mt-4 grid gap-3 rounded-[5px] bg-slate-50 p-4 text-sm sm:grid-cols-2">
                <div><dt className="font-medium text-slate-700">Title</dt><dd className="mt-1 text-slate-600">{study.title}</dd></div>
                <div><dt className="font-medium text-slate-700">Phase</dt><dd className="mt-1 text-slate-600">{study.phase || "Not specified"}</dd></div>
                <div><dt className="font-medium text-slate-700">CTRI Number</dt><dd className="mt-1 text-slate-600">{study.ctri_number || "Not registered"}</dd></div>
                <div><dt className="font-medium text-slate-700">Target Enrollment</dt><dd className="mt-1 text-slate-600">{study.target_enrollment}</dd></div>
                <div><dt className="font-medium text-slate-700">Start Date</dt><dd className="mt-1 text-slate-600">{study.start_date || "Not set"}</dd></div>
                <div><dt className="font-medium text-slate-700">End Date</dt><dd className="mt-1 text-slate-600">{study.end_date || "Not set"}</dd></div>
              </dl>
              <label htmlFor="comment" className="mt-4 block text-sm font-medium text-slate-900">
                Submission comment
              </label>
              <textarea
                id="comment"
                value={submissionComment}
                onChange={(event) => setSubmissionComment(event.target.value)}
                rows={3}
                placeholder="Add context for the Ethics Committee (optional)"
                className="mt-2 w-full rounded-[5px] border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#1d5edb] focus:outline-none focus:ring-1 focus:ring-[#1d5edb]"
              />
              <button
                type="submit"
                disabled={submittingStudy}
                className="mt-4 rounded-lg bg-[#1d5edb] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#174ec0] disabled:opacity-50"
              >
                {submittingStudy ? "Submitting..." : "Confirm Submission"}
              </button>
            </form>
          )}
        </section>

        {/* Progress Reports (Read-only list for anyone with study access) */}
        <section className="mt-6 rounded-[5px] border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Progress Reports</h2>
          
          {loadingReports ? (
            <div className="h-20 animate-pulse rounded bg-slate-100" />
          ) : reportsError ? (
            <p className="rounded-[5px] border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {reportsError}
            </p>
          ) : progressReports.length === 0 ? (
            <p className="text-sm text-slate-500">No progress reports submitted yet.</p>
          ) : (
            <div className="space-y-4">
              {progressReports.map((report) => (
                <div key={report.id} className="rounded-[5px] border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex flex-wrap justify-between gap-2 border-b border-slate-200 pb-2">
                    <p className="text-xs font-semibold text-slate-700">
                      {report.report_period_start} → {report.report_period_end}
                    </p>
                    <p className="text-xs text-slate-500">
                      Submitted by <span className="font-medium text-slate-700">{report.profiles?.full_name || "Unknown"}</span> on {new Date(report.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="whitespace-pre-wrap text-sm text-slate-800">{report.summary}</div>
                  
                  {report.enrollment_update && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">Enrollment Update</p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{report.enrollment_update}</p>
                    </div>
                  )}
                  
                  {report.issues_noted && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-red-800">Issues Noted</p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-red-700">{report.issues_noted}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Adverse-event and Progress Report actions — Coordinator only; PI has read-only access */}
        {isAssignedCoordinator && (
          <div className="mt-8 space-y-4">
            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                disabled={study.status === "suspended"}
                onClick={() => navigate(`/studies/${studyId}/report-ae`)}
                className="rounded-lg bg-[#1d5edb] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#174ec0] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Report Adverse Event
              </button>
              <button
                type="button"
                disabled={study.status === "suspended"}
                onClick={() => {
                  setProgressError(null);
                  setProgressSuccess(false);
                  setShowProgressForm((prev) => !prev);
                }}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {showProgressForm ? "Cancel Progress Report" : "Submit Progress Report"}
              </button>
            </div>

            {showProgressForm && (
              <form
                onSubmit={handleSubmitProgress}
                className="max-w-2xl rounded-[5px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)]"
              >
                <h3 className="text-sm font-semibold text-slate-900">Study Progress Report</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Submit a routine update on study activities, enrollment, and noted issues.
                </p>

                {progressSuccess && (
                  <div className="mt-4 rounded-[5px] border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                    Progress report submitted successfully!
                  </div>
                )}

                {progressError && (
                  <div className="mt-4 rounded-[5px] border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                    {progressError}
                  </div>
                )}

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="progressStartDate" className="block text-xs font-medium text-slate-700">
                      Report Period Start
                    </label>
                    <input
                      id="progressStartDate"
                      type="date"
                      value={progressStartDate}
                      onChange={(e) => setProgressStartDate(e.target.value)}
                      required
                      className="mt-1 w-full rounded-[5px] border border-slate-300 px-3 py-2 text-sm focus:border-[#1d5edb] focus:outline-none focus:ring-1 focus:ring-[#1d5edb]"
                    />
                  </div>
                  <div>
                    <label htmlFor="progressEndDate" className="block text-xs font-medium text-slate-700">
                      Report Period End
                    </label>
                    <input
                      id="progressEndDate"
                      type="date"
                      value={progressEndDate}
                      onChange={(e) => setProgressEndDate(e.target.value)}
                      required
                      className="mt-1 w-full rounded-[5px] border border-slate-300 px-3 py-2 text-sm focus:border-[#1d5edb] focus:outline-none focus:ring-1 focus:ring-[#1d5edb]"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="progressSummary" className="block text-xs font-medium text-slate-700">
                    Summary <span className="font-normal text-red-500">*</span>
                  </label>
                  <textarea
                    id="progressSummary"
                    value={progressSummary}
                    onChange={(e) => setProgressSummary(e.target.value)}
                    required
                    rows={3}
                    className="mt-1 w-full rounded-[5px] border border-slate-300 px-3 py-2 text-sm focus:border-[#1d5edb] focus:outline-none focus:ring-1 focus:ring-[#1d5edb]"
                  />
                </div>

                <div className="mt-4">
                  <label htmlFor="progressEnrollment" className="block text-xs font-medium text-slate-700">
                    Enrollment Update <span className="font-normal text-slate-400">(optional)</span>
                  </label>
                  <textarea
                    id="progressEnrollment"
                    value={progressEnrollment}
                    onChange={(e) => setProgressEnrollment(e.target.value)}
                    rows={2}
                    className="mt-1 w-full rounded-[5px] border border-slate-300 px-3 py-2 text-sm focus:border-[#1d5edb] focus:outline-none focus:ring-1 focus:ring-[#1d5edb]"
                  />
                </div>

                <div className="mt-4">
                  <label htmlFor="progressIssues" className="block text-xs font-medium text-slate-700">
                    Issues Noted <span className="font-normal text-slate-400">(optional)</span>
                  </label>
                  <textarea
                    id="progressIssues"
                    value={progressIssues}
                    onChange={(e) => setProgressIssues(e.target.value)}
                    rows={2}
                    className="mt-1 w-full rounded-[5px] border border-slate-300 px-3 py-2 text-sm focus:border-[#1d5edb] focus:outline-none focus:ring-1 focus:ring-[#1d5edb]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingProgress}
                  className="mt-5 rounded-lg bg-[#1d5edb] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#174ec0] disabled:opacity-50"
                >
                  {submittingProgress ? "Submitting..." : "Submit Report"}
                </button>
              </form>
            )}
          </div>
        )}
        {isPi && (
          <div className="mt-8 rounded-[5px] border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">
              <span className="font-medium text-slate-700">PI view — read only.</span>{" "}
              Adverse event reporting, subject management, and EC submissions are performed by the Study Coordinator.
            </p>
          </div>
        )}
      </div>

      {/* FHIR Bundle Modal */}
      {showFhirModal && fhirBundle && (
        <FhirBundleModal
          bundle={fhirBundle}
          studyId={study.id}
          onClose={() => {
            setShowFhirModal(false);
            setFhirBundle(null);
          }}
        />
      )}
    </div>
  );
}

export default StudyDetailPage;
