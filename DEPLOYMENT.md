# PinoyStock Deployment Guide

## Accounts
- **Email:** rogie.josue.laura.30211111@gmail.com
- **GitHub:** Rogie-Laura
- **Vercel:** rogie-laura
- **Supabase Project:** project-PATROLLERS (shared DB, `inv_` tables)

## Supabase
- **Dashboard:** https://supabase.com/dashboard/project/spwrebtvdolfqeolmwbe
- **API URL:** https://spwrebtvdolfqeolmwbe.supabase.co
- **Region:** ap-southeast-1 (Singapore)

### Inventory tables (inv_ prefix)
| Table | Purpose |
|-------|---------|
| `inv_profile` | User profile |
| `inv_category` | Product categories |
| `inv_supplier` | Suppliers |
| `inv_item` | Products / inventory items |
| `inv_sale` | Sales transactions |
| `inv_sale_item` | Sale line items |
| `inv_activity` | Audit log |
| `inv_subscription` | GCash billing |

### Auth Redirect URLs (required — do this once)
In [Supabase Auth Settings](https://supabase.com/dashboard/project/spwrebtvdolfqeolmwbe/auth/url-configuration):
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
NEXT_PUBLIC_SUPABASE_URL=https://spwrebtvdolfqeolmwbe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from Supabase Settings → API>
SUPABASE_SERVICE_ROLE_KEY=<from Supabase Settings → API — server only!>

# PayMongo GCash billing
PAYMONGO_SECRET_KEY=sk_test_xxx or sk_live_xxx
PAYMONGO_WEBHOOK_SECRET=<from PayMongo Dashboard → Webhooks>
```

## GCash Subscription Setup (PayMongo)

1. Create account at [paymongo.com](https://paymongo.com)
2. Get **Secret Key** (test mode muna para sa testing)
3. Sa PayMongo Dashboard → **Webhooks**, add endpoint:
   - URL: `https://inventorysystem-lemon.vercel.app/api/webhooks/paymongo`
   - Event: `checkout_session.payment.paid`
4. Ilagay ang keys sa Vercel Environment Variables
5. Redeploy

### Customer flow
1. `/dashboard/billing` → pili ng plan
2. Click **Magbayad via GCash**
3. Redirect sa PayMongo → bayad sa GCash app
4. Webhook activates subscription sa Supabase

## Local Development
```bash
npm install
npm run dev
```

## Database
Clean schema migration: `supabase/migrations/00000000000000_clean_schema.sql`

Tables: `profiles`, `categories`, `suppliers`, `products`, `sales`, `sale_items`, `activities`
