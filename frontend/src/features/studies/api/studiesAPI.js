import { supabase } from "../../../api/supabase";

/**
 * Get a single study by ID
 * Per BACKEND_SPEC.md: select * from studies where id = :id
 */
export const getStudyApi = async (study_id) => {
  const { data: study, error: studyError } = await supabase
    .from("studies")
    .select("*")
    .eq("id", study_id)
    .single();

  if (studyError) {
    throw new Error(studyError.message);
  }

  // Also fetch related sites
  const { data: sites, error: sitesError } = await supabase
    .from("sites")
    .select("*")
    .eq("study_id", study_id);

  if (sitesError) {
    throw new Error(sitesError.message);
  }

  // Also fetch related subjects
  const { data: subjects, error: subjectsError } = await supabase
    .from("subjects")
    .select("*")
    .eq("study_id", study_id);

  if (subjectsError) {
    throw new Error(subjectsError.message);
  }

  return {
    ...study,
    // The live studies table uses ec_id; keep the existing workflow API name.
    ethics_committee_id: study.ec_id ?? study.ethics_committee_id ?? null,
    sites: sites || [],
    subjects: subjects || [],
  };
};

/**
 * Get all studies (for listing)
 */
export const getStudiesApi = async () => {
  const { data, error } = await supabase.from("studies").select("*");

  if (error) {
    throw new Error(error.message);
  }

  // For each study, fetch related sites and subjects
  const studiesWithRelations = await Promise.all(
    (data || []).map(async (study) => {
      const [sitesResult, subjectsResult] = await Promise.all([
        supabase.from("sites").select("*").eq("study_id", study.id),
        supabase.from("subjects").select("*").eq("study_id", study.id),
      ]);

      return {
        ...study,
        ethics_committee_id: study.ec_id ?? study.ethics_committee_id ?? null,
        sites: sitesResult.data || [],
        subjects: subjectsResult.data || [],
      };
    })
  );

  return studiesWithRelations;
};

export const getStudiesByStatusApi = async (status) => {
  const { data, error } = await supabase
    .from("studies")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

export const updateStudyStatusApi = async (study_id, status) => {
  const { data, error } = await supabase
    .from("studies")
    .update({ status })
    .eq("id", study_id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
