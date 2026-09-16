import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Pairing not configured (missing SUPABASE_SERVICE_ROLE_KEY)" },
      { status: 503 }
    );
  }

  let body: { code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const code = body.code?.trim().toUpperCase();
  if (!code || code.length < 6) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  const { data: pairing, error: fetchError } = await admin
    .from("inv_mobile_pairing")
    .select("id, user_id, expires_at, used_at")
    .eq("code", code)
    .maybeSingle();

  if (fetchError || !pairing) {
    return NextResponse.json({ error: "Code not found" }, { status: 404 });
  }

  if (pairing.used_at) {
    return NextResponse.json({ error: "Code already used" }, { status: 410 });
  }

  if (new Date(pairing.expires_at) < new Date()) {
    return NextResponse.json({ error: "Code expired" }, { status: 410 });
  }

  const { data: userData, error: userError } =
    await admin.auth.admin.getUserById(pairing.user_id);

  if (userError || !userData.user.email) {
    return NextResponse.json({ error: "User not found" }, { status: 500 });
  }

  const email = userData.user.email;

  const { data: linkData, error: linkError } =
    await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

  if (linkError || !linkData.properties) {
    return NextResponse.json(
      { error: linkError?.message ?? "Could not create session" },
      { status: 500 }
    );
  }

  const hashedToken = linkData.properties.hashed_token;
  if (!hashedToken) {
    return NextResponse.json({ error: "Missing token" }, { status: 500 });
  }

  await admin
    .from("inv_mobile_pairing")
    .update({ used_at: new Date().toISOString() })
    .eq("id", pairing.id);

  return NextResponse.json({
    email,
    token: hashedToken,
    type: "magiclink" as const,
  });
}
