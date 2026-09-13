"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Loader2, Smartphone } from "lucide-react";
import { Header } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { TABLES } from "@/lib/db-tables";
import {
  PLANS,
  formatPlanPrice,
  type BillingCycle,
  type PlanId,
} from "@/lib/plans";
import type { Subscription } from "@/types/subscription";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const planOrder: PlanId[] = ["standard", "enterprise", "enterprise_a_plus"];

export default function BillingPage() {
  const searchParams = useSearchParams();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("enterprise");
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    const planParam = searchParams.get("plan") as PlanId | null;
    if (planParam && PLANS[planParam]) {
      setSelectedPlan(planParam);
    }

    const status = searchParams.get("status");
    if (status === "success") {
      toast.success(
        "Payment received! I-a-activate ang plan mo sa ilang sandali via webhook."
      );
    } else if (status === "cancelled") {
      toast.info("Na-cancel ang payment. Pwede mong subukan ulit anytime.");
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadSubscription() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from(TABLES.subscription)
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setSubscription({
          id: data.id,
          userId: data.user_id,
          planId: data.plan_id,
          billingCycle: data.billing_cycle,
          status: data.status,
          amountPaid: Number(data.amount_paid),
          paymongoSessionId: data.paymongo_session_id,
          paymongoReference: data.paymongo_reference,
          currentPeriodStart: data.current_period_start,
          currentPeriodEnd: data.current_period_end,
          createdAt: data.created_at,
        });
      }
      setLoading(false);
    }

    loadSubscription();
  }, []);

  async function handleGcashCheckout() {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan,
          billingCycle,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Hindi makagawa ng checkout session.");
        return;
      }

      window.location.href = data.checkoutUrl;
    } catch {
      toast.error("May error sa pag-connect sa PayMongo.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  const selected = PLANS[selectedPlan];
  const amount =
    billingCycle === "monthly"
      ? selected.monthlyAmount
      : selected.annualAmount;

  return (
    <>
      <Header
        title="Billing & Subscription"
        subtitle="Magbayad via GCash — buwanan o taunan"
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : (
          <div className="mx-auto max-w-4xl space-y-6">
            {subscription && (
              <Card className="border-emerald-500/30 bg-emerald-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Badge className="bg-emerald-500">Active</Badge>
                    {PLANS[subscription.planId].name} Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Valid hanggang{" "}
                  <span className="font-medium text-foreground">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString(
                      "en-PH",
                      { year: "numeric", month: "long", day: "numeric" }
                    )}
                  </span>
                  {" · "}
                  {subscription.billingCycle === "monthly"
                    ? "Buwanan"
                    : "Taunan"}{" "}
                  billing via GCash
                </CardContent>
              </Card>
            )}

            <div className="flex justify-center">
              <div className="inline-flex rounded-xl border border-border/50 p-1">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                    billingCycle === "monthly"
                      ? "bg-indigo-500 text-white"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Buwanan
                </button>
                <button
                  onClick={() => setBillingCycle("annual")}
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                    billingCycle === "annual"
                      ? "bg-indigo-500 text-white"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Taunan (tipid ₱900)
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {planOrder.map((planId) => {
                const plan = PLANS[planId];
                const price =
                  billingCycle === "monthly"
                    ? plan.monthlyAmount
                    : plan.annualAmount;
                const isSelected = selectedPlan === planId;

                return (
                  <button
                    key={planId}
                    onClick={() => setSelectedPlan(planId)}
                    className={cn(
                      "rounded-2xl border p-6 text-left transition-all",
                      isSelected
                        ? "border-indigo-500 bg-indigo-500/5 shadow-lg shadow-indigo-500/10"
                        : "border-border/50 hover:border-indigo-500/30"
                    )}
                  >
                    <h3 className="font-semibold">{plan.name}</h3>
                    <div className="mt-2 text-3xl font-bold">
                      {formatPlanPrice(price)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {billingCycle === "monthly" ? "/buwan" : "/taon"}
                    </p>
                    <ul className="mt-4 space-y-1.5">
                      {plan.features.slice(0, 4).map((f) => (
                        <li
                          key={f}
                          className="flex items-start gap-2 text-xs text-muted-foreground"
                        >
                          <Check className="mt-0.5 h-3 w-3 shrink-0 text-indigo-500" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>

            <Card className="border-border/50">
              <CardContent className="flex flex-col items-center gap-4 p-8 sm:flex-row sm:justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Babayaran mo via GCash
                  </p>
                  <p className="text-2xl font-bold">
                    {formatPlanPrice(amount)}
                    <span className="text-sm font-normal text-muted-foreground">
                      {billingCycle === "monthly" ? " / buwan" : " / taon"}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selected.name} plan — i-redirect ka sa GCash app
                  </p>
                </div>

                <Button
                  size="lg"
                  onClick={handleGcashCheckout}
                  disabled={checkoutLoading}
                  className="h-14 min-w-[220px] bg-gradient-to-r from-emerald-500 to-teal-600 text-base shadow-lg hover:from-emerald-600 hover:to-teal-700"
                >
                  {checkoutLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Naglo-load...
                    </>
                  ) : (
                    <>
                      <Smartphone className="mr-2 h-5 w-5" />
                      Magbayad via GCash
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="rounded-xl border border-border/50 bg-muted/30 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Paano gumagana?</p>
              <ol className="mt-2 list-inside list-decimal space-y-1">
                <li>Pindutin ang &ldquo;Magbayad via GCash&rdquo;</li>
                <li>I-redirect ka sa PayMongo checkout page</li>
                <li>Piliin ang GCash at bayaran sa GCash app</li>
                <li>Babalik ka dito at ma-a-activate ang plan mo</li>
              </ol>
              <p className="mt-3 text-xs">
                Kailangan ng PayMongo account. Ilagay ang API keys sa Vercel
                environment variables.
              </p>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
