import { useEffect } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import { useUser } from "../hooks/useUser";

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

  if (!authInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fc]">
        <p className="text-sm text-slate-500">
          Loading...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fc]">
        <p className="text-sm text-slate-500">
          Please login to view your profile.
        </p>
      </div>
    );
  }

  if (loading && !userData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fc]">
        <p className="text-sm text-slate-500">
          Loading profile...
        </p>
      </div>
    );
  }

  if (error && !userData) {
    return (
      <div className="min-h-screen bg-[#f6f8fc] px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[5px] border border-red-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Unable to load profile
            </h2>

            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() => loadUser()}
              className="mt-5 rounded-lg bg-[#1d5edb] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#174ec0]"
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
    <div className="min-h-screen bg-[#f6f8fc] text-[#17243b]">
      {/* Page Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <h1 className="text-[28px] font-semibold tracking-[-0.04em]">
            My Profile
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View your account and profile information
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* Profile Card */}
        <section className="overflow-hidden rounded-[5px] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
          {/* Profile Top */}
          <div className="border-b border-slate-200 px-7 py-7">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#eaf5ef] text-xl font-semibold text-[#299b6a]">
                {getInitials(
                  userData.full_name ||
                    userData.email ||
                    "User",
                )}
              </div>

              <div>
                <h2 className="text-xl font-semibold text-[#17243b]">
                  {userData.full_name || "User"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {userData.email}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="px-7 py-7">
            <h3 className="text-base font-semibold text-[#17243b]">
              Profile Information
            </h3>

            <div className="mt-6 grid gap-x-10 gap-y-6 md:grid-cols-2">
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
                label="Role"
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
                label="User ID"
                value={userData.id}
                fullWidth
              />
            </div>
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

      <div className="mt-2 rounded-[5px] border border-slate-200 bg-[#fbfcfe] px-4 py-3">
        <p className="break-all text-sm font-medium text-[#17243b]">
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