/** Public install targets — sideload APK only (no Play Store). */

export function getMonitorInstallPagePath() {
  return "/mobile/install";
}

export function getMonitorInstallDownloadPath() {
  return "/mobile/install/download";
}

const APK_FILENAME = "pinoystock-monitor.apk";

/** Link for the Download button on the install page. */
export function getMonitorApkFileUrl(origin: string) {
  const fromEnv = process.env.NEXT_PUBLIC_MONITOR_APK_URL?.trim();
  if (fromEnv) return fromEnv;
  return `${origin}${getMonitorInstallDownloadPath()}`;
}

/** QR encodes this URL — always a valid app route (no bare /downloads 404). */
export function getMonitorInstallQrUrl(origin: string) {
  const fromEnv = process.env.NEXT_PUBLIC_MONITOR_APK_URL?.trim();
  if (fromEnv) return fromEnv;
  return `${origin}${getMonitorInstallDownloadPath()}`;
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

export { APK_FILENAME };
