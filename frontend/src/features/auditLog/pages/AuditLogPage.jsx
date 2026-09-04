import { useEffect, useState } from "react";
import { getAuditLogApi } from "../api/auditLogAPI.js";
import { useUser } from "../../user/hooks/useUser.js";

export function AuditLogPage() {
  const { user: profile } = useUser();
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fc]">
        <p className="text-sm text-slate-500">Loading audit log...</p>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-[#f6f8fc] px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[5px] border border-red-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">Access Denied</h2>
            <p className="mt-2 text-sm text-red-600">
              You do not have permission to view the audit log. Only admins and
              regulatory users can access this page.
            </p>
          </div>
        </div>
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
            Audit Trail
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Immutable log of all changes to clinical trial data
          </p>
        </div>

        {error && (
          <div className="mt-8 rounded-[5px] border border-red-200 bg-red-50 p-6">
            <h2 className="font-semibold text-red-900">Error</h2>
            <p className="mt-2 text-sm text-red-800">{error}</p>
          </div>
        )}

        {auditLog.length === 0 && !error ? (
          <div className="mt-8 rounded-[5px] border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
            <p className="text-sm font-medium text-slate-700">No audit entries</p>
            <p className="mt-1 text-sm text-slate-500">
              All changes to studies, subjects, and adverse events will be logged here.
            </p>
          </div>
        ) : (
          <div className="mt-8 overflow-x-auto rounded-[5px] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">
                    Table
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">
                    Record ID
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">
                    Changed By
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">
                    Changed At
                  </th>
                </tr>
              </thead>
              <tbody>
                {auditLog.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-6 py-3 font-medium text-slate-900">
                      {entry.table_name}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${getActionBadgeColor(
                          entry.action
                        )}`}
                      >
                        {entry.action}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-mono text-xs text-slate-600">
                      {entry.record_id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-3 text-slate-600">
                      {entry.changed_by ? entry.changed_by.substring(0, 8) : "System"}
                    </td>
                    <td className="px-6 py-3 text-slate-600">
                      {new Date(entry.changed_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Data Details */}
        {auditLog.length > 0 && (
          <div className="mt-8 rounded-[5px] border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              About Audit Log
            </h2>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                • <strong>Table:</strong> The database table affected
              </li>
              <li>
                • <strong>Action:</strong> insert, update, or delete
              </li>
              <li>
                • <strong>Record ID:</strong> The unique identifier of the changed row
              </li>
              <li>
                • <strong>Changed By:</strong> The user who made the change
              </li>
              <li>
                • <strong>Changed At:</strong> Timestamp of the change (immutable)
              </li>
              <li>
                • <strong>RLS protected:</strong> Only admins and regulators can view
                this log
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuditLogPage;
