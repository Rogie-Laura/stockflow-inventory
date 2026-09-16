import { NextResponse } from "next/server";

/** Legacy path — never return JSON to the phone browser. */
export async function GET(request: Request) {
  const url =
    process.env.MONITOR_APK_REDIRECT_URL?.trim() ||
    process.env.NEXT_PUBLIC_MONITOR_APK_URL?.trim();

  if (url) {
    return NextResponse.redirect(url, 302);
  }

  const install = new URL("/mobile/install", request.url);
  return NextResponse.redirect(install, 302);
}
