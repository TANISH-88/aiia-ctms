import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getAdverseEventsApi } from "../api/adverseEventsAPI";
import { getAdverseEventTimerState } from "../utils/adverseEventTimer";

export default function AdverseEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(0);
  const [searchParams] = useSearchParams();
  const filter = searchParams.get("filter");

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        setEvents(await getAdverseEventsApi({ filter }));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [filter]);

  useEffect(() => {
    const initialTimer = window.setTimeout(() => setNow(Date.now()), 0);
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f6f8fc] px-5 py-8 text-[#16233b] sm:px-8 lg:px-10">
      <div className="w-full">
        <div className="border-b border-slate-200 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#3d9673]">AIIA-CTMS</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[#17243b]">{filter === "overdue" ? "Overdue SAEs" : filter === "open" ? "Open AEs" : "Adverse Events"}</h1>
          <p className="mt-2 text-sm text-slate-500">Review reported adverse events and their regulatory status.</p>
        </div>

        {loading && <p className="mt-8 text-sm text-slate-500">Loading adverse events...</p>}
        {error && <p className="mt-8 rounded-[5px] border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
        {!loading && !error && events.length === 0 && <div className="mt-8 rounded-[5px] border border-slate-200 bg-white p-6"><p className="text-sm text-slate-600">No adverse events have been reported.</p></div>}

        {!loading && !error && events.length > 0 && (
          <div className="mt-8 overflow-x-auto rounded-[5px] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
            <table className="w-full min-w-[980px] border-collapse text-left">
              <thead className="bg-[#fbfcfe]"><tr className="border-b border-slate-200">
                {['Subject', 'Description', 'Event Date', 'Deadline', 'Remaining / Overdue', 'Reported Status', 'Reported To'].map((heading) => <th key={heading} className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">{heading}</th>)}
              </tr></thead>
              <tbody>
                {events.map((event) => {
                  const timerState = getAdverseEventTimerState(
                    event,
                    event.latestAeReport,
                    now,
                  );

                  return (
                    <tr key={event.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-5 py-4 text-sm font-medium text-slate-900"><Link to={`/adverse-events/${event.id}`} className="text-[#1d5edb] hover:underline">{event.subjects?.subject_code || event.subject_id}</Link></td>
                      <td className="max-w-xs px-5 py-4 text-sm text-slate-900">{event.description}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{event.onset_date}<span className="block text-xs text-slate-400">Reported: {event.reported_at ? new Date(event.reported_at).toLocaleString() : "Not reported"}</span></td>
                      <td className="px-5 py-4 text-sm text-slate-600">{event.regulatory_deadline ? new Date(event.regulatory_deadline).toLocaleString() : "No deadline"}</td>
                      <td className={`px-5 py-4 text-sm ${timerState.statusLabel === "Overdue" ? "font-semibold text-red-600" : "text-slate-600"}`}>{timerState.timerLabel}</td>
                      <td className="px-5 py-4 text-sm capitalize text-slate-600">{timerState.statusLabel.replaceAll("_", " ")}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{event.status === "reported_to_regulator" ? "Regulator" : event.status === "reported_to_ec" ? "Ethics Committee" : "Not reported"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
