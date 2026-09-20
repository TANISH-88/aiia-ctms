// delete-test-users.mjs
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing.");
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const USER_IDS = [
  "1bfc243e-78b9-4460-9ea8-7997358c7267",
  "0b65e160-a1d2-4fcd-abe1-84873f25fc39",
  "804c3cda-8729-462c-8daf-d27a30413297",
  "f7f3c0c4-6765-4ded-a6f6-7d73692e78ba",
  "b87c1f5b-e4df-40bf-9da7-82cff166f195",
  "49bb2f80-6fd0-40f5-8164-197615237cc9",
  "c7bd00b7-9ab3-4c00-b304-f55b8d4e2394",
  "d63dd00c-2ad1-4135-8079-bbab8b1bad32",
  "eb9ab2fc-a9dd-4f55-8470-b3b98755bfb8",
  "03ed9fdf-c226-4574-835a-71736030514b",
  "81168994-3fcc-4024-8bf6-3a0beb51bb69",
  "dc5c3b24-7411-483d-b69d-b8d24b36427c",
  "a3319489-5e57-4f64-a1be-b85a5642f6d7",
  "d32e2c56-cd61-456d-aa26-1d251be8830b",
  "439cda93-2e41-488f-bc0b-4e13c8fa5c4a",
  "73b3e6e9-50af-4a82-8afd-b19b647d4fa8",
  "b0d622ca-271d-4a5f-a013-8ac5ebc1e2eb",
  "cad00ccc-18d4-4c0c-8260-0ce30cb1013d",
  "c93e5f15-0810-4ae6-9672-01c619039a0f",
  "984a34db-a787-4cac-86b9-bff868f5c2ee",
  "680ab900-d245-4427-8bf9-7d6ff0678901",
  "a7342feb-e938-4f08-94c3-686d8fe8ec41",
  "690d6827-2a0b-46c8-a812-0d7a08cf23f4",
  "e26d993a-bbed-451a-bb1f-1f3eaac235d7",
  "917e8401-cccf-45b1-b7fd-03d089264af0",
  "5a18993a-6726-4543-bdb3-e9b28ef850f0",
  "a27d5839-16cd-4c63-9720-234d768962f6",
];

console.log(`Deleting ${USER_IDS.length} test users...`);

for (const userId of USER_IDS) {
  const { error } = await supabase.auth.admin.deleteUser(userId, false);

  if (error) {
    console.error(`FAILED: ${userId} -> ${error.message}`);
  } else {
    console.log(`DELETED: ${userId}`);
  }
}

console.log("Cleanup finished.");
