import { supabase } from "../../../api/supabase";

export const getDashboardApi = async () => {
  const { data, error } = await supabase
    .from("study_kpis")
    .select("*");

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
};