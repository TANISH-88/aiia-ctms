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
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `AIIA_${selectedStudy.id}_FHIR_Bundle.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleExportSdtm = () => {
    if (!selectedStudy) return;
    downloadSdtmDm(selectedStudy);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f8fb] px-5 py-8 sm:px-8 lg:px-10">
        <div className="border-b border-[#dfe7ef] pb-6">
          <div className="h-3 w-24 animate-pulse rounded bg-[#dfe7ef]" />
          <div className="mt-3 h-8 w-64 animate-pulse rounded bg-[#dfe7ef]" />
          <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-[#dfe7ef]" />
        </div>
        <div className="mt-7 border border-[#dfe7ef] bg-white p-6">
          <div className="h-3 w-24 animate-pulse rounded bg-[#edf1f5]" />
          <div className="mt-3 h-11 w-full animate-pulse rounded bg-[#edf1f5]" />
        </div>
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {["ctri", "fhir", "sdtm", "abha"].map((section) => (
            <div key={section} className="border border-[#dfe7ef] bg-white p-6">
              <div className="h-5 w-36 animate-pulse rounded bg-[#edf1f5]" />
              <div className="mt-5 h-4 w-full animate-pulse rounded bg-[#edf1f5]" />
              <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-[#edf1f5]" />
              <div className="mt-5 h-9 w-32 animate-pulse rounded bg-[#edf1f5]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f6f8fc] px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[5px] border border-red-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">Unable to load data</h2>
            <p className="mt-2 text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f8fb] px-5 py-8 text-[#16324f] sm:px-8 lg:px-10">
      <div className="w-full">
        <div className="flex flex-col gap-4 border-b border-[#dfe7ef] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0d9488]">AIIA-CTMS / Data exchange</p>
          <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-[#16324f]">
            Interoperability
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#5d7187]">Review CTRI status and generate de-identified exchange files for a selected study.</p>
          </div>
          <span className="w-fit rounded-full bg-[#fff7df] px-2.5 py-1 text-xs font-medium text-[#8a6710]">Demo environment</span>
        </div>

        <div className="mt-7 border-y border-[#dfe7ef] py-5">
          <label htmlFor="studySelect" className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5d7187]">Study context</label>
          <select
            id="studySelect"
            value={selectedStudy?.id || ""}
            onChange={(event) => setSelectedStudy(studies.find((study) => study.id === event.target.value))}
            className="mt-2 h-11 w-full rounded-[5px] border border-[#cfdbe7] bg-white px-3 text-sm text-[#16324f] outline-none focus:border-[#1f74d8] focus:ring-2 focus:ring-[#dfeeff]"
          >
            {studies.map((study) => (
              <option key={study.id} value={study.id}>{study.title} ({study.id})</option>
            ))}
          </select>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <section className="border-y border-[#dfe7ef] bg-white px-5 py-6 sm:px-6">
            <h2 className="text-base font-semibold text-[#16324f]">CTRI Registration <span className="ml-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a9bad]">Demo</span></h2>
            {selectedStudy ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-slate-700">CTRI Number</p>
                  <p className="mt-1 text-sm text-slate-600">{selectedStudy.ctri_number || "Not registered (demo placeholder)"}</p>
                </div>
                {selectedStudy.ctri_number && (
                  <>
                    <div className="inline-flex items-center rounded-full bg-[#dffaf2] px-3 py-1 text-sm font-medium text-[#0d7559]">Registered</div>
                    <p className="text-xs text-slate-400">Last synced: 3 hours ago</p>
                  </>
                )}
              </div>
            ) : <p className="text-sm text-slate-500">Select a study to view CTRI status</p>}
          </section>

          <section className="border-y border-[#dfe7ef] bg-white px-5 py-6 sm:px-6">
            <h2 className="text-base font-semibold text-[#16324f]">FHIR R4 <span className="ml-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a9bad]">Demo</span></h2>
            {selectedStudy ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">Bundle contains 1 ResearchStudy resource and {selectedStudy.subjects?.length || 0} Patient resources</p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={handleViewFhir} className="cursor-pointer rounded-[5px] bg-[#1f74d8] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#145db5] focus:outline-none focus:ring-2 focus:ring-[#dfeeff] disabled:cursor-not-allowed disabled:opacity-50">View FHIR Bundle</button>
                  <button type="button" onClick={handleExportFhir} className="cursor-pointer rounded-[5px] border border-[#cfdbe7] bg-white px-4 py-2 text-sm font-medium text-[#53657d] transition hover:bg-[#f8fbfe] focus:outline-none focus:ring-2 focus:ring-[#dfeeff] disabled:cursor-not-allowed disabled:opacity-50">Export FHIR Bundle</button>
                </div>
              </div>
            ) : <p className="text-sm text-slate-500">Select a study to view FHIR options</p>}
          </section>

          <section className="border-y border-[#dfe7ef] bg-white px-5 py-6 sm:px-6">
            <h2 className="text-base font-semibold text-[#16324f]">SDTM / CDISC <span className="ml-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a9bad]">Demo</span></h2>
            {selectedStudy ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">DM dataset with {selectedStudy.subjects?.length || 0} subject records</p>
                <button type="button" onClick={handleExportSdtm} className="cursor-pointer rounded-[5px] border border-[#cfdbe7] bg-white px-4 py-2 text-sm font-medium text-[#53657d] transition hover:bg-[#f8fbfe] focus:outline-none focus:ring-2 focus:ring-[#dfeeff] disabled:cursor-not-allowed disabled:opacity-50">Export SDTM Dataset (DM)</button>
              </div>
            ) : <p className="text-sm text-slate-500">Select a study to view SDTM options</p>}
          </section>

          <section className="border-y border-[#dfe7ef] bg-white px-5 py-6 sm:px-6">
            <h2 className="text-base font-semibold text-[#16324f]">ABDM / ABHA <span className="ml-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a9bad]">Demo</span></h2>
            {selectedStudy ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">Demo ABHA IDs for {selectedStudy.subjects?.length || 0} subjects</p>
                {selectedStudy.subjects?.length ? (
                  <div className="space-y-2">
                    {selectedStudy.subjects.slice(0, 3).map((subject) => (
                      <div key={subject.id} className="flex items-center justify-between rounded border border-slate-100 p-2">
                        <span className="text-sm text-slate-700">{subject.subject_code}</span>
                        <span className="font-mono text-xs text-slate-600">{getDemoAbhaId(subject.id)}</span>
                      </div>
                    ))}
                    {selectedStudy.subjects.length > 3 && <p className="text-xs text-slate-400">+{selectedStudy.subjects.length - 3} more subjects</p>}
                  </div>
                ) : <p className="text-sm text-slate-500">No subjects in this study</p>}
              </div>
            ) : <p className="text-sm text-slate-500">Select a study to view ABDM demo</p>}
          </section>
        </div>
      </div>

      {showFhirModal && fhirBundle && selectedStudy && (
        <FhirBundleModal
          bundle={fhirBundle}
          studyId={selectedStudy.id}
          onClose={() => { setShowFhirModal(false); setFhirBundle(null); }}
        />
      )}
    </div>
  );
}
