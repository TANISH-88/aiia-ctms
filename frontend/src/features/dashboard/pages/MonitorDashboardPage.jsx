import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../user/hooks/useUser";
import { getStudiesApi } from "../../studies/api/studiesAPI";
import { getAdverseEventsApi } from "../../adverseEvents/api/adverseEventsAPI";
import { supabase } from "../../../api/supabase";

const STATUS_STYLES = {
  active: "bg-[#e5f6ee] text-[#14734c]",
  enrolling: "bg-[#e6f2ff] text-[#145db5]",
  ec_approved: "bg-[#fff7df] text-[#8a6710]",
  ec_approval_pending: "bg-[#fff7df] text-[#8a6710]",
  protocol_draft: "bg-[#eef1f5] text-[#53657d]",
  ctri_registered: "bg-[#e6f2ff] text-[#145db5]",
  closed: "bg-[#eef1f5] text-[#53657d]",
  suspended: "bg-[#fff0ed] text-[#b44536]",
};

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || "bg-[#eef1f5] text-[#53657d]";
  const label = status === "protocol_draft" ? "Pending Ethics Review" : (status || "Unknown").replace(/_/g, " ");

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${style}`}>
      {label}
    </span>
  );
}

function Metric({ label, value, tone = "default" }) {
  const toneClass = tone === "warning" ? "text-[#a36a0a]" : tone === "danger" ? "text-[#b44536]" : "text-[#16324f]";

  return (
    <div className="border-y border-[#dfe7ef] bg-white px-5 py-4">
      <p className="text-xs text-[#5d7187]">{label}</p>
      <p className={`mt-2 text-2xl font-semibold tracking-[-0.03em] ${toneClass}`}>{value}</p>
    </div>
  );
}

function MonitorSkeleton() {
  return (
    <div className="min-h-screen bg-[#f4f8fb] px-5 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-350">
        <div className="border-b border-[#dfe7ef] pb-6">
          <div className="h-3 w-36 animate-pulse rounded bg-[#dfe7ef]" />
          <div className="mt-3 h-8 w-64 animate-pulse rounded bg-[#dfe7ef]" />
          <div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded bg-[#dfe7ef]" />
        </div>
        <div className="mt-7 grid gap-px overflow-hidden border border-[#dfe7ef] sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => <div key={item} className="h-24 animate-pulse bg-white p-5"><div className="h-3 w-24 rounded bg-[#edf1f5]" /><div className="mt-3 h-7 w-12 rounded bg-[#edf1f5]" /></div>)}
        </div>
        <div className="mt-9 border-b border-[#dfe7ef] pb-4"><div className="h-5 w-48 animate-pulse rounded bg-[#dfe7ef]" /></div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">{[1, 2].map((item) => <div key={item} className="h-48 animate-pulse border border-[#dfe7ef] bg-white" />)}</div>
      </div>
    </div>
  );
}

export default function MonitorDashboardPage() {
  const navigate = useNavigate();
  const { user: profile } = useUser();
  const [studies, setStudies] = useState([]);
  const [adverseEvents, setAdverseEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load studies assigned to monitor via study_assignments
      const { data: assignments, error: assignError } = await supabase
        .from("study_assignments")
        .select("study_id")
        .eq("role", "monitor");
      
      if (assignError) {
        throw new Error(assignError.message);
      }
      
      const assignedStudyIds = (assignments || []).map(a => a.study_id);
      
      // Load all studies and filter by assigned IDs
      const [studiesData, aeData] = await Promise.all([getStudiesApi(), getAdverseEventsApi()]);
      const assignedStudies = studiesData.filter((study) => assignedStudyIds.includes(study.id));
      setStudies(assignedStudies);
      setAdverseEvents(aeData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <MonitorSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen bg-[#f4f8fb] px-6 py-10">
        <div className="border-l-4 border-[#c65345] bg-white px-5 py-5 shadow-[0_8px_24px_rgba(19,52,80,0.06)]">
          <h2 className="text-base font-semibold text-[#16324f]">Unable to load dashboard</h2>
          <p className="mt-2 text-sm text-[#a43d31]">{error}</p>
          <button type="button" onClick={load} className="mt-4 cursor-pointer rounded-[5px] bg-[#1f74d8] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#145db5]">Retry</button>
        </div>
      </div>
    );
  }

  const assignedStudyIds = new Set(studies.map((study) => study.id));
  const myAdverseEvents = adverseEvents.filter((event) => assignedStudyIds.has(event.study_id));
  const openAes = myAdverseEvents.filter((event) => event.status === "open");
  const seriousAes = myAdverseEvents.filter((event) => event.is_serious);
  const totalSubjects = studies.reduce((sum, study) => sum + (study.subjects?.length || 0), 0);

  return (
    <div className="min-h-screen bg-[#f4f8fb] text-[#16324f]">
      <main className="mx-auto max-w-350 px-5 py-8 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-[#dfe7ef] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0d9488]">AIIA-CTMS / Monitor</p>
            <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-[#16324f]">Monitor Dashboard</h1>
            <p className="mt-2 text-sm text-[#5d7187]">Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}. Oversight of assigned sites.</p>
          </div>
          <p className="text-xs font-medium text-[#5d7187]">{studies.length} assigned {studies.length === 1 ? "study" : "studies"}</p>
        </header>

        {studies.length === 0 ? (
          <div className="mt-8 border-y border-[#dfe7ef] py-10">
            <p className="text-sm font-semibold text-[#16324f]">No sites assigned for monitoring</p>
            <p className="mt-1 text-sm text-[#5d7187]">Contact your administrator to be assigned to a study site.</p>
          </div>
        ) : (
          <>
            <section className="mt-7 grid gap-px overflow-hidden border border-[#dfe7ef] sm:grid-cols-2 lg:grid-cols-4" aria-label="Monitoring summary">
              <Metric label="Assigned studies" value={studies.length} />
              <Metric label="Total subjects" value={totalSubjects} />
              <Metric label="Open adverse events" value={openAes.length} tone={openAes.length ? "warning" : "default"} />
              <Metric label="Serious adverse events" value={seriousAes.length} tone={seriousAes.length ? "danger" : "default"} />
            </section>

            <section className="mt-9" aria-labelledby="assigned-sites-heading">
              <div className="flex items-end justify-between border-b border-[#dfe7ef] pb-4">
                <div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0d9488]">Site oversight</p><h2 id="assigned-sites-heading" className="mt-1 text-lg font-semibold text-[#16324f]">My Assigned Sites</h2></div>
                <p className="hidden text-xs text-[#718697] sm:block">Study progress and safety signals</p>
              </div>

              <div className={`mt-5 grid gap-4 ${studies.length > 1 ? "lg:grid-cols-2" : "lg:grid-cols-1"}`}>
                {studies.map((study) => {
                  const subjects = study.subjects?.length || 0;
                  const enrolled = study.subjects?.filter((subject) => ["enrolled", "randomized", "completed"].includes(subject.status)).length || 0;
                  const enrollmentPercent = study.target_enrollment ? Math.min(100, Math.round((subjects / study.target_enrollment) * 100)) : 0;
                  const studyOpenAes = openAes.filter((event) => event.study_id === study.id).length;
                  const studySeriousAes = seriousAes.filter((event) => event.study_id === study.id).length;

                  return (
                    <article key={study.id} className="border border-[#dfe7ef] bg-white p-5 shadow-[0_8px_24px_rgba(19,52,80,0.04)]">
                      <div className="flex items-start justify-between gap-4 border-b border-[#edf1f5] pb-4">
                        <div className="min-w-0"><h3 className="truncate text-[15px] font-semibold text-[#16324f]">{study.title}</h3><p className="mt-1 text-xs text-[#718697]">{study.phase ? `Phase ${study.phase}` : "Phase not specified"}</p></div>
                        <StatusBadge status={study.status} />
                      </div>

                      <div className="mt-4 grid gap-4 sm:grid-cols-[1.3fr_1fr]">
                        <div><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a9bad]">Assigned site</p>{study.sites?.length ? study.sites.map((site) => <div key={site.id} className="mt-2"><p className="text-sm font-medium text-[#16324f]">{site.name}</p><p className="mt-1 text-xs text-[#5d7187]">{site.location || "Location not provided"}</p>{site.activated_at && <p className="mt-1 text-xs text-[#718697]">Activated {new Date(site.activated_at).toLocaleDateString()}</p>}</div>) : <p className="mt-2 text-xs text-[#5d7187]">No site information available</p>}</div>
                        <div><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a9bad]">Enrollment</p><div className="mt-2 flex items-baseline gap-2"><span className="text-lg font-semibold text-[#16324f]">{enrolled}</span><span className="text-xs text-[#718697]">of {subjects} subjects</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#edf1f5]"><div className="h-full rounded-full bg-[#2eaa72]" style={{ width: `${enrollmentPercent}%` }} /></div><p className="mt-1 text-right text-xs text-[#718697]">{enrollmentPercent}% of target</p></div>
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-[#edf1f5] pt-4"><div className="flex gap-5 text-xs"><span className={studyOpenAes ? "font-medium text-[#a36a0a]" : "text-[#5d7187]"}>{studyOpenAes} open AE{studyOpenAes === 1 ? "" : "s"}</span><span className={studySeriousAes ? "font-medium text-[#b44536]" : "text-[#5d7187]"}>{studySeriousAes} serious</span></div><button type="button" onClick={() => navigate(`/studies/${study.id}`)} className="cursor-pointer text-xs font-medium text-[#1f74d8] hover:text-[#145db5] hover:underline focus:outline-none focus:ring-2 focus:ring-[#dfeeff]">View site details <span aria-hidden="true">→</span></button></div>
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}