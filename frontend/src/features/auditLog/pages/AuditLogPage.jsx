import { useEffect, useState } from "react";
import { getAuditLogApi } from "../api/auditLogAPI.js";
import { useUser } from "../../user/hooks/useUser.js";

export function AuditLogPage() {
  const { user: profile } = useUser();
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  useEffect(() => {
    const loadAuditLog = async () => {
      try {
        // Check user role: only admin/regulator_readonly can access
        if (
          profile?.role !== "admin" &&
          profile?.role !== "regulator_readonly"
        ) {
          setAccessDenied(true);
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);
        const data = await getAuditLogApi();
        setAuditLog(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (profile) {
      loadAuditLog();
    }
  }, [profile]);

  const getActionBadgeColor = (action) => {
    switch (action) {
      case "insert":
        return "bg-green-50 text-green-700 border-green-200";
      case "update":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "delete":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const formatAction = (action) =>
    action ? action.charAt(0).toUpperCase() + action.slice(1) : "Unknown";

  const filteredAuditLog = auditLog.filter((entry) => {
    const search = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !search ||
      entry.table_name?.toLowerCase().includes(search) ||
      entry.record_id?.toLowerCase().includes(search) ||
      entry.changed_by?.toLowerCase().includes(search);
    const matchesAction =
      actionFilter === "all" || entry.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const actionOptions = [
    ...new Set(auditLog.map((entry) => entry.action).filter(Boolean)),
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f8fb] px-5 py-8 sm:px-8 lg:px-10">
        <div className="border-b border-[#dfe7ef] pb-6">
          <div className="h-3 w-24 animate-pulse rounded bg-[#dfe7ef]" />
          <div className="mt-3 h-8 w-48 animate-pulse rounded bg-[#dfe7ef]" />
          <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-[#dfe7ef]" />
        </div>
        <div className="mt-8 overflow-hidden rounded-md border border-[#dfe7ef] bg-white">
          {[1, 2, 3, 4].map((row) => (
            <div
              key={row}
              className="flex gap-6 border-b border-[#edf1f5] px-5 py-5 last:border-b-0"
            >
              <div className="h-4 w-28 animate-pulse rounded bg-[#edf1f5]" />
              <div className="h-4 flex-1 animate-pulse rounded bg-[#edf1f5]" />
              <div className="h-4 w-36 animate-pulse rounded bg-[#edf1f5]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-[#f4f8fb] px-5 py-10 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="border-l-4 border-[#c65345] bg-white px-5 py-5 shadow-[0_8px_24px_rgba(19,52,80,0.06)]">
            <h2 className="text-base font-semibold text-[#16324f]">
              Access denied
            </h2>
            <p className="mt-2 text-sm text-[#a43d31]">
              You do not have permission to view the audit log. Only admins and
              regulatory users can access this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f8fb] px-5 py-8 text-[#16324f] sm:px-8 lg:px-10">
      <div className="w-full">
        <div className="flex flex-col gap-5 border-b border-[#dfe7ef] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0d9488]">
              AIIA-CTMS / Governance
            </p>
            <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-[#16324f]">
              Audit Trail
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[#5d7187]">
              Immutable record of changes across clinical trial data and
              governance events.
            </p>
          </div>
          <p className="text-xs font-medium text-[#5d7187]">
            {auditLog.length} total {auditLog.length === 1 ? "event" : "events"}
          </p>
        </div>

        {error && (
          <div className="mt-8 border-y border-[#f1c8c2] bg-[#fff7f5] px-5 py-4 text-sm text-[#9f3f32]">
            <h2 className="font-semibold text-[#16324f]">
              Unable to load audit events
            </h2>
            <p className="mt-1">{error}</p>
          </div>
        )}

        {auditLog.length === 0 && !error ? (
          <div className="mt-8 border-y border-[#dfe7ef] py-10">
            <p className="text-sm font-semibold text-[#16324f]">
              No audit entries
            </p>
            <p className="mt-1 text-sm text-[#5d7187]">
              All changes to studies, subjects, and adverse events will be
              logged here.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-7 flex flex-col gap-3 border-y border-[#dfe7ef] py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#16324f]">
                  Event register
                </p>
                <p className="mt-1 text-xs text-[#5d7187]">
                  {filteredAuditLog.length} of {auditLog.length} events shown
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="sr-only" htmlFor="audit-search">
                  Search audit events
                </label>
                <input
                  id="audit-search"
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search table, record, or user"
                  className="h-10 w-full rounded-[5px] border border-[#cfdbe7] bg-white px-3 text-xs text-[#16324f] outline-none transition placeholder:text-[#8a9bad] focus:border-[#1f74d8] focus:ring-2 focus:ring-[#dfeeff] sm:w-60"
                />
                <label className="sr-only" htmlFor="audit-action">
                  Filter audit actions
                </label>
                <select
                  id="audit-action"
                  value={actionFilter}
                  onChange={(event) => setActionFilter(event.target.value)}
                  className="h-10 rounded-[5px] border border-[#cfdbe7] bg-white px-3 text-xs text-[#16324f] outline-none transition focus:border-[#1f74d8] focus:ring-2 focus:ring-[#dfeeff]"
                >
                  <option value="all">All actions</option>
                  {actionOptions.map((action) => (
                    <option key={action} value={action}>
                      {formatAction(action)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 hidden overflow-x-auto rounded-md border border-[#dfe7ef] bg-white shadow-[0_8px_24px_rgba(19,52,80,0.06)] md:block">
              <table className="w-full text-sm">
                <thead className="border-b border-[#dfe7ef] bg-[#fbfcfe]">
                  <tr>
                    <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5d7187]">
                      Table
                    </th>
                    <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5d7187]">
                      Action
                    </th>
                    <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5d7187]">
                      Record ID
                    </th>
                    <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5d7187]">
                      Changed By
                    </th>
                    <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5d7187]">
                      Changed At
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAuditLog.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-b border-[#edf1f5] transition-colors last:border-b-0 hover:bg-[#f8fbfe]"
                    >
                      <td className="px-5 py-4 font-medium text-[#16324f]">
                        {entry.table_name}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getActionBadgeColor(
                            entry.action,
                          )}`}
                        >
                          {formatAction(entry.action)}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-[#5d7187]">
                        {entry.record_id?.substring(0, 8) || "-"}...
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-[#5d7187]">
                        {entry.changed_by
                          ? entry.changed_by.substring(0, 8)
                          : "System"}
                      </td>
                      <td className="px-5 py-4 text-xs text-[#5d7187]">
                        {new Date(entry.changed_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 grid gap-3 md:hidden">
              {filteredAuditLog.map((entry) => (
                <article
                  key={entry.id}
                  className="border-y border-[#dfe7ef] bg-white px-4 py-4 first:border-t"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-sm font-semibold text-[#16324f]">
                        {entry.table_name}
                      </h2>
                      <p className="mt-1 font-mono text-xs text-[#5d7187]">
                        {entry.record_id?.substring(0, 8) || "-"}...
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${getActionBadgeColor(entry.action)}`}
                    >
                      {formatAction(entry.action)}
                    </span>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <dt className="uppercase tracking-[0.12em] text-[#8a9bad]">
                        Changed by
                      </dt>
                      <dd className="mt-1 font-mono text-[#5d7187]">
                        {entry.changed_by
                          ? entry.changed_by.substring(0, 8)
                          : "System"}
                      </dd>
                    </div>
                    <div>
                      <dt className="uppercase tracking-[0.12em] text-[#8a9bad]">
                        Changed at
                      </dt>
                      <dd className="mt-1 text-[#5d7187]">
                        {new Date(entry.changed_at).toLocaleString()}
                      </dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
            {filteredAuditLog.length === 0 && (
              <div className="mt-5 border-y border-[#dfe7ef] py-8 text-sm text-[#5d7187]">
                No events match the current search or action filter.
              </div>
            )}
          </>
        )}

        {/* Data Details */}
        {auditLog.length > 0 && (
          <div className="mt-8 border-t border-[#dfe7ef] pt-6">
            <h2 className="mb-4 text-base font-semibold text-[#16324f]">
              About Audit Log
            </h2>
            <ul className="grid gap-2 text-sm text-[#5d7187] sm:grid-cols-2">
              <li>
                • <strong>Table:</strong> The database table affected
              </li>
              <li>
                • <strong>Action:</strong> insert, update, or delete
              </li>
              <li>
                • <strong>Record ID:</strong> The unique identifier of the
                changed row
              </li>
              <li>
                • <strong>Changed By:</strong> The user who made the change
              </li>
              <li>
                • <strong>Changed At:</strong> Timestamp of the change
                (immutable)
              </li>
              <li>
                • <strong>RLS protected:</strong> Only admins and regulators can
                view this log
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuditLogPage;
