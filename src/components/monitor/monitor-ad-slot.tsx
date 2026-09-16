"use client";

import { useEffect, useRef } from "react";

type MonitorAdSlotProps = {
  placement: string;
  pulse: number;
};

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

export function MonitorAdSlot({ placement, pulse }: MonitorAdSlotProps) {
  const slotRef = useRef<HTMLModElement>(null);
  const client = process.env.NEXT_PUBLIC_MONITOR_ADSENSE_CLIENT;
  const slot = process.env.NEXT_PUBLIC_MONITOR_ADSENSE_SLOT;

  useEffect(() => {
    if (!client || !slot || !slotRef.current) return;

    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch {
      // Ad block or script not loaded
    }
  }, [client, slot, pulse, placement]);

  return (
    <div
      className="overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-orange-500/5"
      data-ad-placement={placement}
      data-ad-pulse={pulse}
    >
      <div className="border-b border-amber-500/15 px-3 py-1.5 text-center text-[10px] font-medium uppercase tracking-wider text-amber-800/70 dark:text-amber-200/70">
        Sponsored
      </div>
      <div className="flex min-h-[72px] items-center justify-center p-3">
        {client && slot ? (
          <ins
            ref={slotRef}
            className="adsbygoogle block w-full"
            style={{ display: "block", minHeight: 72 }}
            data-ad-client={client}
            data-ad-slot={slot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : (
          <p className="max-w-md text-center text-sm text-muted-foreground">
            Partner offers · Monitoring Center
            <span className="mt-1 block text-xs opacity-80">
              (Set NEXT_PUBLIC_MONITOR_ADSENSE_CLIENT at slot sa Vercel para live
              ads)
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
