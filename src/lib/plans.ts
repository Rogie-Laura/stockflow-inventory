export type PlanId = "standard" | "enterprise" | "enterprise_a_plus";
export type BillingCycle = "monthly" | "annual" | "trial";

export const FREE_TRIAL_DAYS = 3;

export interface PlanConfig {
  id: PlanId;
  name: string;
  description: string;
  monthlyAmount: number; // centavos (PayMongo)
  annualAmount: number; // centavos
  features: string[];
  limits: {
    maxProducts: number | null;
    maxBranches: number | null;
  };
}

export const PLANS: Record<PlanId, PlanConfig> = {
  standard: {
    id: "standard",
    name: "Standard",
    description: "Para sa maliit na tindahan at startup.",
    monthlyAmount: 10000, // ₱100
    annualAmount: 120000, // ₱1,200/taon
    features: [
      "Hanggang 100 produkto",
      "1 branch / bodega",
      "POS terminal",
      "Basic monitoring",
      "Low stock alerts",
    ],
    limits: { maxProducts: 100, maxBranches: 1 },
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    description: "Para sa lumalaking negosyo.",
    monthlyAmount: 20000, // ₱200
    annualAmount: 240000, // ₱2,400/taon
    features: [
      "Unlimited products",
      "5 branches",
      "Advanced analytics",
      "Supplier management",
      "Team (5 users)",
      "Transaction history",
    ],
    limits: { maxProducts: null, maxBranches: 5 },
  },
  enterprise_a_plus: {
    id: "enterprise_a_plus",
    name: "Enterprise A Plus",
    description: "Para sa malalaking kumpanya.",
    monthlyAmount: 150000, // ₱1,500
    annualAmount: 1710000, // ₱17,100/taon (tipid ₱900)
    features: [
      "Lahat ng nasa Enterprise",
      "Unlimited branches",
      "Custom integrations",
      "Dedicated account manager",
      "Unlimited team members",
      "SSO & advanced security",
    ],
    limits: { maxProducts: null, maxBranches: null },
  },
};

export function getPlanAmount(planId: PlanId, cycle: BillingCycle): number {
  const plan = PLANS[planId];
  return cycle === "monthly" ? plan.monthlyAmount : plan.annualAmount;
}

export function formatPlanPrice(centavos: number): string {
  return `₱${(centavos / 100).toLocaleString("en-PH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function getPeriodEnd(cycle: BillingCycle): Date {
  const end = new Date();
  if (cycle === "monthly") {
    end.setMonth(end.getMonth() + 1);
  } else {
    end.setFullYear(end.getFullYear() + 1);
  }
  return end;
}
