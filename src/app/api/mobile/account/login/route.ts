import { NextResponse } from "next/server";
import { normalizeMonitorAccountNumber } from "@/lib/mobile-account-number";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Mobile login not configured (missing SUPABASE_SERVICE_ROLE_KEY)" },
      { status: 503 }
    );
  }

  let body: { accountNumber?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const accountNumber = normalizeMonitorAccountNumber(body.accountNumber ?? "");
  if (!accountNumber) {
    return NextResponse.json(
      { error: "Account number must be 10 letters and numbers" },
      { status: 400 }
    );
  }

  const { data: profile, error: profileError } = await admin
    .from("inv_profile")
    .select("id")
    .eq("account_number", accountNumber)
    .maybeSingle();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Invalid account number" }, { status: 404 });
  }

  const { data: membership, error: memberError } = await admin
    .from("inv_store_member")
    .select("role")
    .eq("user_id", profile.id)
    .in("role", ["store_admin", "supervisor"])
    .limit(1)
    .maybeSingle();

  if (memberError || !membership) {
    return NextResponse.json(
      { error: "Account not allowed for Monitor app" },
      { status: 403 }
    );
  }

  const { data: userData, error: userError } = await admin.auth.admin.getUserById(
    profile.id
  );

  if (userError || !userData.user.email) {
    return NextResponse.json({ error: "User not found" }, { status: 500 });
  }

  const email = userData.user.email;

  const { data: linkData, error: linkError } =
    await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

  if (linkError || !linkData.properties?.hashed_token) {
    return NextResponse.json(
      { error: linkError?.message ?? "Could not create session" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    email,
    token: linkData.properties.hashed_token,
    type: "magiclink" as const,
  });
}
