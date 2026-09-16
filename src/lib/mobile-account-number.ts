const ACCOUNT_NUMBER_RE = /^[A-Z0-9]{10}$/;

/** Normalize user input to 10 uppercase alphanumeric chars, or null if invalid. */
export function normalizeMonitorAccountNumber(raw: string): string | null {
  const normalized = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!ACCOUNT_NUMBER_RE.test(normalized)) return null;
  return normalized;
}

export const MONITOR_ACCOUNT_NUMBER_LENGTH = 10;
