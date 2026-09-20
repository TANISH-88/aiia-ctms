import { useEffect, useRef, useState } from "react";
import { supabase } from "../api/supabase";

/**
 * Public trial participant-interest form.
 * Accessible without login — submits to the `participant_interest` table via anon key.
 * RLS on `participant_interest` allows anon inserts (see phase23_participant_interest_migration.sql).
 */
export default function ApplicationModal({ onClose, inline = false }) {
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
      if (!inline && e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [inline, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (inline) return undefined;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [inline]);

  // Focus first field on open
  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const handleOverlayClick = (e) => {
    if (!inline && e.target === overlayRef.current) onClose();
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
        .from("participant_interest")
        .insert({
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || null,
          date_of_birth: dateOfBirth || null,
          condition_or_interest: message.trim() || null,
          study_id: null,
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
      className={
        inline
          ? "min-h-[calc(100vh-88px)] w-full px-4 py-12"
          : "fixed inset-0 z-[500] flex items-center justify-center bg-black/50 px-4 py-8 backdrop-blur-sm"
      }
      role={inline ? undefined : "dialog"}
      aria-modal={inline ? undefined : "true"}
      aria-labelledby="application-modal-title"
    >
      <div
        className={
          inline
            ? "relative mx-auto w-full max-w-3xl"
            : "relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[10px] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.2)]"
        }
      >
        {/* Header */}
        <div
          className={
            inline
              ? "flex items-start justify-between gap-4 border-b border-[#dfe7ef] px-0 py-6"
              : "sticky top-0 z-10 flex items-start justify-between gap-4 rounded-t-[10px] border-b border-slate-200 bg-white px-6 py-5"
          }
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0d9488]">
              AIIA-CTMS
            </p>
            <h2
              id="application-modal-title"
              className="mt-1 text-xl font-semibold text-[#16324f]"
            >
              Apply to Participate
            </h2>
            <p className="mt-1 text-sm text-[#5d7187]">
              Submit your details and our team will be in touch.
            </p>
          </div>
          {!inline && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close application form"
              className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Body */}
        <div className={inline ? "px-0 py-6" : "px-6 py-6"}>
          {submitted ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#d9f5ee]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#12a57b"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-7 w-7"
                  aria-hidden="true"
                >
                  <path d="M6.5 12.5L10 16L17.5 8.5" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                Application submitted!
              </h3>
              <p className="text-sm text-slate-500">
                Thank you for your interest. Our team will review your
                application and contact you at <strong>{email}</strong>.
              </p>
              {!inline && (
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-2 rounded-lg bg-[#1d5edb] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#174ec0]"
                >
                  Close
                </button>
              )}
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
                  <label
                    htmlFor="app-full-name"
                    className="block text-sm font-medium text-slate-900"
                  >
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
                    className="mt-2 w-full rounded-[5px] border border-[#dfe7ef] bg-[#f4f8fb] px-3 py-2.5 text-sm text-[#16324f] placeholder:text-[#5d7187] focus:border-[#1f74d8] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1f74d8]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="app-email"
                    className="block text-sm font-medium text-slate-900"
                  >
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
                    className="mt-2 w-full rounded-[5px] border border-[#dfe7ef] bg-[#f4f8fb] px-3 py-2.5 text-sm text-[#16324f] placeholder:text-[#5d7187] focus:border-[#1f74d8] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1f74d8]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="app-phone"
                    className="block text-sm font-medium text-slate-900"
                  >
                    Phone number{" "}
                    <span className="font-normal text-slate-400">
                      (optional)
                    </span>
                  </label>
                  <input
                    id="app-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                    placeholder="+91 98765 43210"
                    className="mt-2 w-full rounded-[5px] border border-[#dfe7ef] bg-[#f4f8fb] px-3 py-2.5 text-sm text-[#16324f] placeholder:text-[#5d7187] focus:border-[#1f74d8] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1f74d8]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="app-dob"
                    className="block text-sm font-medium text-slate-900"
                  >
                    Date of birth{" "}
                    <span className="font-normal text-slate-400">
                      (optional)
                    </span>
                  </label>
                  <input
                    id="app-dob"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="mt-2 w-full rounded-[5px] border border-[#dfe7ef] bg-[#f4f8fb] px-3 py-2.5 text-sm text-[#16324f] focus:border-[#1f74d8] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1f74d8]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="app-message"
                    className="block text-sm font-medium text-slate-900"
                  >
                    Why are you interested?{" "}
                    <span className="font-normal text-slate-400">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    id="app-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    placeholder="Tell us a bit about your medical history or reason for applying..."
                    className="mt-2 w-full rounded-[5px] border border-[#dfe7ef] bg-[#f4f8fb] px-3 py-2.5 text-sm text-[#16324f] placeholder:text-[#5d7187] focus:border-[#1f74d8] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1f74d8]"
                  />
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-400">
                Your information is kept strictly confidential and will only be
                used for study participation evaluation.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-[5px] bg-[#1f74d8] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#175eaf] disabled:opacity-50"
                >
                  {saving ? "Submitting..." : "Submit Application"}
                </button>
                {!inline && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
