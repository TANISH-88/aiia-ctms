import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getAdverseEventApi,
  getLatestAeReportApi,
  reviewAeReportApi,
  resumeStudyApi,
  submitAeReportApi,
} from "../api/adverseEventsAPI";
import { getStudyApi } from "../../studies/api/studiesAPI";
import { getProfileByIdApi } from "../../user/api/userAPI";
import { useUser } from "../../user/hooks/useUser";
import { getAdverseEventTimerState } from "../utils/adverseEventTimer";

const getReportedTo = (status) => {
  if (status === "reported_to_regulator") {
    return "Regulator";
  }

  if (status === "reported_to_ec") {
    return "Ethics Committee";
  }

  return "Not reported";
};

export default function AdverseEventDetailPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [study, setStudy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(0);
  const [report, setReport] = useState(null);
  const [reviewerName, setReviewerName] = useState(null);
  const [reportComment, setReportComment] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [showReportForm, setShowReportForm] = useState(false);
  const [savingReport, setSavingReport] = useState(false);
  const { user: profile, initialized: profileInitialized } = useUser();

  const loadEvent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const eventData = await getAdverseEventApi(id);
      const [reportData, studyData] = await Promise.all([
        getLatestAeReportApi(id),
        getStudyApi(eventData.study_id),
      ]);
      setEvent(eventData);
      setReport(reportData);
      setStudy(studyData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Resolve signer name from reviewed_by (same UUID as audit_log.changed_by).
  // Prefer the already-loaded profile when the current user is the signer —
  // avoids an extra network call on the common EC self-review path.
  useEffect(() => {
    if (!report?.reviewed_by) {
      setReviewerName(null);
      return;
    }
    if (profile?.id === report.reviewed_by && profile.full_name) {
      setReviewerName(profile.full_name);
      return;
    }
    getProfileByIdApi(report.reviewed_by)
      .then((p) => setReviewerName(p?.full_name || null))
      .catch(() => setReviewerName(null));
  }, [report?.reviewed_by, profile?.id, profile?.full_name]);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => loadEvent(), 0);

    return () => window.clearTimeout(initialLoad);
  }, [loadEvent]);

  useEffect(() => {
    const initialTimer = window.setTimeout(() => setNow(Date.now()), 0);
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, []);

  const submitReport = async (formEvent) => {
    formEvent.preventDefault();

    if (!reportComment.trim()) {
      setError("A report comment is required.");
      return;
    }

    try {
      setSavingReport(true);
      setError(null);
      await submitAeReportApi(id, reportComment);
      setReportComment("");
      setShowReportForm(false);
      await loadEvent();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingReport(false);
    }
  };

  const reviewReport = async (status) => {
    if (status === "rejected" && !reviewComment.trim()) {
      setError("A rejection comment is required.");
      return;
    }

    try {
      setSavingReport(true);
      setError(null);
      await reviewAeReportApi(report.id, status, reviewComment);
      await loadEvent();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingReport(false);
    }
  };

  const resumeStudy = async () => {
    try {
      setSavingReport(true);
      setError(null);
      await resumeStudyApi(study.id);
      await loadEvent();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f8fb] px-5 py-8 sm:px-8 lg:px-10">
        <div className="border-b border-[#dfe7ef] pb-6"><div className="h-3 w-28 animate-pulse rounded bg-[#dfe7ef]" /><div className="mt-3 h-8 w-64 animate-pulse rounded bg-[#dfe7ef]" /><div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded bg-[#dfe7ef]" /></div>
        <div className="mt-8 grid gap-5 lg:grid-cols-2"><div className="h-80 animate-pulse border border-[#dfe7ef] bg-white" /><div className="h-80 animate-pulse border border-[#dfe7ef] bg-white" /></div>
      </div>
    );
  }

  if (error && !event) {
    return <div className="min-h-screen bg-[#f4f8fb] px-5 py-10 sm:px-8 lg:px-10"><div className="border-l-4 border-[#c65345] bg-white px-5 py-5 shadow-[0_8px_24px_rgba(19,52,80,0.06)]"><h2 className="text-base font-semibold text-[#16324f]">Unable to load adverse event</h2><p className="mt-2 text-sm text-[#a43d31]">{error}</p></div></div>;
  }

  if (!event) {
    return null;
  }

  // Wait for profile to be initialized before evaluating role-dependent conditions.
  // Without this guard, profile is null on first render (loaded async from Redux),
  // so assignedEc evaluates to false and EC buttons never appear even after profile loads.
  const isEc = profileInitialized && profile?.role === "ethics_committee";
  const isCoordinator = profileInitialized && profile?.role === "study_coordinator";
  const isPi = profileInitialized && profile?.role === "principal_investigator";
  const assignedEc = isEc && report?.ec_id === profile?.id;
  const studySuspended = study?.status === "suspended";

  const timerState = getAdverseEventTimerState(event, report, now);

  // ── EC review interface ────────────────────────────────────────────────────
  if (isEc) {
    return (
      <div className="min-h-screen bg-[#f4f8fb] px-5 py-8 text-[#16324f] sm:px-8 lg:px-10">
        <div className="w-full">
          <Link to="/adverse-events" className="text-sm text-[#1d5edb] hover:underline">Back to Adverse Events</Link>
          <div className="mt-5 flex flex-col gap-4 border-b border-[#dfe7ef] pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0d9488]">AIIA-CTMS / Ethics Committee</p><h1 className="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-[#16324f]">AE/SAE Report Review</h1><p className="mt-2 text-sm text-[#5d7187]">{event.is_serious ? "Serious Adverse Event" : "Adverse Event"}</p></div>
            <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${event.is_serious ? "bg-[#fff0ed] text-[#b44536]" : "bg-[#eef1f5] text-[#53657d]"}`}>{event.is_serious ? "Serious event" : "Adverse event"}</span>
          </div>

          {error && <p className="mt-6 rounded-[5px] border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {/* AE/SAE details */}
            <section className="rounded-[5px] border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
              <h2 className="mb-5 text-lg font-semibold text-slate-900">Event Information</h2>
              <dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
                <div><dt className="font-medium text-slate-700">Subject</dt><dd className="mt-1 text-slate-600">{event.subjects?.subject_code || event.subject_id}</dd></div>
                <div className="sm:col-span-2 border-y border-slate-100 py-3"><dt className="font-medium text-slate-700">Description</dt><dd className="mt-1 leading-6 text-slate-600">{event.description}</dd></div>
                <div><dt className="font-medium text-slate-700">Event date</dt><dd className="mt-1 text-slate-600">{event.onset_date}</dd></div>
                <div><dt className="font-medium text-slate-700">Severity</dt><dd className="mt-1 capitalize text-slate-600">{event.severity}</dd></div>
                <div><dt className="font-medium text-slate-700">Serious</dt><dd className="mt-1 text-slate-600">{event.is_serious ? "Yes" : "No"}</dd></div>
                <div><dt className="font-medium text-slate-700">Study status</dt><dd className={`mt-1 capitalize font-medium ${studySuspended ? "text-red-600" : "text-slate-600"}`}>{study?.status || "Unavailable"}</dd></div>
                <div><dt className="font-medium text-slate-700">MedDRA Term</dt><dd className="mt-1 text-slate-600">{event.meddra_term || "—"}</dd></div>
                <div><dt className="font-medium text-slate-700">WHODrug Term</dt><dd className="mt-1 text-slate-600">{event.who_drug_term || "—"}</dd></div>
                <div><dt className="font-medium text-slate-700">Regulatory deadline</dt><dd className="mt-1 text-slate-600">{event.regulatory_deadline ? new Date(event.regulatory_deadline).toLocaleString() : "No deadline recorded"}</dd></div>
                <div><dt className="font-medium text-slate-700">Reporting timer</dt><dd className={`mt-1 font-semibold ${timerState.statusLabel === "Overdue" ? "text-red-600" : "text-[#1d5edb]"}`}>{timerState.timerLabel}</dd></div>
              </dl>
            </section>

            {/* Coordinator report + EC action */}
            <section className="rounded-[5px] border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
              <h2 className="mb-5 text-lg font-semibold text-slate-900">Coordinator Report</h2>

              {/* No report submitted yet */}
              {!report && (
                <p className="rounded-[5px] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  No report has been submitted by the coordinator yet.
                </p>
              )}

              {/* Report exists — show details */}
              {report && (
                <dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="font-medium text-slate-700">Report status</dt>
                    <dd className="mt-1">
                      <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold capitalize ${
                        report.status === "submitted" ? "bg-amber-100 text-amber-800" :
                        report.status === "approved" ? "bg-green-100 text-green-800" :
                        report.status === "rejected" ? "bg-red-100 text-red-800" :
                        "bg-slate-100 text-slate-700"
                      }`}>
                        {report.status === "submitted" ? "Submitted — Awaiting Review" : report.status}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-700">Submitted</dt>
                    <dd className="mt-1 text-slate-600">{new Date(report.submitted_at).toLocaleString()}</dd>
                  </div>
                  {report.report_comment && (
                    <div>
                      <dt className="font-medium text-slate-700">Coordinator's report</dt>
                      <dd className="mt-1 whitespace-pre-wrap rounded-[5px] bg-slate-50 p-3 text-slate-600">{report.report_comment}</dd>
                    </div>
                  )}
                  {/* Review outcome — shown after decision */}
                  {report.reviewed_at && (
                    <>
                      <div>
                        <dt className="font-medium text-slate-700">Reviewed</dt>
                        <dd className="mt-1 text-slate-600">{new Date(report.reviewed_at).toLocaleString()}</dd>
                      </div>
                      {report.review_comment && (
                        <div>
                          <dt className="font-medium text-slate-700">EC comment</dt>
                          <dd className="mt-1 whitespace-pre-wrap rounded-[5px] bg-slate-50 p-3 text-slate-600">{report.review_comment}</dd>
                        </div>
                      )}
                    </>
                  )}
                </dl>
              )}

              {/* Electronic signature framing — uses reviewed_by / reviewed_at,
                  which mirror audit_log.changed_by / changed_at written by the
                  ae_reports audit trigger on APPROVE and REJECT. */}
              {report &&
                (report.status === "approved" || report.status === "rejected") &&
                report.reviewed_by &&
                report.reviewed_at && (
                  <p className="mt-5 border-t border-slate-200 pt-4 text-sm italic text-slate-700">
                    Electronically signed by{" "}
                    {reviewerName ||
                      (profile?.id === report.reviewed_by
                        ? profile.full_name
                        : null) ||
                      "Unknown"}{" "}
                    on {new Date(report.reviewed_at).toLocaleString()}
                  </p>
                )}

              {/* EC action buttons — only if this EC is assigned and report is pending review */}
              {!assignedEc && report && report.status === "submitted" && (
                <p className="mt-5 rounded-[5px] border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  This report is assigned to a different Ethics Committee member.
                </p>
              )}

              {assignedEc && report && report.status === "submitted" && (
                <div className="mt-6 border-t border-slate-200 pt-6">
                  <h3 className="text-sm font-semibold text-slate-900">Your Decision</h3>
                  <p className="mt-1 text-sm text-slate-500">Approving will keep the study active. Rejecting will suspend it.</p>
                  <label htmlFor="review_comment" className="mt-4 block text-sm font-medium text-slate-700">
                    Review comment <span className="font-normal text-slate-400">(required when rejecting)</span>
                  </label>
                  <textarea
                    id="review_comment"
                    value={reviewComment}
                    onChange={(formEvent) => setReviewComment(formEvent.target.value)}
                    rows={4}
                    placeholder="Enter your review comments..."
                    className="mt-2 w-full rounded-[5px] border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#1d5edb] focus:outline-none focus:ring-1 focus:ring-[#1d5edb]"
                  />
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={savingReport}
                      onClick={() => reviewReport("approved")}
                      className="rounded-lg bg-[#1d5edb] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#174ec0] disabled:opacity-50"
                    >
                      {savingReport ? "Saving..." : "Approve & Continue Trial"}
                    </button>
                    <button
                      type="button"
                      disabled={savingReport}
                      onClick={() => reviewReport("rejected")}
                      className="rounded-lg border border-red-300 bg-white px-5 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      Reject & Suspend Trial
                    </button>
                  </div>
                </div>
              )}

              {/* Resume study — shown to assigned EC when study is suspended */}
              {assignedEc && studySuspended && (
                <div className="mt-5 rounded-[5px] border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-medium text-red-800">This study is currently suspended.</p>
                  <button
                    type="button"
                    disabled={savingReport}
                    onClick={resumeStudy}
                    className="mt-3 rounded-lg border border-[#1d5edb] bg-white px-4 py-2 text-sm font-medium text-[#1d5edb] transition hover:bg-blue-50 disabled:opacity-50"
                  >
                    Resume Study
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    );
  }

  // ── Coordinator / admin interface ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f4f8fb] px-5 py-8 text-[#16324f] sm:px-8 lg:px-10">
      <div className="w-full">
        <Link to="/adverse-events" className="text-sm text-[#1d5edb] hover:underline">Back to Adverse Events</Link>
        <div className="mt-5 flex flex-col gap-4 border-b border-[#dfe7ef] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0d9488]">
            {isPi ? "AIIA-CTMS / Principal Investigator" : "AIIA-CTMS / Safety"}
          </p>
          <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-[#16324f]">Adverse Event Details</h1>
          <p className="mt-2 text-sm text-[#5d7187]">{event.is_serious ? "Serious Adverse Event" : "Adverse Event"}</p>
          </div>
          <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${event.is_serious ? "bg-[#fff0ed] text-[#b44536]" : "bg-[#eef1f5] text-[#53657d]"}`}>{event.is_serious ? "Serious event" : "Adverse event"}</span>
        </div>

        {isPi && (
          <p className="mt-6 rounded-[5px] border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-500">
            PI view — read only. Reporting AEs/SAEs and submitting reports to the Ethics Committee are Coordinator responsibilities.
          </p>
        )}

        {error && <p className="mt-6 rounded-[5px] border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-[5px] border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
            <h2 className="mb-5 text-lg font-semibold text-slate-900">Event Information</h2>
            <dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
              <div><dt className="font-medium text-slate-700">Subject</dt><dd className="mt-1 text-slate-600">{event.subjects?.subject_code || event.subject_id}</dd></div>
              <div className="sm:col-span-2 border-y border-slate-100 py-3"><dt className="font-medium text-slate-700">Description</dt><dd className="mt-1 leading-6 text-slate-600">{event.description}</dd></div>
              <div><dt className="font-medium text-slate-700">Event date</dt><dd className="mt-1 text-slate-600">{event.onset_date}</dd></div>
              <div><dt className="font-medium text-slate-700">Report date</dt><dd className="mt-1 text-slate-600">{event.reported_at ? new Date(event.reported_at).toLocaleString() : "Not reported"}</dd></div>
              <div><dt className="font-medium text-slate-700">Study ID</dt><dd className="mt-1 break-all font-mono text-xs text-slate-600">{event.study_id}</dd></div>
              <div><dt className="font-medium text-slate-700">Study status</dt><dd className="mt-1 capitalize text-slate-600">{study?.status || "Unavailable"}</dd></div>
              <div><dt className="font-medium text-slate-700">Severity</dt><dd className="mt-1 capitalize text-slate-600">{event.severity}</dd></div>
              <div><dt className="font-medium text-slate-700">MedDRA Term</dt><dd className="mt-1 text-slate-600">{event.meddra_term || "—"}</dd></div>
              <div><dt className="font-medium text-slate-700">WHODrug Term</dt><dd className="mt-1 text-slate-600">{event.who_drug_term || "—"}</dd></div>
            </dl>
          </section>

          <section className="rounded-[5px] border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
            <h2 className="mb-5 text-lg font-semibold text-slate-900">Reporting Timer</h2>
            <dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
              <div><dt className="font-medium text-slate-700">Deadline</dt><dd className="mt-1 text-slate-600">{event.regulatory_deadline ? new Date(event.regulatory_deadline).toLocaleString() : "No deadline recorded"}</dd></div>
              <div><dt className="font-medium text-slate-700">Remaining / overdue</dt><dd className={`mt-1 font-semibold ${timerState.statusLabel === "Overdue" ? "text-red-600" : "text-[#1d5edb]"}`}>{timerState.timerLabel}</dd></div>
              <div><dt className="font-medium text-slate-700">Status</dt><dd className="mt-1 capitalize text-slate-600">{timerState.statusLabel.replaceAll("_", " ")}</dd></div>
              <div><dt className="font-medium text-slate-700">Reported to</dt><dd className="mt-1 text-slate-600">{getReportedTo(event.status)}</dd></div>
              <div><dt className="font-medium text-slate-700">Reported to regulator at</dt><dd className="mt-1 text-slate-600">{event.reported_to_regulator_at ? new Date(event.reported_to_regulator_at).toLocaleString() : "Not reported"}</dd></div>
            </dl>
            {report && <div className="mt-5 rounded-[5px] bg-slate-50 p-4 text-sm">
              <p className="font-medium text-slate-700">Report status</p>
              <p className="mt-1 capitalize text-slate-600">
                {report.status === "approved"
                  ? "Reported"
                  : ["pending", "submitted"].includes(report.status)
                  ? "Submitted / Under Review"
                  : report.status}
              </p>
              <p className="mt-1 text-slate-500">Submitted: {new Date(report.submitted_at).toLocaleString()}</p>
              {report.report_comment && <p className="mt-2 text-slate-600">Coordinator report: {report.report_comment}</p>}
              {report.review_comment && <p className="mt-2 text-slate-600">EC comment: {report.review_comment}</p>}
              {(report.status === "approved" || report.status === "rejected") &&
                report.reviewed_by &&
                report.reviewed_at && (
                  <p className="mt-3 border-t border-slate-200 pt-3 italic text-slate-700">
                    Electronically signed by{" "}
                    {reviewerName || "Unknown"} on{" "}
                    {new Date(report.reviewed_at).toLocaleString()}
                  </p>
                )}
            </div>}
            {isCoordinator && !studySuspended && (!report || report.status === "rejected") && (
              <button type="button" onClick={() => setShowReportForm(true)} disabled={savingReport} className="mt-6 rounded-lg bg-[#1d5edb] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#174ec0] disabled:opacity-50">{report?.status === "rejected" ? "Resubmit Report" : "Mark Reported"}</button>
            )}
            {isCoordinator && studySuspended && <p className="mt-5 rounded-[5px] border border-red-200 bg-red-50 p-3 text-sm text-red-800">This study is suspended. Coordinator reporting actions are disabled until the assigned Ethics Committee resumes the trial.</p>}
            {isCoordinator && showReportForm && !studySuspended && (!report || report.status === "rejected") && (
              <form onSubmit={submitReport} className="mt-5 border-t border-slate-200 pt-5">
                <h3 className="font-semibold text-slate-900">Submit AE/SAE Report</h3>
                <p className="mt-1 text-sm text-slate-500">Submit this report to the Ethics Committee assigned to the study.</p>
                <textarea value={reportComment} onChange={(formEvent) => setReportComment(formEvent.target.value)} required rows={4} placeholder="Enter the required report details..." className="mt-3 w-full rounded-[5px] border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#1d5edb] focus:outline-none focus:ring-1 focus:ring-[#1d5edb]" />
                <button type="submit" disabled={savingReport} className="mt-3 rounded-lg bg-[#1d5edb] px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{savingReport ? "Submitting..." : "Submit to Ethics Committee"}</button>
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
