#!/usr/bin/env tsx
/**
 * cleanup-upload-references.ts
 *
 * Scans all assets in the DB for image_url / thumbnail_url values, checks
 * whether the referenced file exists on disk, and (in apply mode) nulls out
 * the columns for missing files.
 *
 * Usage:
 *   pnpm --filter @workspace/api-server run cleanup:uploads -- --dry-run   (default)
 *   pnpm --filter @workspace/api-server run cleanup:uploads -- --apply
 *
 * Environment:
 *   DATABASE_URL   — PostgreSQL connection string (required)
 *   UPLOADS_DIR    — root uploads folder (default: <cwd>/uploads)
 *                    On VPS: /var/www/thespaceos/uploads
 */

import path from "path";
import fs from "fs";
import { db } from "@workspace/db";
import { assetsTable } from "@workspace/db";
import { isNotNull, or, eq } from "drizzle-orm";

// ── Config ────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const DRY_RUN = !args.includes("--apply");
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Maps a stored URL like `/api/storage/uploads/originals/foo.webp`
 * to an absolute disk path. Returns null for unrecognised/external URLs.
 */
function urlToFilePath(url: string): string | null {
  const prefix = "/api/storage/uploads/";
  if (!url || !url.startsWith(prefix)) return null;          // external / unmanaged
  const rel = url.slice(prefix.length);                      // e.g. originals/foo.webp
  return path.join(UPLOADS_DIR, rel);
}

function fileExists(p: string | null): boolean {
  if (!p) return false;
  try { return fs.existsSync(p); } catch { return false; }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(" Upload Reference Cleanup");
  console.log(`  Mode      : ${DRY_RUN ? "DRY-RUN (no changes written)" : "APPLY (will update DB)"}`);
  console.log(`  UPLOADS_DIR: ${UPLOADS_DIR}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  if (!fs.existsSync(UPLOADS_DIR)) {
    console.warn(`  ⚠️  UPLOADS_DIR does not exist: ${UPLOADS_DIR}`);
    console.warn("     Set UPLOADS_DIR env var to the correct path.\n");
  }

  // Fetch all assets that have at least one image URL
  const assets = await db
    .select({
      id:           assetsTable.id,
      imageUrl:     assetsTable.imageUrl,
      thumbnailUrl: assetsTable.thumbnailUrl,
    })
    .from(assetsTable)
    .where(or(isNotNull(assetsTable.imageUrl), isNotNull(assetsTable.thumbnailUrl)));

  let totalChecked  = 0;
  let missingFiles  = 0;
  let recordsUpdated = 0;
  let skipped       = 0;   // unmanaged / external URLs

  for (const asset of assets) {
    totalChecked++;

    // Resolve paths (null = unmanaged URL → skip)
    const imgPath   = asset.imageUrl     ? urlToFilePath(asset.imageUrl)     : null;
    const thumbPath = asset.thumbnailUrl ? urlToFilePath(asset.thumbnailUrl) : null;

    const imgUnmanaged   = !!asset.imageUrl     && imgPath   === null;
    const thumbUnmanaged = !!asset.thumbnailUrl && thumbPath === null;

    const imgMissing   = imgPath   !== null && !fileExists(imgPath);
    const thumbMissing = thumbPath !== null && !fileExists(thumbPath);

    if (imgUnmanaged || thumbUnmanaged) {
      skipped++;
      const which = [
        imgUnmanaged   ? `image (${asset.imageUrl})`     : "",
        thumbUnmanaged ? `thumb (${asset.thumbnailUrl})` : "",
      ].filter(Boolean).join(", ");
      console.log(`  SKIP  asset ${asset.id}: unmanaged URL — ${which}`);
      continue;
    }

    if (!imgMissing && !thumbMissing) continue;  // all good

    missingFiles++;
    const missing = [
      imgMissing   ? `image → ${imgPath}`   : "",
      thumbMissing ? `thumb → ${thumbPath}` : "",
    ].filter(Boolean).join(", ");
    console.log(`  MISSING asset ${asset.id}: ${missing}`);

    if (!DRY_RUN) {
      const patch: { imageUrl?: null; thumbnailUrl?: null } = {};
      if (imgMissing)   patch.imageUrl     = null;
      if (thumbMissing) patch.thumbnailUrl = null;
      await db.update(assetsTable).set(patch).where(eq(assetsTable.id, asset.id));
      recordsUpdated++;
      console.log(`          → nulled ${Object.keys(patch).join(", ")} for asset ${asset.id}`);
    }
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(" Report");
  console.log(`  Total records checked : ${totalChecked}`);
  console.log(`  Missing files found   : ${missingFiles}`);
  console.log(`  Records updated       : ${DRY_RUN ? "0 (dry-run)" : String(recordsUpdated)}`);
  console.log(`  Skipped (unmanaged)   : ${skipped}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  if (DRY_RUN && missingFiles > 0) {
    console.log("\n  Re-run with --apply to write changes to the database.");
  }

  process.exit(0);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
