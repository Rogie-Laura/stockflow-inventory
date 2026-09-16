/** Public install targets for PinoyStock Monitor (Flutter APK / Play Store). */

export function getMonitorInstallPagePath() {
  return "/mobile/install";
}

export function getMonitorApkUrl(origin?: string) {
  const fromEnv = process.env.NEXT_PUBLIC_MONITOR_APK_URL?.trim();
  if (fromEnv) return fromEnv;
  if (origin) {
    return `${origin}/api/mobile/apk`;
  }
  return "/api/mobile/apk";
}

export function getMonitorPlayStoreUrl() {
  return process.env.NEXT_PUBLIC_MONITOR_PLAY_STORE_URL?.trim() ?? "";
}

export function getMonitorInstallQrUrl(origin: string) {
  return `${origin}${getMonitorInstallPagePath()}?from=monitor-qr`;
}
