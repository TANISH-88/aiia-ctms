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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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

  const formatValue = (value) =>
    value
      ? value
          .split("_")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ")
      : "Not specified";

  const formatDate = (value) => {
    if (!value) {
      return "Not submitted";
    }

    return new Date(value).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-[#fff7df] text-[#8a6710]";
      case "approved":
        return "bg-[#e5f6ee] text-[#14734c]";
      case "rejected":
        return "bg-[#fff0ed] text-[#b44536]";
      case "changes_requested":
        return "bg-[#e6f2ff] text-[#145db5]";
      default:
        return "bg-[#f2f5f8] text-[#5d7187]";
    }
  };

  const filteredStudies = studies.filter((study) => {
    const search = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !search ||
      study.title?.toLowerCase().includes(search) ||
      study.ctri_number?.toLowerCase().includes(search) ||
      study.phase?.toLowerCase().includes(search);
    const matchesStatus =
      statusFilter === "all" || study.submission.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    ...new Set(studies.map((study) => study.submission.status).filter(Boolean)),
  ];

  return (
    <div className="min-h-screen bg-[#f4f8fb] px-5 py-8 text-[#16324f] sm:px-8 lg:px-10">
      <div className="w-full">
        <div className="flex flex-col gap-5 border-b border-[#dfe7ef] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0d9488]">AIIA-CTMS / Ethics</p>
            <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-[#16324f]">
              {isPi ? "EC Submission Status" : "Study Submissions"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[#5d7187]">
              {isPi
                ? "Monitor Ethics Committee submission outcomes for your studies (read-only)."
                : "Review studies awaiting Ethics Committee action."}
            </p>
          </div>
          <p className="text-xs font-medium text-[#5d7187]">
            {studies.length} {studies.length === 1 ? "submission" : "submissions"} in scope
          </p>
        </div>

        {loading && (
          <div className="mt-8 overflow-hidden rounded-md border border-[#dfe7ef] bg-white">
            {[1, 2, 3].map((row) => (
              <div key={row} className="flex gap-6 border-b border-[#edf1f5] px-5 py-5 last:border-b-0">
                <div className="h-4 flex-1 animate-pulse rounded bg-[#edf1f5]" />
                <div className="h-4 w-20 animate-pulse rounded bg-[#edf1f5]" />
                <div className="h-4 w-28 animate-pulse rounded bg-[#edf1f5]" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-8 border-y border-[#f1c8c2] bg-[#fff7f5] px-5 py-4 text-sm text-[#9f3f32]">
            <p className="font-semibold">Unable to load submissions</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        {!loading && !error && studies.length === 0 && (
          <div className="mt-8 border-y border-[#dfe7ef] py-10">
            <p className="text-sm font-semibold text-[#16324f]">
              {isPi ? "No submissions for your studies" : "No pending submissions"}
            </p>
            <p className="mt-1 text-sm text-[#5d7187]">
              {isPi
                ? "When the coordinator submits a study to the Ethics Committee, status will appear here."
                : "Studies requiring Ethics Committee review will appear here."}
            </p>
          </div>
        )}

        {!loading && !error && studies.length > 0 && (
          <>
            <div className="mt-7 flex flex-col gap-3 border-y border-[#dfe7ef] py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#16324f]">Submission queue</p>
                <p className="mt-1 text-xs text-[#5d7187]">{filteredStudies.length} of {studies.length} records shown</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="sr-only" htmlFor="submission-search">Search submissions</label>
                <input
                  id="submission-search"
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search title, phase, or CTRI"
                  className="h-10 w-full rounded-[5px] border border-[#cfdbe7] bg-white px-3 text-xs text-[#16324f] outline-none transition placeholder:text-[#8a9bad] focus:border-[#1f74d8] focus:ring-2 focus:ring-[#dfeeff] sm:w-60"
                />
                <label className="sr-only" htmlFor="submission-status">Filter submissions by status</label>
                <select
                  id="submission-status"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="h-10 rounded-[5px] border border-[#cfdbe7] bg-white px-3 text-xs text-[#16324f] outline-none transition focus:border-[#1f74d8] focus:ring-2 focus:ring-[#dfeeff]"
                >
                  <option value="all">All statuses</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>{formatValue(status)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 hidden overflow-x-auto rounded-md border border-[#dfe7ef] bg-white shadow-[0_8px_24px_rgba(19,52,80,0.06)] md:block">
              <table className="w-full min-w-190 border-collapse text-left">
                <thead className="bg-[#fbfcfe]">
                  <tr className="border-b border-[#dfe7ef]">
                    {["Study", "Phase", "CTRI Number", "Submitted", "Status", "Action"].map((heading) => (
                      <th key={heading} className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5d7187]">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStudies.map((study) => (
                    <tr key={study.id} className="border-b border-[#edf1f5] transition-colors last:border-b-0 hover:bg-[#f8fbfe]">
                      <td className="px-5 py-4 text-sm font-medium text-[#16324f]">{study.title}</td>
                      <td className="px-5 py-4 text-sm text-[#5d7187]">{study.phase || "Not specified"}</td>
                      <td className="px-5 py-4 font-mono text-xs text-[#5d7187]">{study.ctri_number || "Not registered"}</td>
                      <td className="px-5 py-4 text-sm text-[#5d7187]">{formatDate(study.submission.submitted_at)}</td>
                      <td className="px-5 py-4 text-sm"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(study.submission.status)}`}>{formatValue(study.submission.status)}</span></td>
                      <td className="px-5 py-4 text-sm">
                        {isEcOrAdmin ? (
                          <button type="button" onClick={() => navigate(`/ethics/submissions/${study.id}`)} className="font-medium text-[#1f74d8] transition hover:text-[#145db5] hover:underline focus:outline-none focus:ring-2 focus:ring-[#dfeeff]">Review study <span aria-hidden="true">→</span></button>
                        ) : (
                          <button type="button" onClick={() => navigate(`/studies/${study.id}`)} className="font-medium text-[#1f74d8] transition hover:text-[#145db5] hover:underline focus:outline-none focus:ring-2 focus:ring-[#dfeeff]">View study <span aria-hidden="true">→</span></button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 grid gap-3 md:hidden">
              {filteredStudies.map((study) => (
                <article key={study.id} className="border-y border-[#dfe7ef] bg-white px-4 py-4 first:border-t">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-sm font-semibold leading-5 text-[#16324f]">{study.title}</h2>
                      <p className="mt-1 text-xs text-[#5d7187]">{study.phase || "Not specified"}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(study.submission.status)}`}>{formatValue(study.submission.status)}</span>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div><dt className="uppercase tracking-[0.12em] text-[#8a9bad]">Submitted</dt><dd className="mt-1 text-[#5d7187]">{formatDate(study.submission.submitted_at)}</dd></div>
                    <div><dt className="uppercase tracking-[0.12em] text-[#8a9bad]">CTRI number</dt><dd className="mt-1 font-mono text-[#5d7187]">{study.ctri_number || "Not registered"}</dd></div>
                  </dl>
                  {isEcOrAdmin ? (
                    <button type="button" onClick={() => navigate(`/ethics/submissions/${study.id}`)} className="mt-4 text-sm font-medium text-[#1f74d8] focus:outline-none focus:ring-2 focus:ring-[#dfeeff]">Review study <span aria-hidden="true">→</span></button>
                  ) : (
                    <button type="button" onClick={() => navigate(`/studies/${study.id}`)} className="mt-4 text-sm font-medium text-[#1f74d8] focus:outline-none focus:ring-2 focus:ring-[#dfeeff]">View study <span aria-hidden="true">→</span></button>
                  )}
                </article>
              ))}
            </div>

            {filteredStudies.length === 0 && <div className="mt-5 border-y border-[#dfe7ef] py-8 text-sm text-[#5d7187]">No submissions match the current search or status filter.</div>}
          </>
        )}
      </div>
    </div>
  );
}
