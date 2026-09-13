import type { BillingCycle, PlanId } from "@/lib/plans";

export type SubscriptionStatus =
  | "pending"
  | "active"
  | "expired"
  | "cancelled";

export interface Subscription {
  id: string;
  userId: string;
  planId: PlanId;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  amountPaid: number;
  paymongoSessionId: string | null;
  paymongoReference: string | null;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  createdAt: string;
}
