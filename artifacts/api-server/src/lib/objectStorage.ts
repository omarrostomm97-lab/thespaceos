import path from "path";
import fs from "fs";

/**
 * Returns the root uploads directory (created if missing).
 * Set UPLOADS_DIR env var to an absolute path for production,
 * e.g. UPLOADS_DIR=/var/www/thespaceos/uploads
 */
export function getUploadsDir(): string {
  const dir = process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/** /uploads/originals — full-quality WebP */
export function getOriginalsDir(): string {
  const dir = path.join(getUploadsDir(), "originals");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/** /uploads/thumbnails — 400px-wide WebP for cards */
export function getThumbnailsDir(): string {
  const dir = path.join(getUploadsDir(), "thumbnails");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/*
 * ─── Nginx production config ──────────────────────────────────────────────────
 * Add this block to your Nginx server config so uploaded images are served
 * directly from disk (bypassing Node) with a 30-day cache:
 *
 *   location /api/storage/uploads/ {
 *       alias /var/www/thespaceos/uploads/;
 *       expires 30d;
 *       add_header Cache-Control "public, immutable";
 *       add_header X-Content-Type-Options "nosniff";
 *       try_files $uri =404;
 *   }
 *
 * Make sure UPLOADS_DIR=/var/www/thespaceos/uploads matches the alias above.
 * ─────────────────────────────────────────────────────────────────────────────
 */
