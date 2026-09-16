import type { SupabaseClient } from "@supabase/supabase-js";
import { TABLES } from "@/lib/db-tables";
import type { Subscription } from "@/types/subscription";

export const FREE_TRIAL_DAYS = 3;

function mapSubscription(row: {
  id: string;
  user_id: string;
  plan_id: string;
  billing_cycle: string;
  status: string;
  amount_paid: number | string;
  paymongo_session_id: string | null;
  paymongo_reference: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
}): Subscription {
  return {
    id: row.id,
    userId: row.user_id,
    planId: row.plan_id as Subscription["planId"],
    billingCycle: row.billing_cycle as Subscription["billingCycle"],
    status: row.status as Subscription["status"],
    amountPaid: Number(row.amount_paid),
    paymongoSessionId: row.paymongo_session_id,
    paymongoReference: row.paymongo_reference,
    currentPeriodStart: row.current_period_start ?? row.created_at,
    currentPeriodEnd: row.current_period_end ?? row.created_at,
    createdAt: row.created_at,
  };
}

export async function fetchUserSubscription(
  supabase: SupabaseClient,
  userId: string
): Promise<Subscription | null> {
  await supabase.rpc("inv_expire_trials_for_user", { p_user_id: userId });

  const { data } = await supabase
    .from(TABLES.subscription)
    .select("*")
    .eq("user_id", userId)
    .in("status", ["active", "trialing"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  return mapSubscription(data);
}

export function getTrialDaysRemaining(subscription: Subscription): number {
  if (subscription.status !== "trialing") return 0;
  const end = new Date(subscription.currentPeriodEnd).getTime();
  const diff = end - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function hasAppAccess(subscription: Subscription | null): boolean {
  if (!subscription) return false;
  if (subscription.status === "active") return true;
  if (subscription.status === "trialing") {
    return new Date(subscription.currentPeriodEnd).getTime() > Date.now();
  }
  return false;
}
