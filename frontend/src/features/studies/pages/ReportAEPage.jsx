import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStudyApi } from "../api/studiesAPI.js";
import { createAdverseEventApi } from "../../adverseEvents/api/adverseEventsAPI.js";

export function ReportAEPage() {
  const { id: studyId } = useParams();
  const navigate = useNavigate();
  const [study, setStudy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    subject_id: "",
    description: "",
    onset_date: "",
    severity: "mild",
    is_serious: false,
    meddra_term: "",
    who_drug_term: "",
  });

  useEffect(() => {
    const loadStudy = async () => {
      try {
        setLoading(true);
        const data = await getStudyApi(studyId);
        setStudy(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadStudy();
  }, [studyId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (study.status === "suspended") {
      setError("This study is suspended. Coordinator actions are disabled.");
      return;
    }
    
    if (!formData.subject_id || !formData.description || !formData.onset_date) {
      setError("Subject, description, and onset date are required");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      await createAdverseEventApi({
        study_id: studyId,
        subject_id: formData.subject_id,
        description: formData.description,
        onset_date: formData.onset_date,
        severity: formData.severity,
        is_serious: formData.is_serious,
        meddra_term: formData.meddra_term || null,
        who_drug_term: formData.who_drug_term || null,
      });

      // Success - navigate back to study
      navigate(`/studies/${studyId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fc]">
        <p className="text-sm text-slate-500">Loading study...</p>
      </div>
    );
  }

  if (!study) {
    return (
      <div className="min-h-screen bg-[#f6f8fc] px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[5px] border border-red-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">Study not found</h2>
            <button
              onClick={() => navigate("/clinical-trials")}
              className="mt-5 rounded-lg bg-[#1d5edb] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#174ec0]"
            >
              Back to Clinical Trials
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fc] px-5 py-8 text-[#16233b] sm:px-8 lg:px-10">
      <div className="mx-auto max-w-2xl">
        <div className="border-b border-slate-200 pb-6">
          <button
            onClick={() => navigate(`/studies/${studyId}`)}
            className="mb-4 text-sm text-[#1d5edb] hover:underline"
          >
            ← Back to Study
          </button>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#3d9673]">
            AIIA-CTMS
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[#17243b]">
            Report Adverse Event
          </h1>
          <p className="mt-2 text-sm text-slate-500">Study: {study.title}</p>
        </div>

        <div className="mt-8 rounded-[5px] border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-[5px] border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Subject Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-900">
                Subject *
              </label>
              <select
                name="subject_id"
                value={formData.subject_id}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-[5px] border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-500 focus:border-[#1d5edb] focus:outline-none focus:ring-1 focus:ring-[#1d5edb]"
              >
                <option value="">Select a subject...</option>
                {study.subjects?.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.subject_code} ({subject.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-900">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Describe the adverse event..."
                className="mt-2 w-full rounded-[5px] border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-500 focus:border-[#1d5edb] focus:outline-none focus:ring-1 focus:ring-[#1d5edb]"
              />
            </div>

            {/* Onset Date */}
            <div>
              <label className="block text-sm font-medium text-slate-900">
                Onset Date *
              </label>
              <input
                type="date"
                name="onset_date"
                value={formData.onset_date}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-[5px] border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#1d5edb] focus:outline-none focus:ring-1 focus:ring-[#1d5edb]"
              />
            </div>

            {/* Severity */}
            <div>
              <label className="block text-sm font-medium text-slate-900">
                Severity *
              </label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                className="mt-2 w-full rounded-[5px] border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#1d5edb] focus:outline-none focus:ring-1 focus:ring-[#1d5edb]"
              >
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
            </div>

            {/* Is Serious */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_serious"
                id="is_serious"
                checked={formData.is_serious}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-[#1d5edb] focus:ring-[#1d5edb]"
              />
              <label htmlFor="is_serious" className="ml-2 text-sm text-slate-900">
                Serious Adverse Event (SAE)
              </label>
            </div>

            {/* MedDRA Term */}
            <div>
              <label className="block text-sm font-medium text-slate-900">
                MedDRA Term
              </label>
              <input
                type="text"
                name="meddra_term"
                value={formData.meddra_term}
                onChange={handleChange}
                placeholder="Optional MedDRA term (can be filled by AI)"
                className="mt-2 w-full rounded-[5px] border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-500 focus:border-[#1d5edb] focus:outline-none focus:ring-1 focus:ring-[#1d5edb]"
              />
            </div>

            {/* WHO Drug Term */}
            <div>
              <label className="block text-sm font-medium text-slate-900">
                WHO Drug Term
              </label>
              <input
                type="text"
                name="who_drug_term"
                value={formData.who_drug_term}
                onChange={handleChange}
                placeholder="Optional WHO drug term"
                className="mt-2 w-full rounded-[5px] border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-500 focus:border-[#1d5edb] focus:outline-none focus:ring-1 focus:ring-[#1d5edb]"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting || study.status === "suspended"}
                className="rounded-lg bg-[#1d5edb] px-6 py-2 text-sm font-medium text-white transition hover:bg-[#174ec0] disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Report Adverse Event"}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/studies/${studyId}`)}
                className="rounded-lg border border-slate-300 bg-white px-6 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ReportAEPage;
