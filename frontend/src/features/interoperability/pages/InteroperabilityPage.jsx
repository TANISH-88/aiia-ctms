import { useEffect, useState } from "react";
import { getStudiesApi } from "../../studies/api/studiesAPI";
import { buildFhirBundle } from "../utils/fhirBundle";
import { downloadSdtmDm } from "../utils/sdtmDm";
import { getDemoAbhaId } from "../utils/abha";
import FhirBundleModal from "../components/FhirBundleModal";

// DEMO ONLY: This is a static interoperability demo page.
// No real CTRI, FHIR, CDISC, ABDM, or external API integrations are connected.

export default function InteroperabilityPage() {
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [showFhirModal, setShowFhirModal] = useState(false);
  const [fhirBundle, setFhirBundle] = useState(null);

  useEffect(() => {
    const loadStudies = async () => {
      try {
        setLoading(true);
        const data = await getStudiesApi();
        setStudies(data);
        if (data.length > 0) {
          setSelectedStudy(data[0]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadStudies();
  }, []);

  const handleViewFhir = () => {
    if (!selectedStudy) return;
    const bundle = buildFhirBundle(selectedStudy);
    setFhirBundle(bundle);
    setShowFhirModal(true);
  };

  const handleExportFhir = () => {
    if (!selectedStudy) return;
    const bundle = buildFhirBundle(selectedStudy);
    const json = JSON.stringify(bundle, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AIIA_${selectedStudy.id}_FHIR_Bundle.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportSdtm = () => {
    if (!selectedStudy) return;
    downloadSdtmDm(selectedStudy);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fc]">
        <p className="text-sm text-slate-500">Loading interoperability demo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f6f8fc] px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[5px] border border-red-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Unable to load data
            </h2>
            <p className="mt-2 text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fc] px-5 py-8 text-[#16233b] sm:px-8 lg:px-10">
      <div className="w-full">
        <div className="border-b border-slate-200 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#3d9673]">
            AIIA-CTMS
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[#17243b]">
            Interoperability
            <span className="ml-2 text-sm font-normal text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-0.5">
              Demo Only
            </span>
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Static interoperability demo — no external integrations connected
          </p>
        </div>

        {/* Study Selector */}
        <div className="mt-6 rounded-[5px] border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
          <label htmlFor="studySelect" className="block text-sm font-medium text-slate-700">
            Select Study
          </label>
          <select
            id="studySelect"
            value={selectedStudy?.id || ""}
            onChange={(e) => {
              const study = studies.find((s) => s.id === e.target.value);
              setSelectedStudy(study);
            }}
            className="mt-2 w-full rounded-[5px] border border-slate-300 px-3 py-2 text-sm focus:border-[#1d5edb] focus:outline-none focus:ring-1 focus:ring-[#1d5edb]"
          >
            {studies.map((study) => (
              <option key={study.id} value={study.id}>
                {study.title} ({study.id})
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* CTRI Registration */}
          <div className="rounded-[5px] border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              CTRI Registration
              <span className="ml-2 text-xs font-normal text-amber-600">(demo)</span>
            </h2>
            {selectedStudy ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-slate-700">CTRI Number</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {selectedStudy.ctri_number || "Not registered (demo placeholder)"}
                  </p>
                </div>
                {selectedStudy.ctri_number && (
                  <>
                    <div className="inline-flex items-center rounded-full bg-[#dffaf2] px-3 py-1 text-sm font-medium text-[#0d7559]">
                      Registered
                    </div>
                    <p className="text-xs text-slate-400">Last synced: 3 hours ago</p>
                  </>
                )}
                {/* DEMO ONLY: CTRI sync status is static; no live CTRI API is connected. */}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Select a study to view CTRI status</p>
            )}
          </div>

          {/* FHIR R4 */}
          <div className="rounded-[5px] border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              FHIR R4
              <span className="ml-2 text-xs font-normal text-amber-600">(demo)</span>
            </h2>
            {selectedStudy ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">
                  Bundle contains 1 ResearchStudy resource and {selectedStudy.subjects?.length || 0} Patient resources
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleViewFhir}
                    disabled={!selectedStudy}
                    className="rounded-lg bg-[#1d5edb] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#174ec0] disabled:opacity-50"
                  >
                    View FHIR Bundle
                  </button>
                  <button
                    type="button"
                    onClick={handleExportFhir}
                    disabled={!selectedStudy}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Export FHIR Bundle
                  </button>
                </div>
                {/* DEMO ONLY: This is a client-side sample FHIR R4 Bundle. No FHIR server or ABDM/FHIR API is connected. */}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Select a study to view FHIR options</p>
            )}
          </div>

          {/* SDTM / CDISC */}
          <div className="rounded-[5px] border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              SDTM / CDISC
              <span className="ml-2 text-xs font-normal text-amber-600">(demo)</span>
            </h2>
            {selectedStudy ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">
                  DM dataset with {selectedStudy.subjects?.length || 0} subject records
                </p>
                <button
                  type="button"
                  onClick={handleExportSdtm}
                  disabled={!selectedStudy}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Export SDTM Dataset (DM)
                </button>
                {/* DEMO ONLY: SDTM DM dataset is generated client-side from synthetic/de-identified study data; no CDISC service is connected. */}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Select a study to view SDTM options</p>
            )}
          </div>

          {/* ABDM / ABHA */}
          <div className="rounded-[5px] border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              ABDM / ABHA
              <span className="ml-2 text-xs font-normal text-amber-600">(demo)</span>
            </h2>
            {selectedStudy ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">
                  Demo ABHA IDs for {selectedStudy.subjects?.length || 0} subjects
                </p>
                {selectedStudy.subjects && selectedStudy.subjects.length > 0 ? (
                  <div className="space-y-2">
                    {selectedStudy.subjects.slice(0, 3).map((subject) => (
                      <div key={subject.id} className="flex items-center justify-between rounded border border-slate-100 p-2">
                        <span className="text-sm text-slate-700">{subject.subject_code}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-slate-600">
                            {getDemoAbhaId(subject.id)}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-[#dffaf2] px-2 py-0.5 text-xs font-medium text-[#0d7559]">
                            Linked to ABDM ✓
                          </span>
                        </div>
                      </div>
                    ))}
                    {selectedStudy.subjects.length > 3 && (
                      <p className="text-xs text-slate-400">
                        +{selectedStudy.subjects.length - 3} more subjects
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No subjects in this study</p>
                )}
                {/* DEMO ONLY: ABHA/ABDM linkage is visual placeholder data; no ABDM service is connected. */}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Select a study to view ABDM demo</p>
            )}
          </div>
        </div>
      </div>

      {/* FHIR Bundle Modal */}
      {showFhirModal && fhirBundle && selectedStudy && (
        <FhirBundleModal
          bundle={fhirBundle}
          studyId={selectedStudy.id}
          onClose={() => {
            setShowFhirModal(false);
            setFhirBundle(null);
          }}
        />
      )}
    </div>
  );
}