// DEMO ONLY: SDTM AE dataset is generated client-side from real adverse_events
// rows; no CDISC service is connected.
// Column definitions follow CDISC SDTM AE domain conventions (subset).

import { getStudyAdverseEventsApi } from "../../adverseEvents/api/adverseEventsAPI";

/**
 * Derives a short STUDYID from the study row.
 * Same preference order as SDTM DM: ctri_number → STUDY-{uuid prefix}.
 * @param {object} study
 * @returns {string}
 */
function deriveStudyId(study) {
  if (study.ctri_number && study.ctri_number.trim()) {
    return study.ctri_number.trim();
  }
  return `STUDY-${study.id.slice(0, 8).toUpperCase()}`;
}

/**
 * Maps boolean is_serious to SDTM AESER (Y/N).
 * @param {boolean} isSerious
 * @returns {"Y"|"N"}
 */
function mapAeser(isSerious) {
  return isSerious === true ? "Y" : "N";
}

/**
 * Escapes a CSV field value (commas, quotes, newlines).
 * @param {unknown} value
 * @returns {string}
 */
function escapeCsvField(value) {
  const val = String(value ?? "");
  if (
    val.includes(",") ||
    val.includes('"') ||
    val.includes("\n") ||
    val.includes("\r")
  ) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

/**
 * Generates SDTM AE rows from real study + adverse_events data.
 *
 * Mapping:
 *   STUDYID  → same deriveStudyId as DM (ctri_number or STUDY-{id prefix})
 *   DOMAIN   → "AE"
 *   USUBJID  → STUDYID-subject_code (same convention as DM)
 *   AETERM   → adverse_events.description
 *   AESER    → Y/N from adverse_events.is_serious
 *   AESTDTC  → adverse_events.onset_date
 *
 * @param {object} study — studies row with optional .subjects array
 * @param {Array<object>} adverseEvents — rows from adverse_events
 * @returns {Array<object>}
 */
export function buildSdtmAeRows(study, adverseEvents) {
  const STUDYID = deriveStudyId(study);
  const DOMAIN = "AE";

  const subjectCodeById = {};
  (study.subjects ?? []).forEach((subject) => {
    subjectCodeById[subject.id] = subject.subject_code;
  });

  return (adverseEvents ?? []).map((ae) => {
    const SUBJID = subjectCodeById[ae.subject_id] || ae.subject_id;
    const USUBJID = `${STUDYID}-${SUBJID}`;

    return {
      STUDYID,
      DOMAIN,
      USUBJID,
      AETERM: ae.description ?? "",
      AESER: mapAeser(ae.is_serious),
      AESTDTC: ae.onset_date ?? "",
    };
  });
}

/**
 * Converts AE rows to CSV with exact required column order.
 * Zero rows → header-only CSV (graceful empty export).
 * @param {Array<object>} rows
 * @returns {string}
 */
function rowsToCsv(rows) {
  const COLUMNS = ["STUDYID", "DOMAIN", "USUBJID", "AETERM", "AESER", "AESTDTC"];
  const header = COLUMNS.join(",");
  const lines = rows.map((row) =>
    COLUMNS.map((col) => escapeCsvField(row[col])).join(","),
  );
  return [header, ...lines].join("\r\n");
}

/**
 * Fetches real adverse_events for the study, builds SDTM AE CSV, and downloads it.
 * @param {object} study
 */
export async function downloadSdtmAe(study) {
  const adverseEvents = (await getStudyAdverseEventsApi(study.id))
    .slice()
    .sort((a, b) => String(a.onset_date ?? "").localeCompare(String(b.onset_date ?? "")));
  const rows = buildSdtmAeRows(study, adverseEvents);
  const csv = rowsToCsv(rows);
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `AIIA_${study.id}_AE.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
