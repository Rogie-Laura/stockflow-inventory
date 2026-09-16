import { NextResponse } from "next/server";

const APK_FILENAME = "pinoystock-monitor.apk";

/**
 * Scan target for Install QR — never returns Next.js 404 JSON/HTML for missing routes.
 * Redirects to hosted APK or the install help page.
 */
export async function GET(request: Request) {
  const envApk = process.env.NEXT_PUBLIC_MONITOR_APK_URL?.trim();
  if (envApk) {
    return NextResponse.redirect(envApk, 302);
  }

  const url = new URL(request.url);
  const staticApk = new URL(`/downloads/${APK_FILENAME}`, url.origin);

  try {
    const head = await fetch(staticApk, { method: "HEAD" });
    if (head.ok) {
      return NextResponse.redirect(staticApk, 302);
    }
  } catch {
    // fall through
  }

  const install = new URL("/mobile/install", url.origin);
  install.searchParams.set("apk", "missing");
  return NextResponse.redirect(install, 302);
}
