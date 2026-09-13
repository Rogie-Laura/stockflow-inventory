import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { TABLES } from "@/lib/db-tables";
import { getPeriodEnd, type BillingCycle, type PlanId } from "@/lib/plans";

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

export async function POST(request: Request) {
  const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;

  if (webhookSecret) {
    const signature = request.headers.get("paymongo-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }
  }

  const payload = await request.json();
  const event = payload?.data;
  const eventType = event?.type ?? event?.attributes?.type;

  if (eventType !== "checkout_session.payment.paid") {
    return NextResponse.json({ received: true });
  }

  const session = event?.data ?? event?.attributes?.data;
  const attrs = session?.attributes ?? session;
  const referenceNumber = attrs?.reference_number;
  const metadata = attrs?.metadata ?? {};
  const planId = metadata.plan_id as PlanId;
  const billingCycle = metadata.billing_cycle as BillingCycle;
  const userId = metadata.user_id as string;

  if (!referenceNumber || !userId || !planId || !billingCycle) {
    return NextResponse.json({ error: "Invalid webhook data" }, { status: 400 });
  }

  const supabase = getServiceClient();
  const now = new Date();
  const periodEnd = getPeriodEnd(billingCycle);

  await supabase
    .from(TABLES.subscription)
    .update({
      status: "cancelled",
      updated_at: now.toISOString(),
    })
    .eq("user_id", userId)
    .eq("status", "active");

  await supabase
    .from(TABLES.subscription)
    .update({
      status: "active",
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq("paymongo_reference", referenceNumber)
    .eq("status", "pending");

  return NextResponse.json({ received: true });
}
