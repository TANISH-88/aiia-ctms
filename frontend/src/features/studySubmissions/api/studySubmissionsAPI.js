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
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
