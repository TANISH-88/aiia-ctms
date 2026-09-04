import { supabase } from "../../../api/supabase";

/**
 * Fetch all data needed for the Principal Investigator dashboard.
 *
 * Scope: studies where studies.pi_id = auth.uid()
 * Includes:
 *  - study details + site/subject counts
 *  - AE/SAE safety metrics
 *  - latest EC submission status (pending approvals)
 *  - ae_reports awaiting review
 *  - study_alerts for PI's studies
 *
 * Read-only for PI — no write RPCs. Coordinator operational actions
 * (enroll subjects, report AEs, submit to EC) are intentionally absent.
 */
export const getPiDashboardApi = async () => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Not authenticated");
  }

  const piId = user.id;

  const [
    studiesResult,
    kpisResult,
    alertsResult,
    aeResult,
    aeReportsResult,
    submissionsResult,
    sitesResult,
    subjectsResult,
  ] = await Promise.all([
    supabase
      .from("studies")
      .select(`
          id, title, status, phase, ctri_number, target_enrollment,
          pi_id, ec_id, ec_approval_date, start_date, end_date,
          created_at, updated_at
        `)
      .eq("pi_id", piId)
      .order("created_at", { ascending: false }),

    supabase.from("study_kpis").select("*"),

    supabase.from("study_alerts").select("*"),

    supabase
      .from("adverse_events")
      .select(
        "id, study_id, is_serious, severity, status, regulatory_deadline, reported_at, description",
      ),

    supabase
      .from("ae_reports")
      .select(
        "id, ae_id, study_id, ec_id, status, submitted_at, reviewed_at, report_comment, review_comment",
      )
      .order("submitted_at", { ascending: false }),

    supabase
      .from("study_submissions")
      .select("id, study_id, status, submitted_at, reviewed_at, review_comment, ec_id")
      .order("submitted_at", { ascending: false }),

    supabase.from("sites").select("id, study_id, name, location, activated_at"),

    supabase
      .from("subjects")
      .select("id, study_id, site_id, status, enrollment_date"),
  ]);

  if (studiesResult.error) throw new Error(studiesResult.error.message);
  if (kpisResult.error) throw new Error(kpisResult.error.message);
  if (alertsResult.error) throw new Error(alertsResult.error.message);
  if (aeResult.error) throw new Error(aeResult.error.message);
  if (aeReportsResult.error) throw new Error(aeReportsResult.error.message);
  if (submissionsResult.error) throw new Error(submissionsResult.error.message);
  if (sitesResult.error) throw new Error(sitesResult.error.message);
  if (subjectsResult.error) throw new Error(subjectsResult.error.message);

  const studies = studiesResult.data || [];
  const piStudyIds = new Set(studies.map((s) => s.id));

  const kpisByStudy = Object.fromEntries(
    (kpisResult.data || []).map((k) => [k.study_id, k]),
  );

  const piAlerts = (alertsResult.data || []).filter((a) =>
    piStudyIds.has(a.study_id),
  );

  const piAes = (aeResult.data || []).filter((ae) =>
    piStudyIds.has(ae.study_id),
  );

  const piAeReports = (aeReportsResult.data || []).filter((r) =>
    piStudyIds.has(r.study_id),
  );

  const piSubmissions = (submissionsResult.data || []).filter((s) =>
    piStudyIds.has(s.study_id),
  );
  const latestSubmissionByStudy = {};
  for (const sub of piSubmissions) {
    if (!latestSubmissionByStudy[sub.study_id]) {
      latestSubmissionByStudy[sub.study_id] = sub;
    }
  }

  const latestAeReportByStudy = {};
  for (const report of piAeReports) {
    if (!latestAeReportByStudy[report.study_id]) {
      latestAeReportByStudy[report.study_id] = report;
    }
  }

  const sitesByStudy = {};
  for (const site of sitesResult.data || []) {
    if (!piStudyIds.has(site.study_id)) continue;
    if (!sitesByStudy[site.study_id]) sitesByStudy[site.study_id] = [];
    sitesByStudy[site.study_id].push(site);
  }

  const subjectsByStudy = {};
  for (const subject of subjectsResult.data || []) {
    if (!piStudyIds.has(subject.study_id)) continue;
    if (!subjectsByStudy[subject.study_id]) subjectsByStudy[subject.study_id] = [];
    subjectsByStudy[subject.study_id].push(subject);
  }

  const enrichedStudies = studies.map((study) => {
    const kpi = kpisByStudy[study.id] || {};
    const submission = latestSubmissionByStudy[study.id] || null;
    const latestAeReport = latestAeReportByStudy[study.id] || null;
    const sites = sitesByStudy[study.id] || [];
    const subjects = subjectsByStudy[study.id] || [];

    const studyAes = piAes.filter((ae) => ae.study_id === study.id);
    const openAes = studyAes.filter((ae) => ae.status === "open");
    const overdueSaes = openAes.filter(
      (ae) =>
        ae.is_serious &&
        ae.regulatory_deadline &&
        new Date(ae.regulatory_deadline).getTime() < Date.now(),
    );
    const totalSaes = studyAes.filter((ae) => ae.is_serious);

    const activatedSites = sites.filter((s) => s.activated_at).length;
    const enrolledSubjects = subjects.filter((s) =>
      ["enrolled", "randomized", "completed"].includes(s.status),
    ).length;

    return {
      ...study,
      actual_enrollment: Number(kpi.actual_enrollment) || enrolledSubjects || 0,
      enrollment_pct: Number(kpi.enrollment_pct) || 0,
      deviation_count: Number(kpi.deviation_count) || 0,
      open_ae_count: openAes.length,
      overdue_sae_count: overdueSaes.length,
      total_sae_count: totalSaes.length,
      site_count: sites.length,
      activated_site_count: activatedSites,
      subject_count: subjects.length,
      enrolled_subject_count: enrolledSubjects,
      sites,
      submission,
      latestAeReport,
    };
  });

  const totals = enrichedStudies.reduce(
    (acc, s) => {
      acc.studies += 1;
      acc.targetEnrollment += Number(s.target_enrollment) || 0;
      acc.actualEnrollment += s.actual_enrollment;
      acc.openAe += s.open_ae_count;
      acc.overdueSae += s.overdue_sae_count;
      acc.deviations += s.deviation_count;
      acc.sites += s.site_count;
      acc.subjects += s.subject_count;
      return acc;
    },
    {
      studies: 0,
      targetEnrollment: 0,
      actualEnrollment: 0,
      openAe: 0,
      overdueSae: 0,
      deviations: 0,
      sites: 0,
      subjects: 0,
    },
  );

  // Studies whose latest EC submission is still pending — PI reviews, EC decides
  const pendingApprovals = enrichedStudies.filter(
    (s) => s.submission?.status === "pending",
  );

  // EC outcomes that need PI awareness (recent decisions / follow-up)
  const recentEcDecisions = enrichedStudies.filter((s) =>
    ["approved", "rejected", "changes_requested"].includes(s.submission?.status),
  );

  const pendingAeReviews = piAeReports.filter((r) => r.status === "submitted");

  return {
    studies: enrichedStudies,
    totals,
    alerts: piAlerts,
    pendingApprovals,
    recentEcDecisions,
    pendingAeReviews,
  };
};
