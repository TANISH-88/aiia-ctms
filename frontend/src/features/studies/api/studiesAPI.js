import { supabase } from "../../../api/supabase";

/**
 * Get a single study by ID
 * Per BACKEND_SPEC.md: select * from studies where id = :id
 */
export const getStudyApi = async (study_id) => {
  const { data: study, error: studyError } = await supabase
    .from("studies")
    .select("*, organizations(id, name)")
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

  // Also fetch study_assignments
  const { data: assignments, error: assignError } = await supabase
    .from("study_assignments")
    .select("*")
    .eq("study_id", study_id);

  if (assignError) {
    // Non-fatal - study_assignments table may not exist yet
    console.warn("Failed to load study_assignments:", assignError.message);
  }

  return {
    ...study,
    // The live studies table uses ec_id; keep the existing workflow API name.
    ethics_committee_id: study.ec_id ?? study.ethics_committee_id ?? null,
    sites: sites || [],
    subjects: subjects || [],
    study_assignments: assignments || [],
  };
};

/**
 * Get all studies (for listing)
 */
export const getStudiesApi = async () => {
  const { data, error } = await supabase.from("studies").select("*, organizations(id, name)");

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

/**
 * Admin-only: create a new study record in the studies table.
 *
 * Only sends fields that have values — no null writes for blank optional inputs.
 * RLS studies_write allows admin, principal_investigator, and study_coordinator to insert.
 *
 * Required:  title, targetEnrollment
 * Optional:  phase, ctriNumber, startDate, endDate
 *
 * @returns {object} The created study row (including generated id)
 */
export const createStudyApi = async ({
  title,
  targetEnrollment,
  phase,
  ctriNumber,
  startDate,
  endDate,
  ecId,
  organizationId,
}) => {
  const trimmedTitle = title?.trim();
  if (!trimmedTitle) {
    throw new Error("Study title is required.");
  }

  const enrollment = parseInt(targetEnrollment, 10);
  if (isNaN(enrollment) || enrollment < 0) {
    throw new Error("Target enrollment must be a non-negative number.");
  }

  // Build the insert payload — only include optional fields when they have a value
  const payload = {
    title: trimmedTitle,
    target_enrollment: enrollment,
  };

  if (phase?.trim()) payload.phase = phase.trim();
  if (ctriNumber?.trim()) payload.ctri_number = ctriNumber.trim();
  if (startDate) payload.start_date = startDate;
  if (endDate) payload.end_date = endDate;
  if (ecId) payload.ec_id = ecId;
  if (organizationId) payload.organization_id = organizationId;

  const { data, error } = await supabase
    .from("studies")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getOrganizationsApi = async () => {
  const { data, error } = await supabase
    .from("organizations")
    .select("id, name")
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
};

export const getOrCreateOrganizationApi = async (name) => {
  const { data, error } = await supabase.rpc(
    "get_or_create_organization",
    { p_name: name }
  );
  if (error) throw new Error(error.message);
  return Array.isArray(data) ? data[0] : data;
};

/**
 * Admin-only: bulk-insert initial sites for a newly created study.
 *
 * @param {string} studyId — UUID of the study just created
 * @param {Array<{name: string, location?: string}>} sites — validated site rows
 * @returns {Array} The inserted site rows (including generated ids)
 */
export const createSitesApi = async (studyId, sites) => {
  const payload = sites.map((s) => ({
    study_id: studyId,
    name: s.name.trim(),
    ...(s.location?.trim() ? { location: s.location.trim() } : {}),
  }));

  const { data, error } = await supabase
    .from("sites")
    .insert(payload)
    .select();

  if (error) throw new Error(error.message);
  return data || [];
};

/**
 * Admin-only: delete a draft study safely.
 *
 * @param {string} studyId — UUID of the study to delete
 * @returns {void}
 */
export const deleteStudyApi = async (studyId) => {
  const { error } = await supabase
    .from("studies")
    .delete()
    .eq("id", studyId);

  if (error) {
    throw new Error(error.message);
  }
};
