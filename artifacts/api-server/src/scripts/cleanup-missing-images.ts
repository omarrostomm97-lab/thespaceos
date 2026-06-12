/**
 * cleanup-missing-images.ts
 *
 * One-shot script: scans all assets with a non-null image_url, checks whether
 * the file exists on disk, and for missing ones nulls out both image_url and
 * thumbnail_url in the DB.
 *
 * Run:
 *   pnpm --filter @workspace/api-server run cleanup-images
 */

import "dotenv/config";
import path from "path";
import fs from "fs";
import { db } from "@workspace/db";
import { assetsTable } from "@workspace/db";
import { isNotNull, or } from "drizzle-orm";

function getUploadsDir(): string {
  return process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");
}

function urlToFilePath(url: string): string | null {
  // /api/storage/uploads/originals/foo.webp  → <UPLOADS_DIR>/originals/foo.webp
  // /api/storage/uploads/thumbnails/foo.webp → <UPLOADS_DIR>/thumbnails/foo.webp
  // /api/storage/uploads/foo.jpg             → <UPLOADS_DIR>/foo.jpg  (legacy)
  const prefix = "/api/storage/uploads/";
  if (!url.startsWith(prefix)) return null;
  const rel = url.slice(prefix.length);
  return path.join(getUploadsDir(), rel);
}

async function main() {
  const uploadsDir = getUploadsDir();
  console.log(`Uploads dir: ${uploadsDir}`);

  const assets = await db
    .select({ id: assetsTable.id, imageUrl: assetsTable.imageUrl, thumbnailUrl: assetsTable.thumbnailUrl })
    .from(assetsTable)
    .where(or(isNotNull(assetsTable.imageUrl), isNotNull(assetsTable.thumbnailUrl)));

  console.log(`Found ${assets.length} asset(s) with image/thumbnail URLs.`);

  let cleaned = 0;
  for (const asset of assets) {
    const imgMissing = asset.imageUrl
      ? !fs.existsSync(urlToFilePath(asset.imageUrl) ?? "")
      : false;
    const thumbMissing = asset.thumbnailUrl
      ? !fs.existsSync(urlToFilePath(asset.thumbnailUrl) ?? "")
      : false;

    if (imgMissing || thumbMissing) {
      console.log(
        `  Asset ${asset.id}: ` +
        (imgMissing ? `image missing (${asset.imageUrl}) ` : "") +
        (thumbMissing ? `thumbnail missing (${asset.thumbnailUrl})` : "")
      );
      await db
        .update(assetsTable)
        .set({ imageUrl: null, thumbnailUrl: null })
        .where(
          (await import("drizzle-orm")).eq(assetsTable.id, asset.id)
        );
      cleaned++;
    }
  }

  console.log(`Done. Nulled ${cleaned} asset record(s).`);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
