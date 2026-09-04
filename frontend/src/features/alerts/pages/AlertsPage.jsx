import { useEffect, useState } from "react";
import { getAlertsApi } from "../api/alertsAPI.js";

export function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAlertsApi();
        setAlerts(data);
      } catch (err) {
        // study_alerts view may not exist yet (PENDING in BACKEND_SPEC.md)
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();
  }, []);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return "bg-red-50 text-red-700 border-red-200";
      case "warning":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "info":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fc]">
        <p className="text-sm text-slate-500">Loading alerts...</p>
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
            Active Alerts
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Alerts for renewal, approvals, and overdue deadlines
          </p>
        </div>

        {error && (
          <div className="mt-8 rounded-[5px] border border-yellow-200 bg-yellow-50 p-6">
            <h2 className="font-semibold text-yellow-900">Note</h2>
            <p className="mt-2 text-sm text-yellow-800">
              {error} — Alerts view is pending backend implementation. Once study_alerts view is created in the database, alerts will appear here.
            </p>
          </div>
        )}

        {!error && alerts.length === 0 ? (
          <div className="mt-8 rounded-[5px] border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
            <p className="text-sm font-medium text-slate-700">No active alerts</p>
            <p className="mt-1 text-sm text-slate-500">
              All studies are on track. Alerts will appear here when renewal dates,
              enrollment targets, or safety deadlines need attention.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {alerts.map((alert, idx) => (
              <div
                key={idx}
                className={`rounded-[5px] border p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)] ${getSeverityColor(
                  alert.severity
                )}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{alert.alert_type}</h3>
                    <p className="mt-1 text-sm">{alert.message}</p>
                    <p className="mt-2 text-xs opacity-75">
                      Study ID: {alert.study_id}
                    </p>
                    {alert.due_at && (
                      <p className="mt-1 text-xs font-medium">
                        Due: {new Date(alert.due_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <span className="inline-block rounded-full px-3 py-1 text-xs font-medium capitalize">
                    {alert.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AlertsPage;
