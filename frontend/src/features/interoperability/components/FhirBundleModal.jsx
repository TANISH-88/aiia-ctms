import { useEffect, useRef } from "react";
import { downloadFhirBundle } from "../utils/fhirBundle";

// DEMO ONLY: This is a client-side sample FHIR R4 Bundle viewer.
// No FHIR server or ABDM/FHIR API is connected.

/**
 * Modal that displays a FHIR R4 Bundle as formatted JSON and offers a download button.
 * @param {object}   bundle  — FHIR Bundle object
 * @param {string}   studyId — used for the download file name
 * @param {function} onClose — callback to close the modal
 */
export default function FhirBundleModal({ bundle, studyId, onClose }) {
  const overlayRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  const entryCount = bundle?.entry?.length ?? 0;
  const studyResource = bundle?.entry?.[0]?.resource;
  const patientCount = entryCount - 1;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[500] flex items-center justify-center bg-black/50 px-4 py-8 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fhir-modal-title"
    >
      <div className="relative flex w-full max-w-3xl flex-col rounded-[5px] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.2)]" style={{ maxHeight: "90vh" }}>
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#3d9673]">
              AIIA-CTMS / Interoperability
            </p>
            <h2 id="fhir-modal-title" className="mt-1 text-xl font-semibold text-[#17243b]">
              FHIR R4 Bundle
            </h2>
            <p className="mt-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-0.5 inline-block">
              DEMO ONLY — no live FHIR server connected
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close FHIR viewer"
            className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Summary bar */}
        <div className="shrink-0 border-b border-slate-100 bg-slate-50 px-6 py-3 text-sm text-slate-600 flex flex-wrap gap-6">
          <span><span className="font-medium text-slate-800">Bundle type:</span> collection</span>
          <span><span className="font-medium text-slate-800">Entries:</span> {entryCount}</span>
          <span><span className="font-medium text-slate-800">Study:</span> {studyResource?.title ?? "—"}</span>
          <span><span className="font-medium text-slate-800">Patients:</span> {patientCount}</span>
        </div>

        {/* JSON viewer */}
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <pre className="rounded-[5px] bg-[#f8fafc] border border-slate-200 p-4 text-xs leading-relaxed text-slate-700 overflow-x-auto whitespace-pre-wrap break-words">
            {JSON.stringify(bundle, null, 2)}
          </pre>
        </div>

        {/* Footer */}
        <div className="shrink-0 flex flex-wrap gap-3 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={() => downloadFhirBundle(bundle, studyId)}
            className="rounded-lg bg-[#1d5edb] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#174ec0]"
          >
            Export FHIR Bundle (.json)
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
