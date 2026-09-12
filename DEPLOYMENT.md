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

### Auth Redirect URLs (required)
In Supabase → Authentication → URL Configuration, add:
- Site URL: `https://your-vercel-domain.vercel.app`
- Redirect URLs:
  - `http://localhost:3000/auth/callback`
  - `https://your-vercel-domain.vercel.app/auth/callback`

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
