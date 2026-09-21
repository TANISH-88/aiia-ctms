import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getAdverseEventsApi } from "../api/adverseEventsAPI";
import { getAdverseEventTimerState } from "../utils/adverseEventTimer";

export default function AdverseEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
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

  const getSeverityColor = (severity, isSerious) => {
    if (isSerious) return "bg-[#fff0ed] text-[#b44536]";
    if (severity === "severe") return "bg-[#fff7df] text-[#8a6710]";
    return "bg-[#eef1f5] text-[#53657d]";
  };

  const formatValue = (value) =>
    value
      ? value
          .split("_")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ")
      : "Unknown";

  const filteredEvents = events.filter((event) => {
    const search = searchTerm.trim().toLowerCase();
    return (
      !search ||
      event.subjects?.subject_code?.toLowerCase().includes(search) ||
      event.description?.toLowerCase().includes(search) ||
      event.status?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="min-h-screen bg-[#f6f8fc] px-5 py-8 text-[#16233b] sm:px-8 lg:px-10">
      <div className="w-full">
        <div className="flex flex-col gap-5 border-b border-[#dfe7ef] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0d9488]">AIIA-CTMS / Safety</p>
            <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-[#16324f]">{filter === "overdue" ? "Overdue SAEs" : filter === "open" ? "Open AEs" : "Adverse Events"}</h1>
            <p className="mt-2 text-sm text-[#5d7187]">Review reported adverse events, regulatory deadlines, and reporting status.</p>
          </div>
          <p className="text-xs font-medium text-[#5d7187]">{events.length} {events.length === 1 ? "event" : "events"} in scope</p>
        </div>

        {loading && <div className="mt-8 overflow-hidden rounded-md border border-[#dfe7ef] bg-white">{[1, 2, 3, 4].map((row) => <div key={row} className="flex gap-6 border-b border-[#edf1f5] px-5 py-5 last:border-b-0"><div className="h-4 w-28 animate-pulse rounded bg-[#edf1f5]" /><div className="h-4 flex-1 animate-pulse rounded bg-[#edf1f5]" /><div className="h-4 w-24 animate-pulse rounded bg-[#edf1f5]" /></div>)}</div>}
        {error && <div className="mt-8 border-y border-[#f1c8c2] bg-[#fff7f5] px-5 py-4 text-sm text-[#9f3f32]"><p className="font-semibold text-[#16324f]">Unable to load adverse events</p><p className="mt-1">{error}</p></div>}
        {!loading && !error && events.length === 0 && <div className="mt-8 border-y border-[#dfe7ef] py-10"><p className="text-sm font-semibold text-[#16324f]">No adverse events have been reported.</p><p className="mt-1 text-sm text-[#5d7187]">Reported safety events will appear here for review.</p></div>}

        {!loading && !error && events.length > 0 && (
          <div className="mt-7 border-y border-[#dfe7ef] bg-white">
            <div className="flex flex-col gap-3 border-b border-[#dfe7ef] px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold text-[#16324f]">Safety event register</p><p className="mt-1 text-xs text-[#5d7187]">{filteredEvents.length} of {events.length} events shown</p></div><label className="sr-only" htmlFor="ae-search">Search adverse events</label><input id="ae-search" type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search subject, event, or status" className="h-10 w-full rounded-[5px] border border-[#cfdbe7] bg-white px-3 text-xs text-[#16324f] outline-none transition placeholder:text-[#8a9bad] focus:border-[#1f74d8] focus:ring-2 focus:ring-[#dfeeff] sm:w-64" /></div>
            <div className="overflow-x-auto">
            <table className="w-full min-w-245 border-collapse text-left">
              <thead className="bg-[#fbfcfe]"><tr className="border-b border-[#dfe7ef]">
                {['Subject', 'Description', 'Event Date', 'Deadline', 'Remaining / Overdue', 'Status', 'Reported To'].map((heading) => <th key={heading} className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5d7187]">{heading}</th>)}
              </tr></thead>
              <tbody>
                {filteredEvents.map((event) => {
                  const timerState = getAdverseEventTimerState(
                    event,
                    event.latestAeReport,
                    now,
                  );

                  return (
                    <tr key={event.id} className="border-b border-[#edf1f5] transition-colors last:border-b-0 hover:bg-[#f8fbfe]">
                      <td className="px-5 py-4 text-sm font-medium"><Link to={`/adverse-events/${event.id}`} className="text-[#1f74d8] hover:underline">{event.subjects?.subject_code || event.subject_id}</Link>{event.is_serious && <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#b44536]">Serious event</span>}</td>
                      <td className="max-w-xs px-5 py-4 text-sm text-[#16324f]">{event.description}</td>
                      <td className="px-5 py-4 text-sm text-[#5d7187]">{event.onset_date}<span className="block text-xs text-[#8a9bad]">Reported: {event.reported_at ? new Date(event.reported_at).toLocaleString() : "Not reported"}</span></td>
                      <td className="px-5 py-4 text-sm text-[#5d7187]">{event.regulatory_deadline ? new Date(event.regulatory_deadline).toLocaleString() : "No deadline"}</td>
                      <td className={`px-5 py-4 text-sm ${timerState.statusLabel === "Overdue" ? "font-semibold text-[#b44536]" : "text-[#5d7187]"}`}>{timerState.timerLabel}</td>
                      <td className="px-5 py-4 text-sm"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getSeverityColor(event.severity, event.is_serious)}`}>{formatValue(timerState.statusLabel)}</span></td>
                      <td className="px-5 py-4 text-sm text-[#5d7187]">{event.status === "reported_to_regulator" ? "Regulator" : event.status === "reported_to_ec" ? "Ethics Committee" : "Not reported"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
