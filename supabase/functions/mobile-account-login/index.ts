import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function normalizeAccountNumber(raw: string): string | null {
  const n = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!/^[A-Z0-9]{10}$/.test(n)) return null;
  return n;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: "Server not configured" }), {
      status: 503,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  let body: { accountNumber?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const accountNumber = normalizeAccountNumber(body.accountNumber ?? "");
  if (!accountNumber) {
    return new Response(
      JSON.stringify({ error: "Account number must be 10 letters and numbers" }),
      {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      }
    );
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: profile, error: profileError } = await admin
    .from("inv_profile")
    .select("id")
    .eq("account_number", accountNumber)
    .maybeSingle();

  if (profileError || !profile) {
    return new Response(JSON.stringify({ error: "Invalid account number" }), {
      status: 404,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const { data: membership, error: memberError } = await admin
    .from("inv_store_member")
    .select("role")
    .eq("user_id", profile.id)
    .in("role", ["store_admin", "supervisor"])
    .limit(1)
    .maybeSingle();

  if (memberError || !membership) {
    return new Response(
      JSON.stringify({ error: "Account not allowed for Monitor app" }),
      {
        status: 403,
        headers: { ...cors, "Content-Type": "application/json" },
      }
    );
  }

  const { data: userData, error: userError } =
    await admin.auth.admin.getUserById(profile.id);

  if (userError || !userData.user.email) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const email = userData.user.email;

  const { data: linkData, error: linkError } =
    await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

  const token = linkData?.properties?.hashed_token;
  if (linkError || !token) {
    return new Response(
      JSON.stringify({ error: linkError?.message ?? "Could not create session" }),
      {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" },
      }
    );
  }

  return new Response(
    JSON.stringify({ email, token, type: "magiclink" as const }),
    {
      status: 200,
      headers: { ...cors, "Content-Type": "application/json" },
    }
  );
});
