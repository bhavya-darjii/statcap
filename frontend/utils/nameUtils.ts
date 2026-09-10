/**
 * Extracts the first name from a full name string, skipping common
 * salutations and titles (Dr., Mr., Mrs., Prof., etc.)
 *
 * Examples:
 *   "Dr. Bhavya Darji"  → "Bhavya"
 *   "Prof. Rajan Kumar" → "Rajan"
 *   "Bhavya Darji"      → "Bhavya"
 *   "Dr."               → "User" (fallback)
 */
const SALUTATIONS = new Set([
  'dr', 'mr', 'mrs', 'ms', 'miss', 'prof', 'professor',
  'sr', 'jr', 'shri', 'smt', 'km', 'adv', 'er', 'ir',
  'col', 'maj', 'lt', 'capt', 'cmdr', 'brig', 'gen',
  'rev', 'hon', 'drs',
]);

export const extractFirstName = (
  fullName: string | null | undefined,
  fallback = 'User',
): string => {
  if (!fullName || !fullName.trim()) return fallback;

  // Split on whitespace, filter empty tokens
  const parts = fullName.trim().split(/\s+/);

  for (const part of parts) {
    // Strip trailing period and lowercase for comparison
    const cleaned = part.replace(/\.$/, '').toLowerCase();
    if (!SALUTATIONS.has(cleaned) && cleaned.length > 0) {
      // Return the original casing of this part (minus any trailing period)
      return part.replace(/\.$/, '');
    }
  }

  return fallback;
};
