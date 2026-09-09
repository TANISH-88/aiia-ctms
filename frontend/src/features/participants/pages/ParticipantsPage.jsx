import { useEffect, useState } from "react";
import { getParticipantsApi } from "../api/participantsAPI";
import { useUser } from "../../user/hooks/useUser";
import { getDemoAbhaId } from "../../interoperability/utils/abha";

export default function ParticipantsPage() {
  const { user: profile } = useUser();
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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

  const formatStatus = (status) =>
    status
      ? status
          .split("_")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ")
      : "Unknown";

  const getStatusColor = (status) => {
    switch (status) {
      case "enrolled":
        return "bg-[#e5f6ee] text-[#14734c]";
      case "screening":
        return "bg-[#e6f2ff] text-[#145db5]";
      case "completed":
        return "bg-[#eef1f5] text-[#53657d]";
      case "withdrawn":
        return "bg-[#fff0ed] text-[#b44536]";
      default:
        return "bg-[#f2f5f8] text-[#5d7187]";
    }
  };

  const filteredParticipants = participants.filter((participant) => {
    const search = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !search ||
      participant.subject_code?.toLowerCase().includes(search) ||
      participant.study_id?.toLowerCase().includes(search) ||
      participant.site_id?.toLowerCase().includes(search);
    const matchesStatus =
      statusFilter === "all" || participant.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    ...new Set(participants.map((participant) => participant.status).filter(Boolean)),
  ];

  return (
    <div className="min-h-screen bg-[#f4f8fb] px-5 py-8 text-[#16324f] sm:px-8 lg:px-10">
      <div className="w-full">
        <div className="flex flex-col gap-5 border-b border-[#dfe7ef] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0d9488]">
            AIIA-CTMS
          </p>
          <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-[#16324f]">
            Participants
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#5d7187]">
            {isPi
              ? "Enrollment overview for studies you lead (read-only)."
              : "Review participant enrollment and study activity."}
          </p>
          </div>
          <p className="text-xs font-medium text-[#5d7187]">
            {participants.length} {participants.length === 1 ? "participant" : "participants"} in scope
          </p>
        </div>

        {loading && (
          <div className="mt-8 overflow-hidden rounded-md border border-[#dfe7ef] bg-white">
            {[1, 2, 3].map((row) => (
              <div key={row} className="flex gap-6 border-b border-[#edf1f5] px-5 py-5 last:border-b-0">
                <div className="h-4 w-32 animate-pulse rounded bg-[#edf1f5]" />
                <div className="h-4 flex-1 animate-pulse rounded bg-[#edf1f5]" />
                <div className="h-4 w-24 animate-pulse rounded bg-[#edf1f5]" />
              </div>
            ))}
          </div>
        )}
        {error && (
          <div className="mt-8 border-y border-[#f1c8c2] bg-[#fff7f5] px-5 py-4 text-sm text-[#9f3f32]">
            <p className="font-semibold">Unable to load participants</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        {!loading && !error && participants.length === 0 && (
          <div className="mt-8 border-y border-[#dfe7ef] py-10">
            <p className="text-sm font-semibold text-[#16324f]">
              No participants to display
            </p>
            <p className="mt-1 text-sm text-[#5d7187]">
              {isPi
                ? "Subjects enrolled in your studies will appear here."
                : "Participant records will appear here when they are available."}
            </p>
          </div>
        )}

        {!loading && !error && participants.length > 0 && (
          <>
            <div className="mt-7 flex flex-col gap-3 border-y border-[#dfe7ef] py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#16324f]">Participant register</p>
                <p className="mt-1 text-xs text-[#5d7187]">
                  {filteredParticipants.length} of {participants.length} records shown
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="sr-only" htmlFor="participant-search">Search participants</label>
                <input
                  id="participant-search"
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search subject, study, or site"
                  className="h-10 w-full rounded-[5px] border border-[#cfdbe7] bg-white px-3 text-xs text-[#16324f] outline-none transition placeholder:text-[#8a9bad] focus:border-[#1f74d8] focus:ring-2 focus:ring-[#dfeeff] sm:w-60"
                />
                <label className="sr-only" htmlFor="participant-status">Filter by status</label>
                <select
                  id="participant-status"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="h-10 rounded-[5px] border border-[#cfdbe7] bg-white px-3 text-xs text-[#16324f] outline-none transition focus:border-[#1f74d8] focus:ring-2 focus:ring-[#dfeeff]"
                >
                  <option value="all">All statuses</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>{formatStatus(status)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 hidden overflow-x-auto rounded-md border border-[#dfe7ef] bg-white shadow-[0_8px_24px_rgba(19,52,80,0.06)] md:block">
            <table className="w-full min-w-190 border-collapse text-left">
              <thead className="bg-[#fbfcfe]">
                <tr className="border-b border-[#dfe7ef]">
                  {[
                    "Subject Code",
                    "Status",
                    "Study ID",
                    "Site ID",
                    "Enrollment Date",
                    "ABHA ID (demo)",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5d7187]"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredParticipants.map((participant) => (
                  <tr
                    key={participant.id}
                    className="border-b border-[#edf1f5] transition-colors last:border-b-0 hover:bg-[#f8fbfe]"
                  >
                    <td className="px-5 py-4 text-sm font-medium text-[#16324f]">
                      {participant.subject_code}
                    </td>
                    <td className="px-5 py-4 text-sm">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(participant.status)}`}>
                        {formatStatus(participant.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-[#5d7187]">
                      {participant.study_id}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-[#5d7187]">
                      {participant.site_id || "Not assigned"}
                    </td>
                    <td className="px-5 py-4 text-sm text-[#5d7187]">
                      {participant.enrollment_date || "Not enrolled"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-xs text-[#5d7187]">
                          {getDemoAbhaId(participant.id)}
                        </span>
                        <span className="inline-flex w-fit items-center rounded-full bg-[#e5f6ee] px-2 py-0.5 text-xs font-medium text-[#14734c]">
                          Linked to ABDM
                        </span>
                      </div>
                      {/* DEMO ONLY: ABHA/ABDM linkage is visual placeholder data; no ABDM service is connected. */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>

            <div className="mt-5 grid gap-3 md:hidden">
              {filteredParticipants.map((participant) => (
                <article key={participant.id} className="border-y border-[#dfe7ef] bg-white px-4 py-4 first:border-t">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-sm font-semibold text-[#16324f]">{participant.subject_code}</h2>
                      <p className="mt-1 font-mono text-xs text-[#5d7187]">{participant.study_id}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(participant.status)}`}>
                      {formatStatus(participant.status)}
                    </span>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <dt className="uppercase tracking-[0.12em] text-[#8a9bad]">Site</dt>
                      <dd className="mt-1 font-mono text-[#5d7187]">{participant.site_id || "Not assigned"}</dd>
                    </div>
                    <div>
                      <dt className="uppercase tracking-[0.12em] text-[#8a9bad]">Enrollment</dt>
                      <dd className="mt-1 text-[#5d7187]">{participant.enrollment_date || "Not enrolled"}</dd>
                    </div>
                  </dl>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#edf1f5] pt-3">
                    <span className="font-mono text-xs text-[#5d7187]">{getDemoAbhaId(participant.id)}</span>
                    <span className="text-xs font-medium text-[#14734c]">Linked to ABDM</span>
                  </div>
                </article>
              ))}
            </div>

            {filteredParticipants.length === 0 && (
              <div className="mt-5 border-y border-[#dfe7ef] py-8 text-sm text-[#5d7187]">
                No participants match the current search or status filter.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
