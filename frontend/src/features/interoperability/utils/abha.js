// DEMO ONLY: ABHA/ABDM linkage is visual placeholder data; no ABDM service is connected.
// The ABHA ID shown is deterministically derived from the subject UUID so it does not
// change between renders. It is never stored in Supabase or sent to any external service.

/**
 * Derives a deterministic 14-digit demo ABHA ID from a subject UUID.
 *
 * Format: XX-XXXX-XXXX-XXXX (14 digits, hyphen-separated as ABDM displays them)
 *
 * The algorithm takes the numeric characters from the UUID and pads/truncates
 * to exactly 14 digits, then formats them. This is entirely deterministic and
 * reproducible for the same subject ID.
 *
 * @param {string} subjectId — subject UUID from Supabase
 * @returns {string} — e.g. "12-3456-7890-1234"
 */
// DEMO ONLY: Deterministic synthetic ABHA-style ID.
// No real ABHA/ABDM identifier is generated or validated.
// DEMO ONLY: Generates a deterministic synthetic ABHA-style ID.
// This is not a real ABHA number and does not call ABDM.
export function getDemoAbhaId(subjectCode) {
  const input = String(subjectCode ?? "");
  let hash = 0;

  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }

  // Convert the 32-bit hash into a 14-digit synthetic number.
  const digits = String(hash).padStart(14, "0");

  return [
    digits.slice(0, 2),
    digits.slice(2, 6),
    digits.slice(6, 10),
    digits.slice(10, 14),
  ].join("-");
}