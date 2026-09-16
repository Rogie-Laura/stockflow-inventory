"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  fetchUserSubscription,
  getTrialDaysRemaining,
  hasAppAccess,
} from "@/lib/subscription-db";
import { useStore } from "@/context/store-context";
import type { Subscription } from "@/types/subscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SubscriptionContextValue {
  subscription: Subscription | null;
  loading: boolean;
  hasAccess: boolean;
  trialDaysLeft: number;
  refresh: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { role, isDemoMode } = useStore();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured());

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setSubscription(null);
        return;
      }
      const sub = await fetchUserSubscription(supabase, user.id);
      setSubscription(sub);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const hasAccess = useMemo(() => {
    if (isDemoMode) return true;
    if (role === "cashier") return true;
    return hasAppAccess(subscription);
  }, [isDemoMode, role, subscription]);

  const trialDaysLeft = subscription ? getTrialDaysRemaining(subscription) : 0;

  const billingPath = pathname.startsWith("/dashboard/billing");
  const showExpiredBlock =
    !loading &&
    !isDemoMode &&
    role === "store_admin" &&
    !hasAccess &&
    !billingPath;

  const value = useMemo(
    () => ({
      subscription,
      loading,
      hasAccess,
      trialDaysLeft,
      refresh,
    }),
    [subscription, loading, hasAccess, trialDaysLeft, refresh]
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {showExpiredBlock ? (
        <div className="flex flex-1 items-center justify-center p-6">
          <Card className="max-w-md border-amber-500/30">
            <CardHeader>
              <CardTitle>Tapos na ang free trial</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                3 araw na free trial mo sa PinoyStock ay tapos na. Mag-subscribe
                via GCash para magpatuloy ang inventory at POS.
              </p>
              <Button asChild className="w-full">
                <Link href="/dashboard/billing">Pumili ng plan</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        children
      )}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) {
    throw new Error("useSubscription must be used within SubscriptionProvider");
  }
  return ctx;
}
