import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    description: "Perfect for small businesses getting started.",
    features: [
      "Up to 100 products",
      "1 warehouse location",
      "Basic analytics",
      "Email support",
      "Low stock alerts",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Professional",
    price: "$29",
    period: "/month",
    description: "For growing businesses that need more power.",
    features: [
      "Unlimited products",
      "5 warehouse locations",
      "Advanced analytics",
      "Priority support",
      "Supplier management",
      "Team collaboration (5 users)",
      "API access",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "/month",
    description: "For large organizations with complex needs.",
    features: [
      "Everything in Professional",
      "Unlimited locations",
      "Custom integrations",
      "Dedicated account manager",
      "Unlimited team members",
      "SSO & advanced security",
      "Custom reports",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, Transparent{" "}
            <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
              Pricing
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose the plan that fits your business. No hidden fees.
          </p>
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
                  Most Popular
                </Badge>
              )}
              <div>
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
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
                    ? "bg-gradient-to-r from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-violet-700"
                    : ""
                }`}
                variant={plan.popular ? "default" : "outline"}
              >
                <Link href="/dashboard">{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
