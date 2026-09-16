/** Public install targets — sideload APK only (no Play Store). */

export function getMonitorInstallPagePath() {
  return "/mobile/install";
}

export function getMonitorInstallDownloadPath() {
  return "/mobile/install/download";
}

const APK_FILENAME = "pinoystock-monitor.apk";

/** Bump when replacing public/downloads APK (cache bust on phones). */
export const MONITOR_APK_VERSION = "1.0.1";

/** Verified release size (arm64 build) — for on-device checks. */
export const MONITOR_APK_BYTES = 22_039_867;

/** Opens installed app from browser (launcher shortcut). */
export const MONITOR_APP_OPEN_URL = "pinoystockmonitor://open";

/** Link for the Download button on the install page. */
export function getMonitorApkFileUrl(origin: string) {
  return getMonitorApkDirectUrl(origin);
}

/** Direct static APK URL (one hop — avoids redirect chains on phone browsers). */
export function getMonitorApkDirectUrl(origin: string) {
  const fromEnv = process.env.NEXT_PUBLIC_MONITOR_APK_URL?.trim();
  const url = fromEnv
    ? new URL(fromEnv)
    : new URL(
        `/downloads/${APK_FILENAME}`,
        origin.replace(/\/+$/, "") + "/"
      );
  url.searchParams.set("v", MONITOR_APK_VERSION);
  return url.toString();
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
