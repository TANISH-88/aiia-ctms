import { supabase } from "../../../api/supabase";

/**
 * Get audit log entries
 * Per BACKEND_SPEC.md: select * from audit_log
 * RLS filters automatically: only admin/regulator_readonly can see
 */
export const getAuditLogApi = async () => {
  const { data, error } = await supabase
    .from("audit_log")
    .select("*")
    .order("changed_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

/**
 * Get audit log for a specific table and record
 */
export const getAuditLogForRecordApi = async (table_name, record_id) => {
  const { data, error } = await supabase
    .from("audit_log")
    .select("*")
    .eq("table_name", table_name)
    .eq("record_id", record_id)
    .order("changed_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};
