import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStudiesApi } from "../../studies/api/studiesAPI.js";
import { useUser } from "../../user/hooks/useUser";

export default function Trial() {
  const navigate = useNavigate();
  const { user: profile } = useUser();
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isPi = profile?.role === "principal_investigator";

  useEffect(() => {
    const loadStudies = async () => {
      try {
        setLoading(true);
        const data = await getStudiesApi();
        // PI sees only studies they lead; coordinators/admin see full list (RLS applies)
        const scoped =
          profile?.role === "principal_investigator" && profile?.id
            ? data.filter((study) => study.pi_id === profile.id)
            : data;
        setStudies(scoped);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadStudies();
  }, [profile?.id, profile?.role]);

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-50 text-green-700";
      case "enrolling":
        return "bg-blue-50 text-blue-700";
      case "ec_approved":
        return "bg-yellow-50 text-yellow-700";
      case "closed":
        return "bg-slate-50 text-slate-700";
      default:
        return "bg-slate-50 text-slate-600";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fc]">
        <p className="text-sm text-slate-500">Loading clinical trials...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fc] px-5 py-8 text-[#16233b] sm:px-8 lg:px-10">
      <div className="w-full">
        <div className="border-b border-slate-200 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#3d9673]">
            AIIA-CTMS
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[#17243b]">
            Clinical Trials
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {isPi
              ? "Study-level overview of trials you lead (read-only)."
              : "Manage and monitor your clinical trial portfolio."}
          </p>
        </div>

        {error && (
          <div className="mt-8 rounded-[5px] border border-red-200 bg-red-50 p-6">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {!error && studies.length === 0 ? (
          <div className="mt-8 rounded-[5px] border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
            <p className="text-sm font-medium text-slate-700">
              No clinical trials to display
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {isPi
                ? "Studies assigned to you as Principal Investigator will appear here."
                : "Trial records will appear here when they are available."}
            </p>
          </div>
        ) : (
          <div className="mt-8 overflow-x-auto rounded-[5px] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead className="bg-[#fbfcfe]">
                <tr className="border-b border-slate-200">
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Title
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    CTRI Number
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Target Enrollment
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {studies.map((study) => (
                  <tr
                    key={study.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 text-sm font-medium text-slate-900">
                      {study.title}
                    </td>
                    <td className="px-5 py-4 text-sm">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(
                          study.status
                        )}`}
                      >
                        {study.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {study.ctri_number || "—"}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {study.target_enrollment}
                    </td>
                    <td className="px-5 py-4 text-sm">
                      <button
                        onClick={() => navigate(`/studies/${study.id}`)}
                        className="text-[#1d5edb] hover:underline"
                      >
                        View Details →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
