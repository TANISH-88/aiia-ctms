import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../api/supabase";

const ForgetPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to send reset email. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen min-w-0 place-items-center bg-[#edf4fb] px-1 py-8 text-[#16324f] sm:px-5 sm:py-12 md:px-8">
      <section className="w-full min-w-0 max-w-[440px] rounded-[10px] border border-[#dfe7ef] bg-white px-3 py-6 shadow-[0_18px_45px_rgba(19,52,80,0.12)] sm:px-8 sm:py-9">
        <div className="mb-6 border-b border-[#dfe7ef] pb-5 sm:mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#0d9488]">
            AIIA-CTMS
          </p>
          <h1 className="whitespace-nowrap text-[1.75rem] font-semibold leading-none tracking-[-0.03em] text-[#16324f] sm:text-[2rem]">
            Forgot Password
          </h1>
          <p className="mt-3 max-w-[28rem] text-sm leading-6 text-[#5d7187]">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {success ? (
          <div className="rounded-[5px] border border-[#c3e6cb] bg-[#f0fdf4] px-4 py-3">
            <p className="text-sm font-medium text-[#14734c]">
              ✓ Password reset email sent! Check your inbox for the reset link.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid min-w-0 gap-4 sm:gap-5">
            <div className="grid min-w-0 gap-1.5 sm:gap-2">
              <label
                htmlFor="email"
                className="text-xs font-medium text-[var(--text)] sm:text-sm"
              >
                Email
              </label>
              <input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                required
                className="h-10 w-full min-w-0 rounded-[5px] border bg-[#f4f8fb] px-2 text-xs text-[#16324f] outline-none transition focus:bg-white focus:ring-2 focus:ring-[#1f74d8]/20 sm:h-12 sm:px-3 sm:text-sm border-[#dfe7ef] focus:border-[#1f74d8]"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 flex h-10 items-center justify-center gap-2 rounded-[5px] bg-[#1f74d8] px-3 text-xs font-semibold text-white transition hover:bg-[#175eaf] focus:outline-none focus:ring-2 focus:ring-[#1f74d8]/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:h-12 sm:px-4 sm:text-sm"
            >
              {isSubmitting ? (
                <>
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                    aria-hidden="true"
                  />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate("/auth/login")}
              className="text-xs text-[#1f74d8] hover:underline sm:text-sm"
            >
              Back to Login
            </button>
          </form>
        )}
      </section>
    </main>
  );
};

export default ForgetPasswordPage;
