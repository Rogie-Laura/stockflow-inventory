import { NextResponse } from "next/server";

/**
 * Redirects to the hosted APK. Set MONITOR_APK_REDIRECT_URL on Vercel
 * (same as NEXT_PUBLIC_MONITOR_APK_URL or a Supabase Storage public URL).
 */
export async function GET() {
  const url =
    process.env.MONITOR_APK_REDIRECT_URL?.trim() ||
    process.env.NEXT_PUBLIC_MONITOR_APK_URL?.trim();

  if (!url) {
    return NextResponse.json(
      {
        error: "APK not published yet",
        hint: "Upload release APK and set NEXT_PUBLIC_MONITOR_APK_URL or MONITOR_APK_REDIRECT_URL on Vercel.",
      },
      { status: 404 }
    );
  }

  return NextResponse.redirect(url, 302);
}
