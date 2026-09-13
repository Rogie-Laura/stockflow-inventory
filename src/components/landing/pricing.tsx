import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PlanId } from "@/lib/plans";

const plans: {
  name: string;
  planId: PlanId;
  price: string;
  period: string;
  annualNote: string;
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
}[] = [
  {
    name: "Standard",
    planId: "standard",
    price: "₱100",
    period: "/buwan",
    annualNote: "₱1,200/taon",
    description: "Para sa maliit na tindahan at startup na nagsisimula pa lang.",
    features: [
      "Hanggang 100 produkto",
      "1 branch / bodega",
      "POS terminal",
      "Basic monitoring",
      "Low stock alerts",
      "Email support",
    ],
    cta: "Magbayad via GCash",
    popular: false,
  },
  {
    name: "Enterprise",
    planId: "enterprise",
    price: "₱200",
    period: "/buwan",
    annualNote: "₱2,400/taon",
    description: "Para sa lumalaking negosyo na kailangan ng mas maraming power.",
    features: [
      "Unlimited products",
      "5 branches",
      "Advanced analytics",
      "Supplier management",
      "Team (5 users)",
      "Priority support",
      "Transaction history",
    ],
    cta: "Magbayad via GCash",
    popular: true,
  },
  {
    name: "Enterprise A Plus",
    planId: "enterprise_a_plus",
    price: "₱1,500",
    period: "/buwan",
    annualNote: "₱17,100/taon",
    description: "Para sa malalaking kumpanya at multi-branch operations.",
    features: [
      "Lahat ng nasa Enterprise",
      "Unlimited branches",
      "Custom integrations",
      "Dedicated account manager",
      "Unlimited team members",
      "SSO & advanced security",
      "Custom reports & API",
    ],
    cta: "Magbayad via GCash",
    popular: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Presyong{" "}
            <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
              Abot-Kaya
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Piliin ang plan na swak sa negosyo mo. Bayad via GCash — walang
            hidden fees!
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
            <Sparkles className="h-4 w-4" />
            GCash accepted · Annual billing tipid hanggang ₱900/taon
          </div>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-8 ${
                plan.popular
                  ? "border-indigo-500/50 bg-gradient-to-b from-indigo-500/5 to-violet-500/5 shadow-xl shadow-indigo-500/10"
                  : "border-border/50 bg-card"
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-violet-600">
                  Pinaka-Sikat
                </Badge>
              )}
              <div>
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                  {plan.annualNote} · save ₱900/taon (annual)
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={`mt-8 w-full ${
                  plan.popular
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-700"
                    : ""
                }`}
                variant={plan.popular ? "default" : "outline"}
              >
                <Link href={`/dashboard/billing?plan=${plan.planId}`}>
                  {plan.cta}
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
