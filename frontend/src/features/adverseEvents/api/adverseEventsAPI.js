import { supabase } from "../../../api/supabase";

/**
 * Create an adverse event
 * Per BACKEND_SPEC.md: insert into adverse_events(...)
 * Fields: study_id, subject_id, description, onset_date, severity, is_serious, meddra_term, who_drug_term
 * regulatory_deadline is auto-filled by trigger
 */
export const createAdverseEventApi = async ({
  study_id,
  subject_id,
  description,
  onset_date,
  severity,
  is_serious,
  meddra_term,
  who_drug_term,
}) => {
  const { data, error } = await supabase.from("adverse_events").insert([
    {
      study_id,
      subject_id,
      description,
      onset_date,
      severity,
      is_serious: is_serious || false,
      meddra_term: meddra_term || null,
      who_drug_term: who_drug_term || null,
      status: "open",
    },
  ]).select();

  if (error) {
    throw new Error(error.message);
  }

  return data[0];
};

/**
 * Mark an AE as reported
 * Per BACKEND_SPEC.md: supabase.rpc('mark_ae_reported', {p_ae_id})
 */
export const markAeReportedApi = async (ae_id) => {
  const { data, error } = await supabase.rpc("mark_ae_reported", {
    p_ae_id: ae_id,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getLatestAeReportApi = async (ae_id) => {
  const { data, error } = await supabase
    .from("ae_reports")
    .select("*")
    .eq("ae_id", ae_id)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const submitAeReportApi = async (ae_id, report_comment) => {
  const { data, error } = await supabase.rpc("submit_ae_report", {
    p_ae_id: ae_id,
    p_report_comment: report_comment?.trim() || null,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const reviewAeReportApi = async (
  report_id,
  status,
  review_comment,
) => {
  const { data, error } = await supabase.rpc("review_ae_report", {
    p_report_id: report_id,
    p_status: status,
    p_review_comment: review_comment?.trim() || null,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const resumeStudyApi = async (study_id) => {
  const { data, error } = await supabase.rpc("resume_suspended_study", {
    p_study_id: study_id,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * Get adverse events for a study
 */
export const getStudyAdverseEventsApi = async (study_id) => {
  const { data, error } = await supabase
    .from("adverse_events")
    .select("*")
    .eq("study_id", study_id);

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

export const getAdverseEventsApi = async ({ filter } = {}) => {
  const { data, error } = await supabase
    .from("adverse_events")
    .select("*, subjects(subject_code), ae_reports(status, submitted_at)")
    .order("reported_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const now = Date.now();
  const events = (data || []).map((event) => ({
    ...event,
    latestAeReport: [...(event.ae_reports || [])].sort(
      (first, second) =>
        new Date(second.submitted_at).getTime() -
        new Date(first.submitted_at).getTime(),
    )[0] || null,
  }));

  if (filter === "open") {
    return events.filter((event) => !event.latestAeReport);
  }

  if (filter === "overdue") {
    return events.filter(
      (event) =>
        event.is_serious &&
        !event.latestAeReport &&
        event.regulatory_deadline &&
        new Date(event.regulatory_deadline).getTime() < now,
    );
  }

  return events;
};

/**
 * Get a single adverse event by ID
 */
export const getAdverseEventApi = async (ae_id) => {
  const { data, error } = await supabase
    .from("adverse_events")
    .select("*, subjects(subject_code), ae_reports(status, submitted_at, ec_id)")
    .eq("id", ae_id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
