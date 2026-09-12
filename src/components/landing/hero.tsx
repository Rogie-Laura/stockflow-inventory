import Link from "next/link";
import {
  ArrowRight,
  Monitor,
  ShoppingCart,
  Store,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-indigo-500/20 via-violet-500/10 to-transparent blur-3xl" />
        <div className="absolute top-40 right-0 h-[400px] w-[400px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400">
            <Zap className="h-4 w-4" />
            Inventory + POS + Monitoring — Gawa para sa Pinoy negosyo
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Pamahalaan ang Negosyo Mo{" "}
            <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500 bg-clip-text text-transparent">
              nang Pro
            </span>
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
            PinoyStock — ang all-in-one platform para sa inventory, POS, at
            real-time monitoring. Simula lang ₱100/buwan!
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              asChild
              className="h-12 px-8 bg-gradient-to-r from-indigo-500 to-violet-600 text-base shadow-xl shadow-indigo-500/25 hover:from-indigo-600 hover:to-violet-700"
            >
              <Link href="/dashboard/pos">
                Buksan ang POS
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base">
              <Link href="/dashboard/monitor">Tignan ang Monitor</Link>
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 border-t border-border/50 pt-8">
            {[
              { value: "₱100", label: "Simula/buwan" },
              { value: "POS", label: "Point of Sale" },
              { value: "LIVE", label: "Monitoring" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold sm:text-3xl">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto mt-20 max-w-5xl">
          <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-emerald-500/10 to-violet-500/20 blur-2xl" />
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-card shadow-2xl">
            <div className="flex items-center gap-2 border-b border-border/50 bg-muted/50 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 text-center text-xs text-muted-foreground">
                app.pinoystock.ph/monitor
              </div>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-3 sm:p-8">
              {[
                {
                  icon: ShoppingCart,
                  label: "POS Terminal",
                  value: "Mag-benta agad",
                  color: "from-emerald-500 to-teal-600",
                },
                {
                  icon: Monitor,
                  label: "Live Monitor",
                  value: "₱503.37 Ngayon",
                  color: "from-indigo-500 to-violet-600",
                },
                {
                  icon: Store,
                  label: "Inventory",
                  value: "225 Produkto",
                  color: "from-violet-500 to-purple-600",
                },
              ].map((card) => (
                <div
                  key={card.label}
                  className="rounded-xl border border-border/50 bg-background p-4"
                >
                  <div
                    className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${card.color}`}
                  >
                    <card.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {card.label}
                  </div>
                  <div className="mt-1 text-xl font-bold">{card.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
