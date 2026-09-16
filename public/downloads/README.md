# Monitor APK (sideload)

Place the release file here as **`pinoystock-monitor.apk`**.

Install QR on the web Monitor points to:

`/downloads/pinoystock-monitor.apk`

Or set **`NEXT_PUBLIC_MONITOR_APK_URL`** on Vercel to a public HTTPS `.apk` URL
(Supabase Storage, etc.).

Build (Windows: use a path **without spaces** — Gradle breaks on `Project Developer`):

```powershell
robocopy mobile C:\temp\pinoystock_mobile /E /XD build .dart_tool .gradle
cd C:\temp\pinoystock_mobile
flutter pub get
flutter build apk --release --target-platform android-arm64
copy build\app\outputs\flutter-apk\app-release.apk "C:\...\inventory_system\public\downloads\pinoystock-monitor.apk"
```

Then deploy to Vercel.
