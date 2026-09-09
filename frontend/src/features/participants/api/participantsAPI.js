import { supabase } from "../../../api/supabase";

export const getParticipantsApi = async ({ piId } = {}) => {
  // When piId is provided, only return subjects for studies that PI leads
  if (piId) {
    const { data: studies, error: studiesError } = await supabase
      .from("studies")
      .select("id")
      .eq("pi_id", piId);

    if (studiesError) {
      throw new Error(studiesError.message);
    }

    const studyIds = (studies || []).map((s) => s.id);
    if (studyIds.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from("subjects")
      .select(
        "id, study_id, site_id, subject_code, status, enrollment_date, created_at",
      )
      .in("study_id", studyIds)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  }

  const { data, error } = await supabase
    .from("subjects")
    .select(
      "id, study_id, site_id, subject_code, status, enrollment_date, created_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
};
