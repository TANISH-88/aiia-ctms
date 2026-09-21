// DEMO ONLY: This is a client-side sample FHIR R4 Bundle.
// No FHIR server or ABDM/FHIR API is connected.
// Generated entirely in the browser from real study/subject data already loaded.

/**
 * Maps an internal study status to a FHIR ResearchStudy status code.
 * FHIR R4 ResearchStudy.status value set (partial):
 *   active | administratively-completed | approved | closed-to-accrual |
 *   closed-to-accrual-and-intervention | completed | disapproved | in-review |
 *   temporarily-closed-to-accrual | temporarily-closed-to-accrual-and-intervention |
 *   withdrawn
 */
function toFhirStudyStatus(internalStatus) {
  const map = {
    active: "active",
    enrolling: "active",
    ec_approved: "approved",
    ec_approval_pending: "in-review",
    protocol_draft: "in-review",
    ctri_registered: "active",
    closed: "completed",
    suspended: "temporarily-closed-to-accrual",
  };
  return map[internalStatus] ?? "in-review";
}

/**
 * Builds a FHIR R4 Bundle (type: collection) from real study + subjects data.
 *
 * Subject PII note: no real names, addresses, or contact details are included.
 * Only the de-identified subject_code is used as a FHIR identifier value.
 *
 * @param {object} study  — row from studies table (with .subjects array)
 * @returns {object}      — FHIR R4 Bundle object
 */
export function buildFhirBundle(study) {
  const studyResourceId = `ResearchStudy-${study.id}`;

  // --- ResearchStudy resource ---
  const researchStudy = {
    resourceType: "ResearchStudy",
    id: studyResourceId,
    meta: {
      profile: ["http://hl7.org/fhir/StructureDefinition/ResearchStudy"],
    },
    // CTRI number as identifier if available
    ...(study.ctri_number
      ? {
          identifier: [
            {
              system: "https://ctri.nic.in",
              value: study.ctri_number,
            },
          ],
        }
      : {}),
    title: study.title ?? "Untitled Study",
    status: toFhirStudyStatus(study.status),
    ...(study.phase
      ? {
          phase: {
            coding: [
              {
                system:
                  "http://terminology.hl7.org/CodeSystem/research-study-phase",
                code: `phase-${study.phase.toLowerCase().replace(/\s+/g, "-")}`,
                display: `Phase ${study.phase}`,
              },
            ],
          },
        }
      : {}),
    ...(study.start_date ? { period: { start: study.start_date } } : {}),
    ...(study.end_date
      ? { period: { ...(study.start_date ? { start: study.start_date } : {}), end: study.end_date } }
      : {}),
  };

  // --- Patient resources (one per subject, de-identified) ---
  // Patient is NOT referenced from ResearchStudy.subject (not a valid R4 reference type).
  // Subjects are represented as individual Patient resources in the Bundle entries.
  const patientResources = (study.subjects ?? []).map((subject) => ({
    resourceType: "Patient",
    id: `Patient-${subject.id}`,
    meta: {
      profile: ["http://hl7.org/fhir/StructureDefinition/Patient"],
    },
    // De-identified identifier only — no real PII
    identifier: [
      {
        system: "urn:aiia-ctms:subject-code",
        value: subject.subject_code,
      },
    ],
    // Explicitly no name, address, telecom, birthDate — de-identified
  }));

  // --- FHIR R4 Bundle ---
  const bundle = {
    resourceType: "Bundle",
    id: `Bundle-${study.id}`,
    meta: {
      lastUpdated: new Date().toISOString(),
    },
    type: "collection",
    entry: [
      {
        fullUrl: `urn:uuid:${study.id}`,
        resource: researchStudy,
      },
      ...patientResources.map((patient, index) => ({
        fullUrl: `urn:uuid:${study.subjects[index].id}`,
        resource: patient,
      })),
    ],
  };

  return bundle;
}

/**
 * Triggers a JSON file download of the FHIR Bundle in the browser.
 * @param {object} bundle  — FHIR Bundle object
 * @param {string} studyId — used in the file name
 */
export function downloadFhirBundle(bundle, studyId) {
  const json = JSON.stringify(bundle, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `AIIA_${studyId}_FHIR_Bundle.json`;
  a.click();
  URL.revokeObjectURL(url);
}
