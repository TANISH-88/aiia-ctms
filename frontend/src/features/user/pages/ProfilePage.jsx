import { useEffect, useState } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import { useUser } from "../hooks/useUser";
import { getPasswordValidationError, updateProfileApi } from "../api/userAPI";

export function ProfilePage() {
  const {
    user: userData,
    loading,
    error,
    loadUser,
  } = useUser();

  const {
    isAuthenticated,
    initialized: authInitialized,
  } = useAuth();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authInitialized || !isAuthenticated) {
      return;
    }

    if (!userData) {
      loadUser().catch((error) => {
        console.error("User load error:", error);
      });
    }
  }, [
    authInitialized,
    isAuthenticated,
    userData,
    loadUser,
  ]);

  const startEditing = () => {
    setFullName(userData.full_name || "");
    setPassword("");
    setConfirmPassword("");
    setFormError("");
    setSaved(false);
    setEditing(true);
  };

  const cancelEditing = () => {
    setFormError("");
    setEditing(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    setSaved(false);

    if (password && password !== confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }

    if (password) {
      const passwordError = getPasswordValidationError(password);
      if (passwordError) {
        setFormError(passwordError);
        return;
      }
    }

    setSaving(true);
    try {
      await updateProfileApi({ fullName, password });
      await loadUser();
      setPassword("");
      setConfirmPassword("");
      setEditing(false);
      setSaved(true);
    } catch (error) {
      setFormError(error?.message || "Unable to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (!authInitialized) {
    return (
      <div className="min-h-screen min-w-0 bg-[#f4f8fb] px-4 py-6 sm:px-8 sm:py-8 lg:px-10">
        <div className="mx-auto max-w-5xl border-b border-[#dfe7ef] pb-6">
          <div className="h-3 w-24 animate-pulse rounded bg-[#dfe7ef]" />
          <div className="mt-3 h-8 w-48 animate-pulse rounded bg-[#dfe7ef]" />
          <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-[#dfe7ef]" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen min-w-0 items-center justify-center bg-[#f4f8fb] px-4 text-center text-sm text-[#5d7187]">
        Please login to view your profile.
      </div>
    );
  }

  if (loading && !userData) {
    return (
      <div className="min-h-screen bg-[#f4f8fb] px-6 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="h-24 animate-pulse border-b border-[#dfe7ef] bg-white" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2"><div className="h-20 animate-pulse border-b border-[#dfe7ef] bg-white" /><div className="h-20 animate-pulse border-b border-[#dfe7ef] bg-white" /></div>
        </div>
      </div>
    );
  }

  if (error && !userData) {
    return (
      <div className="min-h-screen min-w-0 bg-[#f4f8fb] px-4 py-8 sm:px-8 sm:py-10 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="border-l-4 border-[#c65345] bg-white px-5 py-5 shadow-[0_8px_24px_rgba(19,52,80,0.06)]">
            <h2 className="text-base font-semibold text-[#16324f]">
              Unable to load profile
            </h2>

            <p className="mt-2 text-sm text-[#a43d31]">{error}</p>

            <button
              type="button"
              onClick={() => loadUser()}
              className="mt-5 cursor-pointer rounded-[5px] bg-[#1f74d8] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#145db5]"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className="min-h-screen min-w-0 overflow-x-hidden bg-[#f4f8fb] text-[#16324f]">
      {/* Page Header */}
      <div className="border-b border-[#dfe7ef] bg-white">
        <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-8 sm:py-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0d9488]">AIIA-CTMS / Account</p>
          <h1 className="mt-1 text-[26px] font-semibold tracking-[-0.03em]">
            My Profile
          </h1>
        </div>
      </div>

      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-8 sm:py-8">
        {/* Profile Card */}
        <section className="w-full min-w-0 overflow-hidden border-y border-[#dfe7ef] bg-white">
          {/* Profile Top */}
          <div className="border-b border-[#dfe7ef] bg-[#fbfcfe] px-4 py-6 sm:px-8 sm:py-7">
            <div className="flex min-w-0 flex-col items-start justify-between gap-4 sm:flex-row sm:items-center sm:gap-5">
              <div className="flex min-w-0 items-center gap-4 sm:gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#dff4ef] text-lg font-semibold text-[#0d7559] sm:h-14 sm:w-14">
                {getInitials(
                  userData.full_name ||
                    userData.email ||
                    "User",
                )}
              </div>

              <div className="min-w-0">
                <h2 className="break-words text-lg font-semibold text-[#16324f]">
                  {userData.full_name || "User"}
                </h2>

                <p className="mt-1 break-all text-sm text-slate-500">
                  {userData.email}
                </p>
              </div>
              </div>
              {!editing && (
                <button
                  type="button"
                  onClick={startEditing}
                  className="w-full cursor-pointer rounded-[5px] border border-[#1f74d8] px-4 py-2 text-sm font-semibold text-[#1f74d8] transition hover:bg-[#e6f2ff] active:bg-[#dcecff] sm:w-auto"
                >
                  Edit profile
                </button>
              )}
            </div>
          </div>

          {/* Profile Information */}
          <div className="px-4 py-6 sm:px-8 sm:py-7">
            <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-4">
              <h3 className="text-base font-semibold text-[#17243b]">
                Profile Information
              </h3>
              {saved && <p className="text-sm text-[#299b6a]">Profile updated</p>}
            </div>

            {editing ? (
              <form onSubmit={handleSubmit} className="mt-6 grid w-full max-w-xl gap-5">
                <label className="grid gap-2 text-sm font-medium text-slate-900">
                  Full name
                  <input
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    autoComplete="name"
                    className="h-12 w-full min-w-0 rounded-[3px] border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-[#1d5edb] focus:ring-2 focus:ring-[#1d5edb]/20"
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-slate-900">
                  New password
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="new-password"
                    placeholder="Leave blank to keep your password"
                    className="h-12 w-full min-w-0 rounded-[3px] border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-[#1d5edb] focus:ring-2 focus:ring-[#1d5edb]/20"
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-slate-900">
                  Confirm new password
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    autoComplete="new-password"
                    className="h-12 w-full min-w-0 rounded-[3px] border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-[#1d5edb] focus:ring-2 focus:ring-[#1d5edb]/20"
                  />
                </label>

                {formError && <p className="text-sm text-red-600">{formError}</p>}

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="cursor-pointer rounded-[5px] bg-[#1f74d8] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#145db5] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    disabled={saving}
                    className="cursor-pointer rounded-[5px] border border-[#cfdbe7] px-4 py-2 text-sm font-semibold text-[#53657d] transition hover:bg-[#f8fbfe] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
            <div className="mt-6 grid min-w-0 gap-x-10 gap-y-6 md:grid-cols-2">
              {/* Full Name */}
              <ProfileField
                label="Full Name"
                value={
                  userData.full_name || "Not provided"
                }
              />

              {/* Email */}
              <ProfileField
                label="Email"
                value={
                  userData.email || "Not available"
                }
              />

              {/* Role */}
              <ProfileField
                label="Role (read-only)"
                value={
                  formatRole(userData.role) ||
                  "Not assigned"
                }
              />

              {/* Site */}
              <ProfileField
                label="Site ID"
                value={
                  userData.site_id || "Not assigned"
                }
              />

              {/* User ID */}
              <ProfileField
                label="User ID (read-only)"
                value={userData.id}
                fullWidth
              />
            </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function ProfileField({
  label,
  value,
  fullWidth = false,
}) {
  return (
    <div
      className={
        fullWidth ? "md:col-span-2" : ""
      }
    >
      <p className="text-xs font-medium uppercase tracking-[0.06em] text-slate-400">
        {label}
      </p>

      <div className="mt-2 border-b border-[#dfe7ef] px-0 py-3">
        <p className="break-all text-sm font-medium text-[#16324f]">
          {value}
        </p>
      </div>
    </div>
  );
}

function getInitials(name) {
  if (!name) {
    return "U";
  }

  if (name.includes("@")) {
    return name.substring(0, 2).toUpperCase();
  }

  const parts = name.trim().split(/\s+/);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return name.substring(0, 2).toUpperCase();
}

function formatRole(role) {
  if (!role) {
    return "";
  }

  return role
    .split("_")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1),
    )
    .join(" ");
}

export default ProfilePage;