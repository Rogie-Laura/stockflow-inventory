import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyPaymongoSignature } from "@/lib/paymongo-webhook";

function getAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;

  if (webhookSecret) {
    const signature =
      request.headers.get("paymongo-signature") ??
      request.headers.get("Paymongo-Signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }
    if (!verifyPaymongoSignature(rawBody, signature, webhookSecret)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  const fulfillSecret = process.env.PAYMONGO_FULFILL_SECRET;
  if (!fulfillSecret) {
    return NextResponse.json(
      { error: "PAYMONGO_FULFILL_SECRET is not configured" },
      { status: 503 },
    );
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const root = payload as {
    data?: {
      type?: string;
      attributes?: { type?: string; data?: { attributes?: Record<string, unknown> } };
    };
  };

  const eventType =
    root.data?.attributes?.type ?? root.data?.type;

  if (eventType !== "checkout_session.payment.paid") {
    return NextResponse.json({ received: true });
  }

  const sessionAttrs =
    root.data?.attributes?.data?.attributes ??
    (root.data?.attributes?.data as { attributes?: Record<string, unknown> })
      ?.attributes;

  const referenceNumber = sessionAttrs?.reference_number as string | undefined;
  if (!referenceNumber) {
    return NextResponse.json({ error: "Missing reference_number" }, { status: 400 });
  }

  const supabase = getAnonClient();
  const { data, error } = await supabase.rpc("inv_fulfill_paid_checkout", {
    p_fulfill_secret: fulfillSecret,
    p_reference_number: referenceNumber,
  });

  if (error) {
    console.error("inv_fulfill_paid_checkout", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ received: true, result: data });
}
