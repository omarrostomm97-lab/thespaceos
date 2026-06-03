/**
 * KIOSK_URL — the website the kiosk opens on launch.
 *
 * To point to a different URL (e.g. your production domain), set:
 *   EXPO_PUBLIC_KIOSK_URL=https://your-app.replit.app/
 * in the `.env` file before running or building the app.
 */
export const KIOSK_URL =
  process.env.EXPO_PUBLIC_KIOSK_URL ??
  "https://b7e7fe36-5717-43a3-9046-c093cd64e42b-00-3e732q4sdt71o.riker.replit.dev/";
