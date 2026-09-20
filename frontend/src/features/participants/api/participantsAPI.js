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
        "id, study_id, site_id, subject_code, status, enrollment_date, created_at, studies(id, title)",
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
      "id, study_id, site_id, subject_code, status, enrollment_date, created_at, studies(id, title)",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
};

// ---------------------------------------------------------------------------
// Participant Interest (public form leads)
// ---------------------------------------------------------------------------

/**
 * Fetch all participant-interest submissions.
 * Visible to: admin, study_coordinator, principal_investigator.
 * If piId is provided, only records whose study_id belongs to that PI are
 * returned.  Admins/coordinators pass no piId and see everything.
 */
export const getInterestSubmissionsApi = async ({ piId } = {}) => {
  let query = supabase
    .from("participant_interest")
    .select("*, studies(id, title)")
    .order("submitted_at", { ascending: false });

  if (piId) {
    // Filter to studies the PI leads (via FK on studies.pi_id)
    const { data: piStudies, error: studiesError } = await supabase
      .from("studies")
      .select("id")
      .eq("pi_id", piId);

    if (studiesError) throw new Error(studiesError.message);

    const ids = (piStudies || []).map((s) => s.id);
    if (ids.length === 0) return [];

    query = query.in("study_id", ids);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
};

/**
 * Update the status (and optional notes) of a participant-interest record.
 * Allowed roles: admin, study_coordinator.
 */
export const updateInterestSubmissionApi = async ({
  id,
  status,
  notes,
}) => {
  const { data, error } = await supabase
    .from("participant_interest")
    .update({
      status,
      notes: notes ?? undefined,
      updated_at: new Date().toISOString(),
      // updated_by is set server-side via auth.uid() in the RLS USING clause;
      // PostgREST does not automatically set it, so we pass it explicitly.
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

