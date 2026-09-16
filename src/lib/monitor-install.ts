/** Public install targets — sideload APK only (no Play Store). */

export function getMonitorInstallPagePath() {
  return "/mobile/install";
}

export function getMonitorInstallDownloadPath() {
  return "/mobile/install/download";
}

const APK_FILENAME = "pinoystock-monitor.apk";

/** Verified release size (arm64 build) — for on-device checks. */
export const MONITOR_APK_BYTES = 44_265_324;

/** Link for the Download button on the install page. */
export function getMonitorApkFileUrl(origin: string) {
  return getMonitorApkDirectUrl(origin);
}

/** Direct static APK URL (one hop — avoids redirect chains on phone browsers). */
export function getMonitorApkDirectUrl(origin: string) {
  const fromEnv = process.env.NEXT_PUBLIC_MONITOR_APK_URL?.trim();
  if (fromEnv) return fromEnv;
  return `${origin}/downloads/${APK_FILENAME}`;
}

/** QR → install page (manual tap — no auto download loop). */
export function getMonitorInstallQrUrl(origin: string) {
  return new URL(getMonitorInstallPagePath(), origin).toString();
}

export function getMonitorPairUrl(origin: string, code: string) {
  const params = new URLSearchParams({ c: code });
  return `${origin}/mobile/pair?${params.toString()}`;
}

export function getMonitorPairDeepLink(code: string, apiOrigin: string) {
  const params = new URLSearchParams({
    c: code,
    api: apiOrigin,
  });
  return `pinoystockmonitor://pair?${params.toString()}`;
}

/** Scanned by Monitor app for passwordless account login. */
export function getMonitorAccountQrValue(accountNumber: string) {
  const params = new URLSearchParams({ n: accountNumber.toUpperCase() });
  return `pinoystockmonitor://login?${params.toString()}`;
}

export { APK_FILENAME };
