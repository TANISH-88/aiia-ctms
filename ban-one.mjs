import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const userId = "a3319489-5e57-4f64-a1be-b85a5642f6d7";

const { data, error } =
  await supabase.auth.admin.updateUserById(userId, {
    ban_duration: "876000h"
  });

if (error) {
  console.error("FAILED:", error.message);
} else {
  console.log("BANNED:", data.user?.email);
}
