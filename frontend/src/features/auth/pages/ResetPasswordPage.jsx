import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../api/supabase";
import { useRecoveryFlow } from "../components/AuthInitializer";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { isRecoveryFlow, clearRecoveryFlow } = useRecoveryFlow();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if we have a valid recovery session
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        setErrors({ form: "Invalid or expired password reset link. Please request a new one." });
        setLoading(false);
        return;
      }

      // Verify this is a recovery flow, not a normal authenticated session
      if (!isRecoveryFlow) {
        setErrors({ form: "This page is only accessible through a password recovery link. Please use the forgot password flow." });
        setLoading(false);
        return;
      }

      setLoading(false);
    };

    checkSession();
  }, [isRecoveryFlow]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const nextErrors = {};

    if (!password) {
      nextErrors.password = "Password is required";
    } else if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters";
    }

    if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        throw error;
      }

      setSuccess(true);
      
      // Clear recovery flow state after successful password reset
      clearRecoveryFlow();
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/auth/login", { replace: true });
      }, 2000);
    } catch (error) {
      setErrors({ form: error.message || "Failed to reset password. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="grid min-h-screen min-w-0 place-items-center bg-[#edf4fb] px-1 py-8 text-[#16324f] sm:px-5 sm:py-12 md:px-8">
        <div className="flex items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#1f74d8]/40 border-t-[#1f74d8]" />
        </div>
      </main>
    );
  }

  // Show error message if session validation failed - do not render form
  if (errors.form && !success) {
    return (
      <main className="grid min-h-screen min-w-0 place-items-center bg-[#edf4fb] px-1 py-8 text-[#16324f] sm:px-5 sm:py-12 md:px-8">
        <section className="w-full min-w-0 max-w-[440px] rounded-[10px] border border-[#dfe7ef] bg-white px-3 py-6 shadow-[0_18px_45px_rgba(19,52,80,0.12)] sm:px-8 sm:py-9">
          <div className="mb-6 border-b border-[#dfe7ef] pb-5 sm:mb-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#0d9488]">
              AIIA-CTMS
            </p>
            <h1 className="whitespace-nowrap text-[1.75rem] font-semibold leading-none tracking-[-0.03em] text-[#16324f] sm:text-[2rem]">
              Password Reset
            </h1>
          </div>
          <div className="rounded-[5px] border border-[#f1c8c2] bg-[#fff5f4] px-4 py-3">
            <p className="text-sm font-medium text-[#9f3f32]">
              {errors.form}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              clearRecoveryFlow();
              navigate("/auth/forget-password");
            }}
            className="mt-4 text-xs text-[#1f74d8] hover:underline sm:text-sm"
          >
            Request a new reset link
          </button>
        </section>
      </main>
    );
  }

  if (success) {
    return (
      <main className="grid min-h-screen min-w-0 place-items-center bg-[#edf4fb] px-1 py-8 text-[#16324f] sm:px-5 sm:py-12 md:px-8">
        <section className="w-full min-w-0 max-w-[440px] rounded-[10px] border border-[#dfe7ef] bg-white px-3 py-6 shadow-[0_18px_45px_rgba(19,52,80,0.12)] sm:px-8 sm:py-9">
          <div className="mb-6 border-b border-[#dfe7ef] pb-5 sm:mb-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#0d9488]">
              AIIA-CTMS
            </p>
            <h1 className="whitespace-nowrap text-[1.75rem] font-semibold leading-none tracking-[-0.03em] text-[#16324f] sm:text-[2rem]">
              Password Reset
            </h1>
          </div>
          <div className="rounded-[5px] border border-[#c3e6cb] bg-[#f0fdf4] px-4 py-3">
            <p className="text-sm font-medium text-[#14734c]">
              ✓ Password reset successful! Redirecting to login...
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen min-w-0 place-items-center bg-[#edf4fb] px-1 py-8 text-[#16324f] sm:px-5 sm:py-12 md:px-8">
      <section className="w-full min-w-0 max-w-[440px] rounded-[10px] border border-[#dfe7ef] bg-white px-3 py-6 shadow-[0_18px_45px_rgba(19,52,80,0.12)] sm:px-8 sm:py-9">
        <div className="mb-6 border-b border-[#dfe7ef] pb-5 sm:mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#0d9488]">
            AIIA-CTMS
          </p>
          <h1 className="whitespace-nowrap text-[1.75rem] font-semibold leading-none tracking-[-0.03em] text-[#16324f] sm:text-[2rem]">
            Reset Password
          </h1>
          <p className="mt-3 max-w-[28rem] text-sm leading-6 text-[#5d7187]">
            Enter your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid min-w-0 gap-4 sm:gap-5">
          <div className="grid min-w-0 gap-1.5 sm:gap-2">
            <label
              htmlFor="password"
              className="text-xs font-medium text-[var(--text)] sm:text-sm"
            >
              New Password
            </label>
            <input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Enter new password"
              required
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
              className={`h-10 w-full min-w-0 rounded-[5px] border bg-[#f4f8fb] px-2 text-xs text-[#16324f] outline-none transition focus:bg-white focus:ring-2 focus:ring-[#1f74d8]/20 sm:h-12 sm:px-3 sm:text-sm ${errors.password ? "border-red-500" : "border-[#dfe7ef] focus:border-[#1f74d8]"}`}
            />
            {errors.password && (
              <p id="password-error" className="text-xs text-red-600">
                {errors.password}
              </p>
            )}
          </div>

          <div className="grid min-w-0 gap-1.5 sm:gap-2">
            <label
              htmlFor="confirmPassword"
              className="text-xs font-medium text-[var(--text)] sm:text-sm"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              placeholder="Confirm new password"
              required
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
              className={`h-10 w-full min-w-0 rounded-[5px] border bg-[#f4f8fb] px-2 text-xs text-[#16324f] outline-none transition focus:bg-white focus:ring-2 focus:ring-[#1f74d8]/20 sm:h-12 sm:px-3 sm:text-sm ${errors.confirmPassword ? "border-red-500" : "border-[#dfe7ef] focus:border-[#1f74d8]"}`}
            />
            {errors.confirmPassword && (
              <p id="confirm-password-error" className="text-xs text-red-600">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}

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
                Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      </section>
    </main>
  );
}
