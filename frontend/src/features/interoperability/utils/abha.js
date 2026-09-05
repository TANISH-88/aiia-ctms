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
export function getDemoAbhaId(subjectId) {
  // Extract all hex digits from the UUID and convert to decimal-ish numeric sequence
  const hex = subjectId.replace(/-/g, "");
  // Use character codes to get a stable numeric string
  let numeric = "";
  for (let i = 0; i < hex.length && numeric.length < 14; i++) {
    const charCode = hex.charCodeAt(i);
    // Map each char to a single digit: (charCode mod 10)
    numeric += charCode % 10;
  }
  // Ensure exactly 14 digits (pad with zeros if needed)
  const digits = numeric.padEnd(14, "0").slice(0, 14);
  // Format: XX-XXXX-XXXX-XXXX
  return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}-${digits.slice(10, 14)}`;
}
