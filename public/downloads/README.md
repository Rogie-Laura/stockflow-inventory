# Monitor APK (sideload)

Place the release file here as **`pinoystock-monitor.apk`**.

Install QR on the web Monitor points to:

`/downloads/pinoystock-monitor.apk`

Or set **`NEXT_PUBLIC_MONITOR_APK_URL`** on Vercel to a public HTTPS `.apk` URL
(Supabase Storage, etc.).

Build:

```powershell
cd mobile
flutter build apk --release
copy build\app\outputs\flutter-apk\app-release.apk ..\public\downloads\pinoystock-monitor.apk
```

Then deploy to Vercel.
