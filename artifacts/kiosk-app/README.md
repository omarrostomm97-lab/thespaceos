# Gaming Lounge Kiosk App

A minimal Android kiosk app that locks a tablet to display the Gaming Lounge OS website — no address bar, no browser UI, and the Android back button is suppressed so users cannot navigate away.

## Quick test on a physical device

1. Install **Expo Go** on the tablet from the Google Play Store.
2. In Replit, click the QR code icon in the URL bar of the preview pane.
3. Scan the QR code with the tablet's camera (or from within Expo Go).
4. The kiosk website loads fullscreen.

## Change the website URL

By default the app opens the Replit dev URL. To point it at your production domain:

1. Create `artifacts/kiosk-app/.env` (or set the variable in your build environment):
   ```
   EXPO_PUBLIC_KIOSK_URL=https://your-production-url.replit.app/
   ```
2. Restart the kiosk-app workflow so the Metro bundler picks up the new value.

## Building a production APK

Replit handles iOS publishing via the **Publish** button. For an Android APK, you need Expo's cloud build service (**EAS Build**):

1. Create a free account at [expo.dev](https://expo.dev).
2. Link your project in the EAS dashboard, then run:
   ```
   eas build --platform android --profile preview
   ```
3. EAS builds the APK in the cloud and provides a download link — no local toolchain needed.
4. The app is already configured for the `com.gaminglounge.kiosk` package ID.

## Kiosk hardening tips (after installing the APK)

- In Android Settings → **Accessibility → Pin windows** (or "Screen Pinning"), pin the kiosk app so users cannot switch to other apps.
- Some Android tablets have a **Kiosk Mode** or **Managed Device** policy (via MDM) that can lock the launcher to a single app.
- Set the tablet's display to **never sleep** and keep it plugged in.
