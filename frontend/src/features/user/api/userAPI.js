import { supabase } from "../../../api/supabase";

/** Minimum 4 characters (includes 4-digit passwords). */
export const isAcceptablePassword = (password) => {
  return typeof password === "string" && password.length >= 4;
};

export const getPasswordValidationError = (password) => {
  if (!password || password.length < 4) {
    return "Password must be at least 4 characters";
  }
  return null;
};

export const getUserApi = async () => {
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(authError.message);
  }

  if (!authUser) {
    throw new Error("User is not authenticated");
  }

  const { data: rows, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, role, site_id, profile_completed")
    .eq("id", authUser.id)
    .limit(1);

  if (profileError) {
    // Fallback if migration not applied yet — treat as completed when column missing
    if (
      profileError.message?.includes("profile_completed") ||
      profileError.code === "42703"
    ) {
      const { data: legacyRows, error: legacyError } = await supabase
        .from("profiles")
        .select("id, full_name, role, site_id")
        .eq("id", authUser.id)
        .limit(1);

      if (legacyError) {
        throw new Error(legacyError.message);
      }

      const legacyProfile = legacyRows?.[0];
      if (!legacyProfile) {
        throw new Error("Profile not found");
      }

      return {
        ...legacyProfile,
        profile_completed: true,
        email: authUser.email,
      };
    }

    throw new Error(profileError.message);
  }

  const profile = rows?.[0];
  if (!profile) {
    throw new Error("Profile not found");
  }

  return {
    ...profile,
    profile_completed: profile.profile_completed === true,
    email: authUser.email,
  };
};

export const getProfileByIdApi = async (profileId) => {
  const { data: rows, error } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", profileId)
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  const data = rows?.[0];
  if (!data) {
    throw new Error("Profile not found");
  }

  return data;
};

/**
 * First-login setup: set display name + mark profile complete.
 * Never updates id, role, or site_id.
 *
 * Uses complete_profile_setup RPC so PostgREST always gets exactly one JSON object
 * (avoids ".single()" coerce errors when RLS returns 0 updated rows).
 */
export const completeProfileSetupApi = async ({ fullName }) => {
  const trimmed = fullName?.trim();
  if (!trimmed) {
    throw new Error("Display name is required");
  }

  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(authError.message);
  }

  if (!authUser) {
    throw new Error("User is not authenticated");
  }

  // SECURITY DEFINER RPC returns the single updated profile object.
  const { data: rpcData, error: rpcError } = await supabase.rpc(
    "complete_profile_setup",
    { p_full_name: trimmed },
  );

  if (rpcError) {
    throw new Error(rpcError.message);
  }

  const profile = Array.isArray(rpcData) ? rpcData[0] : rpcData;
  if (!profile?.id || profile.profile_completed !== true) {
    throw new Error(
      "Profile setup RPC did not return a completed profile. Apply fix_profile_setup_rpc_migration.sql in Supabase.",
    );
  }

  const { error: metadataError } = await supabase.auth.updateUser({
    data: {
      full_name: trimmed,
      profile_completed: true,
    },
  });

  if (metadataError) {
    throw new Error(metadataError.message);
  }

  return {
    ...profile,
    email: authUser.email,
  };
};

/**
 * Change password after temporary-password login (first-login setup).
 * Minimum length: 4 characters.
 *
 * Supabase Auth remains the source of truth for password-update rules beyond
 * the app's minimum length requirement.
 */
export const updatePasswordApi = async (newPassword) => {
  const passwordError = getPasswordValidationError(newPassword);
  if (passwordError) {
    throw new Error(passwordError);
  }

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/** Update editable profile fields without changing identity or role fields. */
export const updateProfileApi = async ({ fullName, password }) => {
  const trimmed = fullName?.trim();
  if (!trimmed) {
    throw new Error("Display name is required");
  }

  if (password) {
    const passwordError = getPasswordValidationError(password);
    if (passwordError) {
      throw new Error(passwordError);
    }
  }

  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(authError.message);
  }

  if (!authUser) {
    throw new Error("User is not authenticated");
  }

  const { data: rows, error: profileError } = await supabase
    .from("profiles")
    .update({ full_name: trimmed })
    .eq("id", authUser.id)
    .select("id, full_name, role, site_id, profile_completed")
    .limit(1);

  if (profileError) {
    throw new Error(profileError.message);
  }

  const profile = rows?.[0];
  if (!profile) {
    throw new Error("Profile not found");
  }

  const { error: updateAuthError } = await supabase.auth.updateUser({
    ...(password ? { password } : {}),
    data: { full_name: trimmed },
  });

  if (updateAuthError) {
    throw new Error(updateAuthError.message);
  }

  return {
    ...profile,
    email: authUser.email,
  };
};

/** True when the user still owes first-login profile setup. */
export const needsProfileSetup = (profile) => {
  return profile?.profile_completed === false;
};

/** Post-setup landing path by role (permissions unchanged; landing only). */
export const getRoleDashboardPath = (role) => {
  switch (role) {
    case "principal_investigator":
    case "study_coordinator":
    case "ethics_committee":
    case "admin":
    case "monitor":
    case "pharmacovigilance":
    case "regulator_readonly":
    default:
      return "/dashboard";
  }
};
