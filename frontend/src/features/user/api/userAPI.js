import { supabase } from "../../../api/supabase";

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

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, role, site_id")
    .eq("id", authUser.id)
    .single();

  if (profileError) {
    throw new Error(profileError.message);
  }

  return {
    ...profile,
    email: authUser.email,
  };
};