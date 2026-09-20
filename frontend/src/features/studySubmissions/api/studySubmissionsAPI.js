import { supabase } from "../../../api/supabase";

export const getStudySubmissionApi = async (studyId, ecId) => {
  let query = supabase
    .from("study_submissions")
    .select("*")
    .eq("study_id", studyId)
    .order("submitted_at", { ascending: false })
    .limit(1);

  if (ecId) {
    query = query.eq("ec_id", ecId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getStudySubmissionsApi = async ({ ecId } = {}) => {
  let query = supabase
    .from("study_submissions")
    .select("*, studies(*)")
    .order("submitted_at", { ascending: false });

  if (ecId) {
    query = query.eq("ec_id", ecId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

/**
 * Get studies assigned to an Ethics Committee via study_assignments.
 * Returns studies even when no study_submissions record exists yet.
 */
export const getAssignedStudiesForEC = async ({ ecId } = {}) => {
  if (!ecId) {
    return [];
  }

  // Query 1: Get assigned studies from study_assignments joined with studies
  const { data: assignments, error: assignError } = await supabase
    .from("study_assignments")
    .select(`
      study_id,
      studies (*)
    `)
    .eq("profile_id", ecId)
    .eq("role", "ethics_committee");

  if (assignError) {
    throw new Error(assignError.message);
  }

  if (!assignments || assignments.length === 0) {
    return [];
  }

  // Query 2: Get submissions for the assigned study_ids
  const studyIds = assignments.map((a) => a.study_id);
  const { data: submissions, error: subError } = await supabase
    .from("study_submissions")
    .select("*")
    .in("study_id", studyIds);

  if (subError) {
    throw new Error(subError.message);
  }

  // Create a map of study_id -> submission for O(1) lookup
  const submissionMap = new Map();
  (submissions || []).forEach((sub) => {
    submissionMap.set(sub.study_id, sub);
  });

  // Merge results: for each assignment, look up submission by study_id
  return assignments.map((assignment) => {
    const submission = submissionMap.get(assignment.study_id) || null;
    return {
      studies: assignment.studies,
      submission,
      // Add a synthetic status for UI purposes
      status: submission?.status || "awaiting_submission",
      submitted_at: submission?.submitted_at || null,
      reviewed_at: submission?.reviewed_at || null,
      review_comment: submission?.review_comment || null,
      comment: submission?.comment || null,
    };
  });
};

export const createStudySubmissionApi = async ({
  studyId,
  ecId,
  comment,
}) => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user) {
    throw new Error("User is not authenticated");
  }

  const { data, error } = await supabase
    .from("study_submissions")
    .insert({
      study_id: studyId,
      submitted_by: user.id,
      ec_id: ecId,
      status: "pending",
      comment: comment?.trim() || null,
      review_comment: null,
      reviewed_by: null,
      submitted_at: new Date().toISOString(),
      reviewed_at: null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const decideStudySubmissionApi = async ({
  submissionId,
  status,
  reviewComment,
}) => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user) {
    throw new Error("User is not authenticated");
  }

  const { data, error } = await supabase
    .from("study_submissions")
    .update({
      status,
      review_comment: reviewComment?.trim() || null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", submissionId)
    .eq("status", "pending")   // guard: reject silently if already decided
    .select()
    .single();

  if (error) {
    // PGRST116: no row matched — submission was already decided
    if (
      error.code === "PGRST116" ||
      error.message?.includes("JSON object requested, multiple (or no) rows returned")
    ) {
      throw new Error(
        "This submission has already been reviewed and cannot be changed.",
      );
    }
    throw new Error(error.message);
  }

  return data;
};
