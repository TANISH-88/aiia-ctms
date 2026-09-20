import { useEffect, useRef, useState } from "react";
import {
  getInterestSubmissionsApi,
  updateInterestSubmissionApi,
} from "../api/participantsAPI";
import { useUser } from "../../user/hooks/useUser";

const STATUS_OPTIONS = ["new", "contacted", "enrolled", "declined"];

const STATUS_COLOR = {
  new: "bg-[#e6f2ff] text-[#145db5]",
  contacted: "bg-[#fff7df] text-[#8a6710]",
  enrolled: "bg-[#e5f6ee] text-[#14734c]",
  declined: "bg-[#fff0ed] text-[#b44536]",
};

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatStatus(s) {
  if (!s) return "—";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Inline status + notes editor shown when a row is expanded. */
function EditRow({ record, canEdit, onSaved, onCancel }) {
  const [status, setStatus] = useState(record.status);
  const [notes, setNotes] = useState(record.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const submittingRef = useRef(false);

  const handleSave = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    try {
      setSaving(true);
      setError(null);
      const updated = await updateInterestSubmissionApi({
        id: record.id,
        status,
        notes: notes.trim() || null,
      });
      onSaved(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
      submittingRef.current = false;
    }
  };

  return (
    <tr className="bg-[#f8fbfe]">
      <td colSpan={6} className="px-5 py-5">
        <div className="max-w-2xl space-y-4">
          {error && (
            <p className="rounded-[5px] border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </p>
          )}
          {canEdit ? (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 rounded-[5px] border border-[#cfdbe7] bg-white px-3 py-2 text-sm text-[#16324f] focus:border-[#1f74d8] focus:outline-none focus:ring-1 focus:ring-[#1f74d8]"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {formatStatus(s)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Internal notes{" "}
                  <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-[5px] border border-[#cfdbe7] bg-white px-3 py-2 text-sm text-[#16324f] focus:border-[#1f74d8] focus:outline-none focus:ring-1 focus:ring-[#1f74d8]"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSave}
                  className="rounded-[5px] bg-[#1f74d8] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#175eaf] disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={onCancel}
                  className="rounded-[5px] border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            /* PI — read-only detail pane */
            <div className="space-y-2 text-sm text-slate-600">
              <p>
                <span className="font-medium text-slate-800">
                  Condition / Interest:{" "}
                </span>
                {record.condition_or_interest || "—"}
              </p>
              {record.notes && (
                <p>
                  <span className="font-medium text-slate-800">Notes: </span>
                  {record.notes}
                </p>
              )}
              <button
                type="button"
                onClick={onCancel}
                className="mt-2 text-xs text-[#1f74d8] hover:underline"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function InterestInboxPage() {
  const { user: profile } = useUser();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  const isPi = profile?.role === "principal_investigator";
  const canEdit =
    profile?.role === "admin" || profile?.role === "study_coordinator";

  useEffect(() => {
    if (!profile?.id) return;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getInterestSubmissionsApi(
          isPi ? { piId: profile.id } : {},
        );
        setRecords(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isPi, profile?.id]);

  const handleSaved = (updated) => {
    setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setExpandedId(null);
  };

  const filtered = records.filter((r) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term ||
      r.full_name?.toLowerCase().includes(term) ||
      r.email?.toLowerCase().includes(term) ||
      r.studies?.title?.toLowerCase().includes(term);
    const matchesStatus =
      statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#f4f8fb] px-5 py-8 text-[#16324f] sm:px-8 lg:px-10">
      <div className="w-full">
        {/* Header */}
        <div className="flex flex-col gap-5 border-b border-[#dfe7ef] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0d9488]">
              AIIA-CTMS
            </p>
            <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-[#16324f]">
              Participant Interest Inbox
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[#5d7187]">
              {isPi
                ? "Interest submissions for your studies (read-only)."
                : "Review and manage public participant interest form submissions."}
            </p>
          </div>
          <p className="text-xs font-medium text-[#5d7187]">
            {records.length}{" "}
            {records.length === 1 ? "submission" : "submissions"} in scope
          </p>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="mt-8 overflow-hidden rounded-md border border-[#dfe7ef] bg-white">
            {[1, 2, 3].map((row) => (
              <div
                key={row}
                className="flex gap-6 border-b border-[#edf1f5] px-5 py-5 last:border-b-0"
              >
                <div className="h-4 w-36 animate-pulse rounded bg-[#edf1f5]" />
                <div className="h-4 flex-1 animate-pulse rounded bg-[#edf1f5]" />
                <div className="h-4 w-20 animate-pulse rounded bg-[#edf1f5]" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-8 border-y border-[#f1c8c2] bg-[#fff7f5] px-5 py-4 text-sm text-[#9f3f32]">
            <p className="font-semibold">Unable to load submissions</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && records.length === 0 && (
          <div className="mt-8 border-y border-[#dfe7ef] py-10">
            <p className="text-sm font-semibold text-[#16324f]">
              No interest submissions yet
            </p>
            <p className="mt-1 text-sm text-[#5d7187]">
              Submissions from the public /apply form will appear here.
            </p>
          </div>
        )}

        {/* Table */}
        {!loading && !error && records.length > 0 && (
          <>
            {/* Filters */}
            <div className="mt-7 flex flex-col gap-3 border-y border-[#dfe7ef] py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#16324f]">
                  Interest submissions
                </p>
                <p className="mt-1 text-xs text-[#5d7187]">
                  {filtered.length} of {records.length} records shown
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="sr-only" htmlFor="interest-search">
                  Search submissions
                </label>
                <input
                  id="interest-search"
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search name, email, or study"
                  className="h-10 w-full rounded-[5px] border border-[#cfdbe7] bg-white px-3 text-xs text-[#16324f] outline-none transition placeholder:text-[#8a9bad] focus:border-[#1f74d8] focus:ring-2 focus:ring-[#dfeeff] sm:w-64"
                />
                <label className="sr-only" htmlFor="interest-status">
                  Filter by status
                </label>
                <select
                  id="interest-status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10 rounded-[5px] border border-[#cfdbe7] bg-white px-3 text-xs text-[#16324f] outline-none transition focus:border-[#1f74d8] focus:ring-2 focus:ring-[#dfeeff]"
                >
                  <option value="all">All statuses</option>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {formatStatus(s)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Desktop table */}
            <div className="mt-5 hidden overflow-x-auto rounded-md border border-[#dfe7ef] bg-white shadow-[0_8px_24px_rgba(19,52,80,0.06)] md:block">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead className="bg-[#fbfcfe]">
                  <tr className="border-b border-[#dfe7ef]">
                    {[
                      "Name",
                      "Email",
                      "Phone",
                      "Study",
                      "Submitted",
                      "Status",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5d7187]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <>
                      <tr
                        key={r.id}
                        className="border-b border-[#edf1f5] transition-colors last:border-b-0 hover:bg-[#f8fbfe]"
                      >
                        <td className="px-5 py-4 text-sm font-medium text-[#16324f]">
                          {r.full_name}
                        </td>
                        <td className="px-5 py-4 text-sm text-[#5d7187]">
                          {r.email}
                        </td>
                        <td className="px-5 py-4 text-sm text-[#5d7187]">
                          {r.phone || "—"}
                        </td>
                        <td className="px-5 py-4 text-sm text-[#5d7187]">
                          {r.studies?.title || "—"}
                        </td>
                        <td className="px-5 py-4 text-sm text-[#5d7187]">
                          {formatDate(r.submitted_at)}
                        </td>
                        <td className="px-5 py-4 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLOR[r.status] ?? "bg-[#f2f5f8] text-[#5d7187]"}`}
                          >
                            {formatStatus(r.status)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedId((prev) =>
                                prev === r.id ? null : r.id,
                              )
                            }
                            className="font-medium text-[#1f74d8] transition hover:text-[#145db5] hover:underline focus:outline-none focus:ring-2 focus:ring-[#dfeeff]"
                          >
                            {expandedId === r.id
                              ? "Close"
                              : canEdit
                                ? "Edit"
                                : "View"}
                            <span aria-hidden="true"> →</span>
                          </button>
                        </td>
                      </tr>
                      {expandedId === r.id && (
                        <EditRow
                          key={`edit-${r.id}`}
                          record={r}
                          canEdit={canEdit}
                          onSaved={handleSaved}
                          onCancel={() => setExpandedId(null)}
                        />
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="mt-5 grid gap-3 md:hidden">
              {filtered.map((r) => (
                <article
                  key={r.id}
                  className="rounded-[5px] border border-[#dfe7ef] bg-white px-4 py-4 shadow-[0_2px_8px_rgba(19,52,80,0.04)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-sm font-semibold text-[#16324f]">
                        {r.full_name}
                      </h2>
                      <p className="mt-0.5 text-xs text-[#5d7187]">
                        {r.email}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLOR[r.status] ?? "bg-[#f2f5f8] text-[#5d7187]"}`}
                    >
                      {formatStatus(r.status)}
                    </span>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <dt className="uppercase tracking-[0.12em] text-[#8a9bad]">
                        Phone
                      </dt>
                      <dd className="mt-0.5 text-[#5d7187]">
                        {r.phone || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="uppercase tracking-[0.12em] text-[#8a9bad]">
                        Submitted
                      </dt>
                      <dd className="mt-0.5 text-[#5d7187]">
                        {formatDate(r.submitted_at)}
                      </dd>
                    </div>
                    {r.studies?.title && (
                      <div className="col-span-2">
                        <dt className="uppercase tracking-[0.12em] text-[#8a9bad]">
                          Study
                        </dt>
                        <dd className="mt-0.5 text-[#5d7187]">
                          {r.studies.title}
                        </dd>
                      </div>
                    )}
                  </dl>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId((prev) =>
                          prev === r.id ? null : r.id,
                        )
                      }
                      className="mt-3 text-sm font-medium text-[#1f74d8] focus:outline-none focus:ring-2 focus:ring-[#dfeeff]"
                    >
                      {expandedId === r.id ? "Close" : "Edit"}{" "}
                      <span aria-hidden="true">→</span>
                    </button>
                  )}
                </article>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="mt-5 border-y border-[#dfe7ef] py-8 text-sm text-[#5d7187]">
                No submissions match the current search or status filter.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
