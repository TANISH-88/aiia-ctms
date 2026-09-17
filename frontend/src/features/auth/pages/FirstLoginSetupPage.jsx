import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";
import { useUser } from "../../user/hooks/useUser";
import {
  completeProfileSetupApi,
  getPasswordValidationError,
  getRoleDashboardPath,
  updatePasswordApi,
} from "../../user/api/userAPI";

function formatRole(role) {
  if (!role) return "Assigned role";
  return role
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/**
 * Required first-login setup for admin-provisioned accounts.
 * User sets display name + new password only.
 * User ID (email) and role are read-only.
 */
export default function FirstLoginSetupPage() {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const { user: profile, loadUser } = useUser();

  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const email = profile?.email || authUser?.email || "";
  const role = profile?.role || "";

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = {};
    if (!displayName.trim()) {
      nextErrors.displayName = "Display name is required";
    }
    const passwordError = getPasswordValidationError(password);
    if (passwordError) {
      nextErrors.password = passwordError;
    }
    if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSaving(true);

    try {
      await updatePasswordApi(password);
      await completeProfileSetupApi({ fullName: displayName });
      await loadUser();
      navigate(getRoleDashboardPath(role), { replace: true });
    } catch (err) {
      setErrors({
        form: err?.message || "Unable to complete profile setup",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f8fc] px-5 py-10 text-[#16233b]">
      <section className="w-full max-w-[520px] rounded-[5px] border border-slate-200 bg-white px-6 py-8 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:px-10 sm:py-9">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#3d9673]">
          AIIA-CTMS
        </p>
        <h1 className="mt-2 text-[1.75rem] font-semibold tracking-[-0.03em] text-[#17243b]">
          Complete your profile
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Your administrator created this account. Set your display name and choose
          a new password to continue. Your User ID and role cannot be changed.
        </p>

        <dl className="mt-6 grid gap-3 rounded-[5px] border border-slate-200 bg-slate-50 p-4 text-sm">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
              User ID (email)
            </dt>
            <dd className="mt-1 break-all font-medium text-slate-800">{email || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Assigned role
            </dt>
            <dd className="mt-1 font-medium text-slate-800">{formatRole(role)}</dd>
          </div>
        </dl>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-5" noValidate>
          <div className="grid gap-2">
            <label htmlFor="displayName" className="text-sm font-medium text-slate-900">
              Display name <span className="text-red-500">*</span>
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoComplete="name"
              required
              placeholder="How you should appear in the system"
              className={`h-12 w-full rounded-[3px] border bg-white px-3 text-sm outline-none transition focus:ring-2 focus:ring-[#1d5edb]/20 ${
                errors.displayName
                  ? "border-red-500"
                  : "border-slate-300 focus:border-[#1d5edb]"
              }`}
            />
            {errors.displayName && (
              <p className="text-xs text-red-600">{errors.displayName}</p>
            )}
          </div>

          <div className="grid gap-2">
            <label htmlFor="newPassword" className="text-sm font-medium text-slate-900">
              New password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                placeholder="At least 4 characters"
                className={`h-12 w-full rounded-[3px] border bg-white py-3 pl-3 pr-12 text-sm outline-none transition focus:ring-2 focus:ring-[#1d5edb]/20 ${
                  errors.password
                    ? "border-red-500"
                    : "border-slate-300 focus:border-[#1d5edb]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400 hover:text-slate-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-600">{errors.password}</p>
            )}
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-slate-900"
            >
              Confirm new password <span className="text-red-500">*</span>
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
              className={`h-12 w-full rounded-[3px] border bg-white px-3 text-sm outline-none transition focus:ring-2 focus:ring-[#1d5edb]/20 ${
                errors.confirmPassword
                  ? "border-red-500"
                  : "border-slate-300 focus:border-[#1d5edb]"
              }`}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}

          <button
            type="submit"
            disabled={saving}
            className="mt-1 flex h-12 items-center justify-center rounded-[3px] bg-[#1d5edb] px-4 text-sm font-semibold text-white transition hover:bg-[#174ec0] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save and continue"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => logout().then(() => navigate("/auth/login", { replace: true }))}
          className="mt-5 w-full text-center text-sm text-slate-500 hover:text-slate-800"
        >
          Sign out
        </button>
      </section>
    </main>
  );
}
