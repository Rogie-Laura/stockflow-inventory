# StockFlow Deployment Guide

## Accounts
- **Email:** rogie.josue.laura.30211111@gmail.com
- **GitHub:** Rogie-Laura
- **Vercel:** rogie-laura
- **Supabase Project:** stockflow-inventory

## Supabase
- **Dashboard:** https://supabase.com/dashboard/project/bwthzumpdsrhxdhwskxx
- **API URL:** https://bwthzumpdsrhxdhwskxx.supabase.co
- **Region:** ap-southeast-1 (Singapore)

### Auth Redirect URLs (required — do this once)
In [Supabase Auth Settings](https://supabase.com/dashboard/project/bwthzumpdsrhxdhwskxx/auth/url-configuration):
- **Site URL:** `https://inventorysystem-lemon.vercel.app`
- **Redirect URLs:**
  - `http://localhost:3000/auth/callback`
  - `https://inventorysystem-lemon.vercel.app/auth/callback`
  - `https://inventorysystem-*.vercel.app/auth/callback`

## Vercel
- **Production URL:** https://inventorysystem-lemon.vercel.app
- **Dashboard:** https://vercel.com/rogie-lauras-projects/inventory_system
- **GitHub connected:** https://github.com/Rogie-Laura/stockflow-inventory

## GitHub
- **Repository:** https://github.com/Rogie-Laura/stockflow-inventory

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=https://bwthzumpdsrhxdhwskxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from Supabase Settings → API>
```

## Local Development
```bash
npm install
npm run dev
```

## Database
Clean schema migration: `supabase/migrations/00000000000000_clean_schema.sql`

Tables: `profiles`, `categories`, `suppliers`, `products`, `sales`, `sale_items`, `activities`
