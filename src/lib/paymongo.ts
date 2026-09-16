import { type BillingCycle, type PlanId, PLANS, getPlanAmount } from "@/lib/plans";

const PAYMONGO_API = "https://api.paymongo.com/v2/checkout_sessions";

function getAuthHeader() {
  const secretKey = process.env.PAYMONGO_SECRET_KEY;
  if (!secretKey) throw new Error("PAYMONGO_SECRET_KEY is not configured");
  return `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`;
}

export function isPayMongoConfigured() {
  return Boolean(process.env.PAYMONGO_SECRET_KEY);
}

interface CreateCheckoutParams {
  planId: PlanId;
  billingCycle: BillingCycle;
  userId: string;
  userEmail: string;
  referenceNumber: string;
  successUrl: string;
  cancelUrl: string;
}

export async function createGcashCheckoutSession(params: CreateCheckoutParams) {
  const plan = PLANS[params.planId];
  const amount = getPlanAmount(params.planId, params.billingCycle);
  const cycleLabel = params.billingCycle === "monthly" ? "Buwanan" : "Taunan";

  const response = await fetch(PAYMONGO_API, {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: {
        attributes: {
          billing: {
            name: "PinoyStock Subscription",
            email: params.userEmail,
          },
          line_items: [
            {
              name: `PinoyStock ${plan.name} (${cycleLabel})`,
              amount,
              currency: "PHP",
              quantity: 1,
            },
          ],
          payment_method_types: ["gcash", "qrph"],
          success_url: params.successUrl,
          cancel_url: params.cancelUrl,
          reference_number: params.referenceNumber,
          send_email_receipt: true,
          description: `PinoyStock ${plan.name} subscription — ${cycleLabel}`,
          metadata: {
            user_id: params.userId,
            plan_id: params.planId,
            billing_cycle: params.billingCycle,
          },
        },
      },
    }),
  });

  const json = await response.json();

  if (!response.ok) {
    const message =
      json?.errors?.[0]?.detail ?? json?.message ?? "PayMongo checkout failed";
    throw new Error(message);
  }

  return {
    checkoutUrl: json.data.attributes.checkout_url as string,
    sessionId: json.data.id as string,
  };
}
