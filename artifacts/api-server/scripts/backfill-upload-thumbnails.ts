#!/usr/bin/env tsx
/**
 * backfill-upload-thumbnails.ts
 *
 * Two-phase backfill for existing uploaded images:
 *
 * Phase 1 — Migrate flat files
 *   Finds image files sitting directly in UPLOADS_DIR (legacy flat structure)
 *   and moves them into UPLOADS_DIR/originals/, updating the DB image_url.
 *
 * Phase 2 — Generate missing thumbnails
 *   For every asset that has an image_url (original) but no thumbnail_url,
 *   generates a 400px-wide WebP thumbnail in UPLOADS_DIR/thumbnails/ and
 *   writes the thumbnail_url to the DB.
 *
 * Usage:
 *   pnpm --filter @workspace/api-server run backfill:uploads -- --dry-run   (default)
 *   pnpm --filter @workspace/api-server run backfill:uploads -- --apply
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
import { isNotNull, isNull, and, eq } from "drizzle-orm";

// ── Config ────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const DRY_RUN = !args.includes("--apply");
const UPLOADS_DIR  = process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");
const ORIGINALS_DIR = path.join(UPLOADS_DIR, "originals");
const THUMBNAILS_DIR = path.join(UPLOADS_DIR, "thumbnails");

// ── Helpers ───────────────────────────────────────────────────────────────────

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function urlToFilePath(url: string): string | null {
  const prefix = "/api/storage/uploads/";
  if (!url || !url.startsWith(prefix)) return null;
  const rel = url.slice(prefix.length);
  return path.join(UPLOADS_DIR, rel);
}

function fileExists(p: string | null): boolean {
  if (!p) return false;
  try { return fs.existsSync(p); } catch { return false; }
}

/** Image extensions we consider processable */
const IMG_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".tiff"]);

// ── Phase 1: migrate flat files → originals/ ─────────────────────────────────

async function migrateFlat(sharp: any): Promise<{ moved: number; failed: number }> {
  console.log("\n── Phase 1: Migrate flat files to originals/ ─────────────");

  if (!DRY_RUN) {
    ensureDir(ORIGINALS_DIR);
    ensureDir(THUMBNAILS_DIR);
  }

  let moved = 0;
  let failed = 0;

  // Find assets whose image_url points to a FLAT path (no originals/ or thumbnails/ prefix)
  const flatPattern = "/api/storage/uploads/";
  const assets = await db
    .select({ id: assetsTable.id, imageUrl: assetsTable.imageUrl, thumbnailUrl: assetsTable.thumbnailUrl })
    .from(assetsTable)
    .where(isNotNull(assetsTable.imageUrl));

  for (const asset of assets) {
    if (!asset.imageUrl) continue;

    const url = asset.imageUrl;
    // Skip already-migrated paths
    if (url.includes("/originals/") || url.includes("/thumbnails/")) continue;

    const srcPath = urlToFilePath(url);
    if (!srcPath || !fileExists(srcPath)) {
      console.log(`  SKIP asset ${asset.id}: file not found at ${srcPath}`);
      continue;
    }

    const ext = path.extname(srcPath).toLowerCase();
    if (!IMG_EXTS.has(ext)) {
      console.log(`  SKIP asset ${asset.id}: unsupported extension ${ext}`);
      continue;
    }

    // Build new name: convert to .webp if not already
    const baseName = path.basename(srcPath, ext) + ".webp";
    const dstOriginal  = path.join(ORIGINALS_DIR,  baseName);
    const dstThumbnail = path.join(THUMBNAILS_DIR, baseName);
    const newImageUrl  = `/api/storage/uploads/originals/${baseName}`;
    const newThumbUrl  = `/api/storage/uploads/thumbnails/${baseName}`;

    console.log(`  MIGRATE asset ${asset.id}: ${path.basename(srcPath)} → originals/${baseName}`);

    if (!DRY_RUN) {
      try {
        // Write WebP original
        await sharp(srcPath).webp({ quality: 85 }).toFile(dstOriginal);
        // Write thumbnail
        await sharp(srcPath).resize({ width: 400, withoutEnlargement: true }).webp({ quality: 75 }).toFile(dstThumbnail);
        // Remove old flat file
        fs.unlinkSync(srcPath);
        // Update DB
        await db.update(assetsTable).set({
          imageUrl:     newImageUrl,
          thumbnailUrl: asset.thumbnailUrl ? asset.thumbnailUrl : newThumbUrl,
        }).where(eq(assetsTable.id, asset.id));
        moved++;
        console.log(`          → written originals/${baseName} + thumbnails/${baseName}`);
      } catch (err: any) {
        console.error(`  ERROR asset ${asset.id}: ${err.message}`);
        failed++;
      }
    } else {
      moved++;  // count would-be moves
    }
  }

  console.log(`\n  Phase 1 complete — ${DRY_RUN ? "would move" : "moved"}: ${moved}, failed: ${failed}`);
  return { moved, failed };
}

// ── Phase 2: generate missing thumbnails ─────────────────────────────────────

async function generateMissingThumbnails(sharp: any): Promise<{ generated: number; failed: number; skipped: number }> {
  console.log("\n── Phase 2: Generate missing thumbnails ──────────────────");

  if (!DRY_RUN) {
    ensureDir(THUMBNAILS_DIR);
  }

  let generated = 0;
  let failed = 0;
  let skipped = 0;

  const assets = await db
    .select({ id: assetsTable.id, imageUrl: assetsTable.imageUrl, thumbnailUrl: assetsTable.thumbnailUrl })
    .from(assetsTable)
    .where(and(isNotNull(assetsTable.imageUrl), isNull(assetsTable.thumbnailUrl)));

  for (const asset of assets) {
    if (!asset.imageUrl) continue;

    const srcPath = urlToFilePath(asset.imageUrl);
    if (!srcPath || !fileExists(srcPath)) {
      console.log(`  SKIP asset ${asset.id}: original not found at ${srcPath}`);
      skipped++;
      continue;
    }

    // Derive thumbnail name
    const srcBase = path.basename(srcPath, path.extname(srcPath));
    const thumbName = `${srcBase}.webp`;
    const thumbPath = path.join(THUMBNAILS_DIR, thumbName);
    const thumbUrl  = `/api/storage/uploads/thumbnails/${thumbName}`;

    console.log(`  THUMB asset ${asset.id}: ${path.basename(srcPath)} → thumbnails/${thumbName}`);

    if (!DRY_RUN) {
      try {
        await sharp(srcPath).resize({ width: 400, withoutEnlargement: true }).webp({ quality: 75 }).toFile(thumbPath);
        await db.update(assetsTable).set({ thumbnailUrl: thumbUrl }).where(eq(assetsTable.id, asset.id));
        generated++;
        console.log(`          → written thumbnails/${thumbName}`);
      } catch (err: any) {
        console.error(`  ERROR asset ${asset.id}: ${err.message}`);
        failed++;
      }
    } else {
      generated++;  // count would-be generations
    }
  }

  console.log(`\n  Phase 2 complete — ${DRY_RUN ? "would generate" : "generated"}: ${generated}, failed: ${failed}, skipped: ${skipped}`);
  return { generated, failed, skipped };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(" Upload Backfill — Migrate flat files + Generate thumbnails");
  console.log(`  Mode       : ${DRY_RUN ? "DRY-RUN (no changes written)" : "APPLY (will write files + update DB)"}`);
  console.log(`  UPLOADS_DIR: ${UPLOADS_DIR}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  if (!fs.existsSync(UPLOADS_DIR)) {
    console.warn(`\n  ⚠️  UPLOADS_DIR does not exist: ${UPLOADS_DIR}`);
    console.warn("     Set UPLOADS_DIR env var to the correct path and re-run.");
    process.exit(1);
  }

  const sharp = (await import("sharp")).default;

  const phase1 = await migrateFlat(sharp);
  const phase2 = await generateMissingThumbnails(sharp);

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(" Summary");
  console.log(`  Flat files migrated          : ${DRY_RUN ? "(dry-run) " : ""}${phase1.moved}`);
  console.log(`  Flat migration failures      : ${phase1.failed}`);
  console.log(`  Thumbnails generated         : ${DRY_RUN ? "(dry-run) " : ""}${phase2.generated}`);
  console.log(`  Thumbnail generation failures: ${phase2.failed}`);
  console.log(`  Assets skipped (no original) : ${phase2.skipped}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  if (DRY_RUN) {
    console.log("\n  Re-run with --apply to write changes.");
  }

  process.exit(0);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
