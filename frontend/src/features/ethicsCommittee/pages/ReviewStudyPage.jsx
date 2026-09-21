import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getStudyApi } from "../../studies/api/studiesAPI";
import { useUser } from "../../user/hooks/useUser";
import { getProfileByIdApi } from "../../user/api/userAPI";
import {
  decideStudySubmissionApi,
  getStudySubmissionApi,
} from "../../studySubmissions/api/studySubmissionsAPI";

export default function ReviewStudyPage() {
  const { id: studyId } = useParams();
  const navigate = useNavigate();
  const [study, setStudy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [piProfile, setPiProfile] = useState(null);
  const [decisionComment, setDecisionComment] = useState("");
  const { user: profile, loading: profileLoading } = useUser();
  // Synchronous in-flight guard — prevents a second action from firing
  // before React re-renders the disabled button state (e.g. rapid double-click).
  const submittingRef = useRef(false);


  useEffect(() => {
    const loadStudy = async () => {
      try {
        setLoading(true);
        setError(null);
        const [studyData, submissionData] = await Promise.all([
          getStudyApi(studyId),
          getStudySubmissionApi(
            studyId,
            profile?.role === "ethics_committee" ? profile.id : undefined,
          ),
        ]);
        if (!submissionData) {
          throw new Error("This study is not assigned to you or has no submission.");
        }
        setStudy(studyData);
        setSubmission(submissionData);

        if (studyData.pi_id) {
          try {
            const piData = await getProfileByIdApi(studyData.pi_id);
            setPiProfile(piData);
          } catch (err) {
            console.error("Failed to load PI profile:", err);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (profileLoading || !profile) {
      return;
    }

    loadStudy();
  }, [studyId, profile, profileLoading]);

  const updateStatus = async (status) => {
    // Synchronous guard: bail out immediately if another action is already in flight.
    // This catches rapid double-clicks before React has a chance to re-render
    // the disabled state on the buttons.
    if (submittingRef.current) return;
    submittingRef.current = true;

    if (status !== "approved" && !decisionComment.trim()) {
      setError("A reason is required for rejection or requested changes.");
      submittingRef.current = false;
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await decideStudySubmissionApi({
        submissionId: submission.id,
        status,
        reviewComment: decisionComment,
      });
      navigate("/ethics/submissions");
    } catch (err) {
      // "already reviewed" means another request won the race (double-click /
      // concurrent session). Re-fetch the current submission so the UI
      // transitions to the read-only reviewed card instead of staying on the
      // action form with a confusing error.
      if (err.message?.includes("already been reviewed")) {
        try {
          const fresh = await getStudySubmissionApi(
            studyId,
            profile?.role === "ethics_committee" ? profile.id : undefined,
          );
          if (fresh) {
            setSubmission(fresh);
          }
        } catch {
          // Ignore refresh errors — the main error message is enough.
        }
        setError(
          "This submission was already reviewed (possibly by another session). " +
          "The page has been updated to reflect the current state.",
        );
      } else {
        setError(err.message);
      }
    } finally {
      setSaving(false);
      submittingRef.current = false;
    }
  };


  if (loading || profileLoading) {
    return <div className="min-h-screen bg-[#f4f8fb] px-5 py-8 sm:px-8 lg:px-10"><div className="border-b border-[#dfe7ef] pb-6"><div className="h-4 w-48 animate-pulse rounded bg-[#dfe7ef]" /><div className="mt-5 h-3 w-40 animate-pulse rounded bg-[#dfe7ef]" /><div className="mt-3 h-8 w-72 animate-pulse rounded bg-[#dfe7ef]" /><div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-[#dfe7ef]" /></div><div className="mt-8 grid items-start gap-6 lg:grid-cols-2"><div className="h-96 animate-pulse border border-[#dfe7ef] bg-white" /><div className="h-64 animate-pulse border border-[#dfe7ef] bg-white" /></div><div className="mt-8 h-56 animate-pulse border border-[#dfe7ef] bg-white" /></div>;
  }

  if (error && !study) {
    return <div className="min-h-screen bg-[#f4f8fb] px-5 py-10 sm:px-8 lg:px-10"><div className="border-l-4 border-[#c65345] bg-white px-5 py-5 shadow-[0_8px_24px_rgba(19,52,80,0.06)]"><h2 className="text-base font-semibold text-[#16324f]">Unable to load study</h2><p className="mt-2 text-sm text-[#a43d31]">{error}</p></div></div>;
  }

  if (!study) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f4f8fb] px-5 py-8 text-[#16324f] sm:px-8 lg:px-10">
      <div className="w-full">
        <button type="button" onClick={() => navigate("/ethics/submissions")} className="mb-5 text-sm text-[#1d5edb] hover:underline">Back to Study Submissions</button>
        <div className="border-b border-[#dfe7ef] pb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0d9488]">AIIA-CTMS / Ethics Committee</p>
          <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-[#16324f]">Review Study</h1>
          <p className="mt-2 text-sm text-[#5d7187]">{study.title}</p>
        </div>

        {error && <p className="mt-6 rounded-[5px] border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-2">
          <section className="self-start rounded-[5px] border border-[#dfe7ef] bg-white p-6 shadow-[0_8px_24px_rgba(19,52,80,0.04)]">
            <h2 className="mb-5 text-lg font-semibold text-slate-900">Protocol and Study Details</h2>
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div><dt className="font-medium text-slate-700">Title</dt><dd className="mt-1 text-slate-600">{study.title}</dd></div>
              <div><dt className="font-medium text-slate-700">Status</dt><dd className="mt-1 capitalize text-slate-600">{study.status}</dd></div>
              <div><dt className="font-medium text-slate-700">Phase</dt><dd className="mt-1 text-slate-600">{study.phase || "Not specified"}</dd></div>
              <div><dt className="font-medium text-slate-700">CTRI Number</dt><dd className="mt-1 text-slate-600">{study.ctri_number || "Not registered"}</dd></div>
              <div><dt className="font-medium text-slate-700">Principal Investigator</dt><dd className="mt-1 break-all text-slate-600">{piProfile?.full_name || study.pi_id || "Not assigned"}</dd></div>
              <div><dt className="font-medium text-slate-700">Target Enrollment</dt><dd className="mt-1 text-slate-600">{study.target_enrollment}</dd></div>
              <div><dt className="font-medium text-slate-700">EC Approval Date</dt><dd className="mt-1 text-slate-600">{study.ec_approval_date || "Pending"}</dd></div>

              <div><dt className="font-medium text-slate-700">CTRI Registration Date</dt><dd className="mt-1 text-slate-600">{study.ctri_registration_date || "Not registered"}</dd></div>
              <div><dt className="font-medium text-slate-700">Start Date</dt><dd className="mt-1 text-slate-600">{study.start_date || "Not set"}</dd></div>
              <div><dt className="font-medium text-slate-700">End Date</dt><dd className="mt-1 text-slate-600">{study.end_date || "Not set"}</dd></div>
            </dl>
          </section>

          <section className="self-start rounded-[5px] border border-[#dfe7ef] bg-white p-6 shadow-[0_8px_24px_rgba(19,52,80,0.04)]">
            <h2 className="mb-5 text-lg font-semibold text-slate-900">Sites and Subjects</h2>
            <h3 className="text-sm font-medium text-slate-700">Sites ({study.sites?.length || 0})</h3>
            <ul className="mt-2 space-y-2 text-sm text-slate-600">{study.sites?.map((site) => <li key={site.id}>{site.name}{site.location ? ` - ${site.location}` : ""}</li>)}</ul>
            <h3 className="mt-6 text-sm font-medium text-slate-700">Subjects ({study.subjects?.length || 0})</h3>
            <ul className="mt-2 space-y-2 text-sm text-slate-600">{study.subjects?.map((subject) => <li key={subject.id}>{subject.subject_code} - {subject.status}</li>)}</ul>
          </section>
        </div>

          <div className="mt-8 border-y border-[#dfe7ef] bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Committee Decision</h2>

          {/* Only show decision controls when submission is pending */}
          {submission.status === "pending" ? (
            <>
              <p className="mt-1 text-sm text-slate-500">Approve, reject, or request changes to this submission.</p>
              <label htmlFor="decision_comment" className="mt-5 block text-sm font-medium text-slate-900">
                Decision comment {" "}
                <span className="font-normal text-slate-500">(required for reject or request changes)</span>
              </label>
              <textarea
                id="decision_comment"
                value={decisionComment}
                onChange={(event) => setDecisionComment(event.target.value)}
                rows={4}
                className="mt-2 w-full max-w-2xl rounded-[5px] border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#1d5edb] focus:outline-none focus:ring-1 focus:ring-[#1d5edb]"
              />
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => updateStatus("approved")}
                  className="rounded-lg bg-[#1d5edb] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#174ec0] disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Approve"}
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => updateStatus("rejected")}
                  className="rounded-lg border border-red-300 bg-white px-5 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => updateStatus("changes_requested")}
                  className="rounded-lg border border-amber-300 bg-white px-5 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-50 disabled:opacity-50"
                >
                  Request Changes
                </button>
              </div>
            </>
          ) : (
            /* Submission already decided — show read-only outcome */
            <div className="mt-3">
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-sm font-medium capitalize ${
                    submission.status === "approved"
                      ? "bg-[#e5f6ee] text-[#14734c]"
                      : submission.status === "rejected"
                      ? "bg-[#fff0ed] text-[#b44536]"
                      : "bg-[#e6f2ff] text-[#145db5]"
                  }`}
                >
                  {submission.status.replace(/_/g, " ")}
                </span>
                {submission.reviewed_at && (
                  <span className="text-sm text-slate-500">
                    on {new Date(submission.reviewed_at).toLocaleString()}
                  </span>
                )}
              </div>
              {submission.review_comment && (
                <p className="mt-3 max-w-2xl rounded-[5px] bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  {submission.review_comment}
                </p>
              )}
              <p className="mt-4 text-sm text-slate-400">
                This submission has already been reviewed. No further action is required.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
