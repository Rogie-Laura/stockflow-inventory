import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createGcashCheckoutSession, isPayMongoConfigured } from "@/lib/paymongo";
import { TABLES } from "@/lib/db-tables";
import { type BillingCycle, type PlanId, PLANS } from "@/lib/plans";

export async function POST(request: Request) {
  if (!isPayMongoConfigured()) {
    return NextResponse.json(
      {
        error:
          "PayMongo hindi pa naka-setup. Ilagay ang PAYMONGO_SECRET_KEY sa environment variables.",
      },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Kailangan mag-login muna." }, { status: 401 });
  }

  const body = await request.json();
  const planId = body.planId as PlanId;
  const billingCycle = body.billingCycle as BillingCycle;

  if (!planId || !PLANS[planId]) {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }

  if (billingCycle !== "monthly" && billingCycle !== "annual") {
    return NextResponse.json({ error: "Invalid billing cycle." }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  const referenceNumber = `PS-${user.id.slice(0, 8)}-${Date.now()}`;

  try {
    const { checkoutUrl, sessionId } = await createGcashCheckoutSession({
      planId,
      billingCycle,
      userId: user.id,
      userEmail: user.email ?? "",
      referenceNumber,
      successUrl: `${origin}/dashboard/billing?status=success&ref=${referenceNumber}`,
      cancelUrl: `${origin}/dashboard/billing?status=cancelled`,
    });

    const amount =
      billingCycle === "monthly"
        ? PLANS[planId].monthlyAmount
        : PLANS[planId].annualAmount;

    const { data: membership } = await supabase
      .from(TABLES.storeMember)
      .select("store_id")
      .eq("user_id", user.id)
      .eq("role", "store_admin")
      .limit(1)
      .maybeSingle();

    await supabase.from(TABLES.subscription).insert({
      user_id: user.id,
      store_id: membership?.store_id ?? null,
      plan_id: planId,
      billing_cycle: billingCycle,
      status: "pending",
      amount_paid: amount / 100,
      paymongo_session_id: sessionId,
      paymongo_reference: referenceNumber,
    });

    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Checkout creation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
