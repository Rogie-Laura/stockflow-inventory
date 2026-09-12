# StockFlow — SaaS Inventory System with POS & Monitoring

A modern inventory + POS + monitoring SaaS built with **Next.js** and **Tailwind CSS**.

## Features

- **Point of Sale (POS)** — Product grid, cart, checkout, Cash/Card/E-Wallet, tax, discounts, receipts
- **Monitoring Dashboard** — Live sales metrics, hourly charts, transaction feed, stock alerts, inventory health
- **Inventory Management** — Products, categories, suppliers, stock tracking
- **Analytics** — Revenue charts, top sellers, category breakdown
- **Auth** — Supabase login/signup with per-user data (demo mode without Supabase)
- **Dark Mode** — Light / dark / system theme toggle

## Tech Stack

- [Next.js 16](https://nextjs.org/) — App Router
- [Tailwind CSS v4](https://tailwindcss.com/) — Styling
- [shadcn/ui](https://ui.shadcn.com/) — UI Components
- [Recharts](https://recharts.org/) — Charts & Analytics
- [Lucide React](https://lucide.dev/) — Icons

## Getting Started

```bash
# Install dependencies
npm install

# Run development server (demo mode — no Supabase needed)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the landing page.
Navigate to [http://localhost:3000/dashboard](http://localhost:3000/dashboard) for the app.

## Supabase Setup (Auth + Database)

1. Create a project at [supabase.com](https://supabase.com)
2. Copy `.env.local.example` to `.env.local` and fill in your keys
3. Run the SQL migration in `supabase/migrations/20260312000000_inventory_schema.sql` via the Supabase SQL Editor
4. Restart the dev server

Once configured, `/dashboard` requires login and data persists per user in Postgres with Row Level Security.

## Dark Mode

Toggle light / dark / system theme from the navbar or dashboard header.

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   └── dashboard/
│       ├── monitor/          # Live monitoring dashboard
│       ├── pos/              # Point of Sale terminal
│       ├── page.tsx          # Inventory overview
│       ├── products/         # Product management
│       ├── categories/       # Category management
│       ├── suppliers/        # Supplier management
│       ├── analytics/        # Analytics & charts
│       └── settings/         # User settings
├── components/
│   ├── landing/              # Landing page components
│   ├── dashboard/            # Dashboard components
│   └── ui/                   # shadcn/ui components
├── context/                  # React context providers
├── lib/                      # Utilities & mock data
└── types/                    # TypeScript types
```

## License

MIT
