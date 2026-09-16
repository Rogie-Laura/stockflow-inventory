import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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

  let body: { code?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const code = body.code?.trim().toUpperCase();
  if (!code || code.length < 6) {
    return new Response(JSON.stringify({ error: "Invalid code" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: pairing, error: fetchError } = await admin
    .from("inv_mobile_pairing")
    .select("id, user_id, expires_at, used_at")
    .eq("code", code)
    .maybeSingle();

  if (fetchError || !pairing) {
    return new Response(JSON.stringify({ error: "Code not found" }), {
      status: 404,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  if (pairing.used_at) {
    return new Response(JSON.stringify({ error: "Code already used" }), {
      status: 410,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  if (new Date(pairing.expires_at as string) < new Date()) {
    return new Response(JSON.stringify({ error: "Code expired" }), {
      status: 410,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const { data: userData, error: userError } =
    await admin.auth.admin.getUserById(pairing.user_id as string);

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

  await admin
    .from("inv_mobile_pairing")
    .update({ used_at: new Date().toISOString() })
    .eq("id", pairing.id);

  return new Response(
    JSON.stringify({ email, token, type: "magiclink" as const }),
    {
      status: 200,
      headers: { ...cors, "Content-Type": "application/json" },
    }
  );
});
