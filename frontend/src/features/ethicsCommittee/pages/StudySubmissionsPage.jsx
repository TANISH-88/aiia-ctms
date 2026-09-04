import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../user/hooks/useUser";
import {
  getStudySubmissionsApi,
} from "../../studySubmissions/api/studySubmissionsAPI";

export default function StudySubmissionsPage() {
  const navigate = useNavigate();
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user: profile, loading: profileLoading } = useUser();

  const isEcOrAdmin =
    profile?.role === "ethics_committee" || profile?.role === "admin";
  const isPi = profile?.role === "principal_investigator";

  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        setLoading(true);
        setError(null);
        const submissions = await getStudySubmissionsApi(
          profile.role === "ethics_committee"
            ? { ecId: profile.id }
            : undefined,
        );

        // EC/admin: pending queue for review
        // PI: all submissions for their studies (oversight — read-only)
        const filtered = submissions.filter((submission) => {
          if (profile.role === "admin" || profile.role === "ethics_committee") {
            return profile.role === "admin" || submission.status === "pending";
          }
          if (profile.role === "principal_investigator") {
            return submission.studies?.pi_id === profile.id;
          }
          return false;
        });

        setStudies(
          filtered.map((submission) => ({
            ...submission.studies,
            submission,
          })),
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (profileLoading || !profile) {
      return;
    }

    loadSubmissions();
  }, [profile, profileLoading]);

  return (
    <div className="min-h-screen bg-[#f6f8fc] px-5 py-8 text-[#16233b] sm:px-8 lg:px-10">
      <div className="w-full">
        <div className="border-b border-slate-200 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#3d9673]">AIIA-CTMS</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[#17243b]">
            {isPi ? "EC Submission Status" : "Study Submissions"}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {isPi
              ? "Monitor Ethics Committee submission outcomes for your studies (read-only)."
              : "Studies waiting for Ethics Committee review."}
          </p>
        </div>

        {loading && <p className="mt-8 text-sm text-slate-500">Loading submissions...</p>}
        {error && <p className="mt-8 rounded-[5px] border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}

        {!loading && !error && studies.length === 0 && (
          <div className="mt-8 rounded-[5px] border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
            <p className="text-sm font-medium text-slate-700">
              {isPi ? "No submissions for your studies" : "No pending submissions"}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {isPi
                ? "When the coordinator submits a study to the Ethics Committee, status will appear here."
                : "Studies requiring Ethics Committee review will appear here."}
            </p>
          </div>
        )}

        {!loading && !error && studies.length > 0 && (
          <div className="mt-8 overflow-x-auto rounded-[5px] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
            <table className="w-full min-w-[680px] border-collapse text-left">
              <thead className="bg-[#fbfcfe]"><tr className="border-b border-slate-200">
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Title</th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Phase</th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">CTRI Number</th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Action</th>
              </tr></thead>
              <tbody>{studies.map((study) => (
                <tr key={study.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-4 text-sm font-medium text-slate-900">{study.title}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{study.phase || "Not specified"}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{study.ctri_number || "Not registered"}</td>
                  <td className="px-5 py-4 text-sm capitalize text-slate-600">{study.submission.status.replaceAll("_", " ")}</td>
                  <td className="px-5 py-4 text-sm">
                    {isEcOrAdmin ? (
                      <button
                        type="button"
                        onClick={() => navigate(`/ethics/submissions/${study.id}`)}
                        className="text-[#1d5edb] hover:underline"
                      >
                        Review Study
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => navigate(`/studies/${study.id}`)}
                        className="text-[#1d5edb] hover:underline"
                      >
                        View study →
                      </button>
                    )}
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
