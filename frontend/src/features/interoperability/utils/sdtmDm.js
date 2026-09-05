// DEMO ONLY: SDTM DM dataset is generated client-side from synthetic/de-identified
// study data; no CDISC service is connected.
// Column definitions follow CDISC SDTM v3.3 DM domain conventions.

/**
 * Derives a short STUDYID from the study row.
 * Preference order: ctri_number → first 8 chars of id.
 * @param {object} study
 * @returns {string}
 */
function deriveStudyId(study) {
  if (study.ctri_number && study.ctri_number.trim()) {
    return study.ctri_number.trim();
  }
  // Fall back to short UUID prefix — clearly a demo placeholder
  return `STUDY-${study.id.slice(0, 8).toUpperCase()}`;
}

/**
 * Derives a SITEID from a site object.
 * Uses site.name (trimmed, spaces replaced) if available, otherwise site.id UUID.
 * @param {object|null} site
 * @returns {string}
 */
function deriveSiteId(site) {
  if (!site) return "UNKNOWN";
  if (site.name && site.name.trim()) {
    return site.name.trim().replace(/\s+/g, "-").toUpperCase().slice(0, 20);
  }
  return site.id;
}

/**
 * Generates SDTM DM rows from real study + subject + site data.
 *
 * Fields that do not exist in the schema (AGE, SEX, ARM) are populated with
 * clearly documented demo placeholder values.
 * No placeholder values are written back to Supabase.
 *
 * @param {object} study — row from studies table (with .subjects and .sites arrays)
 * @returns {Array<object>} — array of DM domain row objects
 */
export function buildSdtmDmRows(study) {
  const STUDYID = deriveStudyId(study);
  const DOMAIN = "DM";

  // Build a site lookup map (site_id → site row)
  const siteMap = {};
  (study.sites ?? []).forEach((site) => {
    siteMap[site.id] = site;
  });

  return (study.subjects ?? []).map((subject) => {
    const site = siteMap[subject.site_id] ?? null;
    const SITEID = deriveSiteId(site);
    const SUBJID = subject.subject_code;
    // USUBJID = STUDYID-SUBJID (SDTM convention: unique subject identifier across studies)
    const USUBJID = `${STUDYID}-${SUBJID}`;

    // AGE, SEX, ARM: not in schema — demo placeholder values documented in code
    // A real implementation would source these from eCRF/visit data.
    const AGE = ""; // DEMO PLACEHOLDER: age not stored in subjects schema
    const SEX = ""; // DEMO PLACEHOLDER: sex not stored in subjects schema
    const ARM = subject.status === "randomized" ? "TREATMENT-A" : ""; // DEMO PLACEHOLDER

    return { STUDYID, DOMAIN, USUBJID, SUBJID, SITEID, AGE, SEX, ARM };
  });
}

/**
 * Converts DM rows to CSV string with exact required column order.
 * @param {Array<object>} rows
 * @returns {string}
 */
function rowsToCsv(rows) {
  const COLUMNS = ["STUDYID", "DOMAIN", "USUBJID", "SUBJID", "SITEID", "AGE", "SEX", "ARM"];
  const header = COLUMNS.join(",");
  const lines = rows.map((row) =>
    COLUMNS.map((col) => {
      const val = String(row[col] ?? "");
      // Quote values that contain commas or quotes
      return val.includes(",") || val.includes('"')
        ? `"${val.replace(/"/g, '""')}"`
        : val;
    }).join(","),
  );
  return [header, ...lines].join("\r\n");
}

/**
 * Builds and downloads the SDTM DM CSV file.
 * @param {object} study
 */
export function downloadSdtmDm(study) {
  const rows = buildSdtmDmRows(study);
  const csv = rowsToCsv(rows);
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `AIIA_${study.id}_DM.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
