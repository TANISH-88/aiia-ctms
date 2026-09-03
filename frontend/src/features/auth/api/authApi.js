import { supabase } from "../../../api/supabase.js";

/**
 * Login
 */
export const loginApi = async ({ email, password }) => {
  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * Logout
 */
export const logoutApi = async () => {
  const { error } =
    await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }

  return true;
};