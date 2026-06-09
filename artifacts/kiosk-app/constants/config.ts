/**
 * KIOSK_URL — the website the kiosk opens on launch.
 *
 * To point to a different URL, set:
 *   EXPO_PUBLIC_KIOSK_URL=https://your-domain.com/
 * in the `.env` file before running or building the app.
 */
export const KIOSK_URL =
  process.env.EXPO_PUBLIC_KIOSK_URL ??
  "https://thespaceos.com/";
