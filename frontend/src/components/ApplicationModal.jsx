import { useEffect, useRef, useState } from "react";
import { supabase } from "../api/supabase";

/**
 * Public trial application modal.
 * Accessible without login — submits to the `applications` table via anon key.
 * RLS on `applications` allows anon inserts (see public_application_form_migration.sql).
 */
export default function ApplicationModal({ onClose }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const overlayRef = useRef(null);
  const firstInputRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Focus first field on open
  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullName.trim() || !email.trim()) {
      setError("Full name and email are required.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const { error: insertError } = await supabase
        .from("applications")
        .insert({
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || null,
          date_of_birth: dateOfBirth || null,
          message: message.trim() || null,
        });

      if (insertError) {
        throw new Error(insertError.message);
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[500] flex items-center justify-center bg-black/50 px-4 py-8 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="application-modal-title"
    >
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[10px] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.2)]">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 rounded-t-[10px] border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#3d9673]">AIIA-CTMS</p>
            <h2 id="application-modal-title" className="mt-1 text-xl font-semibold text-[#17243b]">
              Apply to Participate
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Submit your details and our team will be in touch.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close application form"
            className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {submitted ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#d9f5ee]">
                <svg viewBox="0 0 24 24" fill="none" stroke="#12a57b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
                  <path d="M6.5 12.5L10 16L17.5 8.5" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Application submitted!</h3>
              <p className="text-sm text-slate-500">
                Thank you for your interest. Our team will review your application and contact you at <strong>{email}</strong>.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 rounded-lg bg-[#1d5edb] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#174ec0]"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {error && (
                <p className="mb-5 rounded-[5px] border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  {error}
                </p>
              )}

              <div className="space-y-5">
                <div>
                  <label htmlFor="app-full-name" className="block text-sm font-medium text-slate-900">
                    Full name <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={firstInputRef}
                    id="app-full-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    autoComplete="name"
                    placeholder="Your full legal name"
                    className="mt-2 w-full rounded-[5px] border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1d5edb] focus:outline-none focus:ring-1 focus:ring-[#1d5edb]"
                  />
                </div>

                <div>
                  <label htmlFor="app-email" className="block text-sm font-medium text-slate-900">
                    Email address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="app-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="mt-2 w-full rounded-[5px] border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1d5edb] focus:outline-none focus:ring-1 focus:ring-[#1d5edb]"
                  />
                </div>

                <div>
                  <label htmlFor="app-phone" className="block text-sm font-medium text-slate-900">
                    Phone number <span className="font-normal text-slate-400">(optional)</span>
                  </label>
                  <input
                    id="app-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                    placeholder="+91 98765 43210"
                    className="mt-2 w-full rounded-[5px] border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1d5edb] focus:outline-none focus:ring-1 focus:ring-[#1d5edb]"
                  />
                </div>

                <div>
                  <label htmlFor="app-dob" className="block text-sm font-medium text-slate-900">
                    Date of birth <span className="font-normal text-slate-400">(optional)</span>
                  </label>
                  <input
                    id="app-dob"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="mt-2 w-full rounded-[5px] border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-[#1d5edb] focus:outline-none focus:ring-1 focus:ring-[#1d5edb]"
                  />
                </div>

                <div>
                  <label htmlFor="app-message" className="block text-sm font-medium text-slate-900">
                    Why are you interested? <span className="font-normal text-slate-400">(optional)</span>
                  </label>
                  <textarea
                    id="app-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    placeholder="Tell us a bit about your medical history or reason for applying..."
                    className="mt-2 w-full rounded-[5px] border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1d5edb] focus:outline-none focus:ring-1 focus:ring-[#1d5edb]"
                  />
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-400">
                Your information is kept strictly confidential and will only be used for study participation evaluation.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-[#1d5edb] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#174ec0] disabled:opacity-50"
                >
                  {saving ? "Submitting..." : "Submit Application"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
