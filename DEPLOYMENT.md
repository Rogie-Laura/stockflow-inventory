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
| `inv_store` | Store / business entity |
| `inv_store_member` | Team roles (store_admin, cashier) |
| `inv_pos_terminal` | POS counters (POS-01, POS-02, POS-03) |

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

# PayMongo GCash billing (same merchant as Pinoy-Up / scalper — reuse sk_test from c:/scalper/supabase/.env.paymongo)
PAYMONGO_SECRET_KEY=sk_test_xxx or sk_live_xxx
PAYMONGO_WEBHOOK_SECRET=whsk_xxx   # signing secret for THIS app's webhook URL only
PAYMONGO_FULFILL_SECRET=<from Supabase — see below>
```

### `PAYMONGO_FULFILL_SECRET`
After migration `20260916120000_inv_paymongo_fulfill_rpc.sql`, read once from SQL (Dashboard → SQL):

```sql
SELECT value FROM public.inv_system_secret WHERE key = 'paymongo_fulfill';
```

Ilagay ang result sa Vercel at sa local `.env.local`. Huwag i-commit.

## GCash Subscription Setup (PayMongo)

1. **Reuse** PayMongo test/live secret key (scalper file: `c:/scalper/supabase/.env.paymongo`).
2. **Webhook** (hiwalay sa scalper Supabase URL) — endpoint:
   - URL: `https://inventorysystem-lemon.vercel.app/api/webhooks/paymongo`
   - Event: `checkout_session.payment.paid`
   - Already registered via API (test mode); re-create in Dashboard if you rotate keys.
3. Set `PAYMONGO_*` env vars on Vercel → **Redeploy**

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
