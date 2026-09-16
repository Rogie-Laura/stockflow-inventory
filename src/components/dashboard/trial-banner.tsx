"use client";

import Link from "next/link";
import { Clock, Sparkles } from "lucide-react";
import { useSubscription } from "@/context/subscription-context";
import { Button } from "@/components/ui/button";

export function TrialBanner() {
  const { subscription, trialDaysLeft, loading } = useSubscription();

  if (loading || !subscription || subscription.status !== "trialing") {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 border-b border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-900 dark:text-violet-200">
      <Sparkles className="h-4 w-4 shrink-0" />
      <span>
        <strong>Free trial</strong> — {trialDaysLeft}{" "}
        {trialDaysLeft === 1 ? "araw" : "araw"} na lang. Standard plan features
        habang trial.
      </span>
      <Button asChild size="sm" variant="outline" className="h-7 text-xs">
        <Link href="/dashboard/billing">Mag-subscribe via GCash</Link>
      </Button>
    </div>
  );
}

export function TrialExpiredBanner() {
  const { subscription, hasAccess, loading } = useSubscription();

  if (loading || hasAccess) return null;
  if (subscription?.status !== "expired") return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-950 dark:text-amber-100">
      <Clock className="h-4 w-4 shrink-0" />
      <span>Tapos na ang 3-day free trial. Mag-subscribe para magpatuloy.</span>
      <Button asChild size="sm" className="h-7 text-xs">
        <Link href="/dashboard/billing">Pumili ng plan</Link>
      </Button>
    </div>
  );
}
