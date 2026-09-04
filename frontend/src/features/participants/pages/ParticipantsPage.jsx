import { useEffect, useState } from "react";
import { getParticipantsApi } from "../api/participantsAPI";
import { useUser } from "../../user/hooks/useUser";

export default function ParticipantsPage() {
  const { user: profile } = useUser();
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isPi = profile?.role === "principal_investigator";

  useEffect(() => {
    const loadParticipants = async () => {
      try {
        setLoading(true);
        setError(null);
        setParticipants(
          await getParticipantsApi(
            isPi && profile?.id ? { piId: profile.id } : undefined,
          ),
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Wait for profile when PI so we don't briefly fetch unscoped data
    if (isPi && !profile?.id) {
      return;
    }

    loadParticipants();
  }, [isPi, profile?.id]);

  return (
    <div className="min-h-screen bg-[#f6f8fc] px-5 py-8 text-[#16233b] sm:px-8 lg:px-10">
      <div className="w-full">
        <div className="border-b border-slate-200 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#3d9673]">
            AIIA-CTMS
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[#17243b]">
            Participants
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {isPi
              ? "Enrollment overview for studies you lead (read-only)."
              : "Review participant enrollment and study activity."}
          </p>
        </div>

        {loading && (
          <p className="mt-8 text-sm text-slate-500">Loading participants...</p>
        )}
        {error && (
          <p className="mt-8 rounded-[5px] border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </p>
        )}

        {!loading && !error && participants.length === 0 && (
          <div className="mt-8 rounded-[5px] border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
            <p className="text-sm font-medium text-slate-700">
              No participants to display
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {isPi
                ? "Subjects enrolled in your studies will appear here."
                : "Participant records will appear here when they are available."}
            </p>
          </div>
        )}

        {!loading && !error && participants.length > 0 && (
          <div className="mt-8 overflow-x-auto rounded-[5px] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead className="bg-[#fbfcfe]">
                <tr className="border-b border-slate-200">
                  {[
                    "Subject Code",
                    "Status",
                    "Study ID",
                    "Site ID",
                    "Enrollment Date",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {participants.map((participant) => (
                  <tr
                    key={participant.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 text-sm font-medium text-slate-900">
                      {participant.subject_code}
                    </td>
                    <td className="px-5 py-4 text-sm capitalize text-slate-600">
                      {participant.status}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-600">
                      {participant.study_id}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-600">
                      {participant.site_id || "Not assigned"}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {participant.enrollment_date || "Not enrolled"}
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
