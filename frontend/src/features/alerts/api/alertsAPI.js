import { supabase } from "../../../api/supabase";

/**
 * Get active alerts
 * Per BACKEND_SPEC.md: select * from study_alerts
 * Returns: {study_id, alert_type, message, severity, due_at}
 */
export const getAlertsApi = async () => {
  const { data, error } = await supabase.from("study_alerts").select("*");

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};
