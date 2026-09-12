import {
  BarChart3,
  Bell,
  Boxes,
  Monitor,
  Receipt,
  ShoppingCart,
  Truck,
  Users,
} from "lucide-react";

const features = [
  {
    icon: ShoppingCart,
    title: "Point of Sale (POS)",
    description:
      "Fast checkout with cart management, multiple payment methods (Cash, Card, E-Wallet), tax, discounts, and digital receipts.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Monitor,
    title: "Live Monitoring Dashboard",
    description:
      "Real-time sales tracking, hourly charts, live transaction feed, stock alerts, and inventory health score.",
    gradient: "from-indigo-500 to-violet-500",
  },
  {
    icon: Boxes,
    title: "Inventory Management",
    description:
      "Track products, categories, suppliers, and stock levels with automatic status updates on every sale.",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: Receipt,
    title: "Sales & Receipts",
    description:
      "Auto-generate receipt numbers, calculate 12% tax, track change for cash payments, and log every transaction.",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description:
      "Revenue charts, top sellers, category breakdown, and stock trend analysis for data-driven decisions.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Bell,
    title: "Smart Stock Alerts",
    description:
      "Instant alerts for low stock and out-of-stock items on the monitoring dashboard and activity feed.",
    gradient: "from-red-500 to-rose-500",
  },
  {
    icon: Truck,
    title: "Supplier Management",
    description:
      "Manage supplier relationships, track ratings, and streamline your procurement process.",
    gradient: "from-emerald-500 to-green-600",
  },
  {
    icon: Users,
    title: "Multi-user & Auth",
    description:
      "Secure login with Supabase Auth, per-user data isolation with Row Level Security, and team-ready.",
    gradient: "from-pink-500 to-rose-500",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Inventory, POS & Monitoring —{" "}
            <span className="bg-gradient-to-r from-indigo-500 to-emerald-500 bg-clip-text text-transparent">
              Isang Platform Lang
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Lahat ng kailangan ng tindahan o bodega mo — magbenta, mag-track, at
            mag-monitor in real time. Gawa para sa Pinoy!
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5"
            >
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg transition-transform duration-300 group-hover:scale-110`}
              >
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
