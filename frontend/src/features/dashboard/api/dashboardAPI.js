import { supabase } from "../../../api/supabase";

export const getDashboardApi = async () => {
  const [kpiResult, eventResult, reportResult] = await Promise.all([
    supabase.from("study_kpis").select("*"),
    supabase
      .from("adverse_events")
      .select("id, study_id, is_serious, status, regulatory_deadline"),
    supabase
      .from("ae_reports")
      .select("ae_id, submitted_at")
      .order("submitted_at", { ascending: false }),
  ]);

  if (kpiResult.error) {
    throw new Error(kpiResult.error.message);
  }

  if (eventResult.error) {
    throw new Error(eventResult.error.message);
  }

  if (reportResult.error) {
    throw new Error(reportResult.error.message);
  }

  const submittedAeIds = new Set((reportResult.data || []).map((report) => report.ae_id));
  const countsByStudy = (eventResult.data || []).reduce((counts, event) => {
    if (event.status === "closed" || submittedAeIds.has(event.id)) {
      return counts;
    }

    const studyCounts = counts[event.study_id] || { open: 0, overdue: 0 };
    studyCounts.open += 1;
    if (
      event.is_serious &&
      event.regulatory_deadline &&
      new Date(event.regulatory_deadline).getTime() < Date.now()
    ) {
      studyCounts.overdue += 1;
    }
    counts[event.study_id] = studyCounts;
    return counts;
  }, {});

  return (kpiResult.data || []).map((study) => ({
    ...study,
    open_ae_count: countsByStudy[study.study_id]?.open || 0,
    overdue_sae_count: countsByStudy[study.study_id]?.overdue || 0,
  }));
};