# PinoyStock Monitor (Flutter)

Mobile **Monitoring Center** for PinoyStock — full analytics, Supabase live data, **Unity Ads** (same stack as `c:\scalper\mobile`).

**Walang PWA** sa web — ang `/dashboard/monitor` ay 4 KPIs + link dito lang. Ito ang official mobile install (Play Store / APK) na may **Unity Ads** on open/resume.

## Setup

1. Install [Flutter](https://docs.flutter.dev/get-started/install) (3.8+).
2. Copy env from the Next.js project (same Supabase project / PATROLLERS):

   ```powershell
   cd mobile
   copy .env.example .env
   ```

   Edit `mobile/.env`:

   - `SUPABASE_URL` — same as `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_ANON_KEY` — same as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Unity — new game in [Unity dashboard](https://dashboard.unity.com) or reuse test IDs from Scalper `mobile/.env`:
     - `UNITY_ANDROID_GAME_ID` / `UNITY_IOS_GAME_ID`
     - Create **Interstitial** placements (`Interstitial_Android`, `Interstitial_iOS`) or set `UNITY_INTERSTITIAL_PLACEMENT_ID`

3. Run:

   ```powershell
   cd c:\Users\Project Developer\Documents\inventory_system\mobile
   flutter pub get
   flutter run
   ```

## QR login (same account as web)

1. Sa web, **Dashboard → Monitor** habang naka-login (admin/supervisor).
2. I-scan ang **login QR** sa Flutter app → **Scan QR (web Monitor)**.
3. One-time code (~3 min); auto-login same account.

**Monitor login:** tumatawag sa Supabase Edge Function `mobile-account-login` (anon key lang sa app). Hindi kailangan ang `SUPABASE_SERVICE_ROLE_KEY` sa Vercel para dito.

**QR pair (optional):** kailangan `SUPABASE_SERVICE_ROLE_KEY` sa Vercel para sa `/api/mobile/pair/exchange`, o i-deploy din ang edge equivalent.

**Install QR:** kapag may `NEXT_PUBLIC_MONITOR_PLAY_STORE_URL` o `NEXT_PUBLIC_MONITOR_APK_URL` sa Vercel, may hiwalay na QR sa web para download.

## Unity Ads

- Package: `unity_ads_plugin` ^0.5.0 (see Scalper `rewarded_ad_service.dart`; here we use **interstitial** on app open/resume).
- `UNITY_TEST_MODE=true` for test ads until production placements are live.
- Cooldown: 45s between interstitials on resume (adjust in `lib/services/unity_ads_service.dart`).

## Access

- **store_admin** and **supervisor** only (same as web Monitor).
- Cashier accounts see access denied.

## Release

- Android: signing + Play Store listing
- iOS: Xcode + App Store (Unity iOS Game ID required)
