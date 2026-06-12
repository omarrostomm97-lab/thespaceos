import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { getUploadsDir, getOriginalsDir, getThumbnailsDir } from "../lib/objectStorage";
import { requireAuth, requireTenant, requireRole } from "../lib/auth";
import { logger } from "../lib/logger";

const router: IRouter = Router();
const MGMT = requireRole("platform_owner", "owner", "manager");

/* ── Multer: temp storage in uploads root, Sharp does the real work ── */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, getUploadsDir()),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `tmp_${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // accept up to 20 MB originals
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

/**
 * POST /storage/uploads
 * Compresses to WebP original + generates 400px thumbnail.
 * Returns { imageUrl, thumbnailUrl }.
 */
router.post(
  "/storage/uploads",
  requireAuth,
  requireTenant,
  MGMT,
  upload.single("file"),
  async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const tmpPath = req.file.path;
    const baseName = `${randomUUID()}.webp`;

    try {
      // Dynamic import so Sharp (native module) doesn't break the esbuild bundle
      const sharp = (await import("sharp")).default;

      const originalPath = path.join(getOriginalsDir(), baseName);
      const thumbPath    = path.join(getThumbnailsDir(), baseName);

      // Full-quality WebP (≤ 85% quality keeps colours accurate and cuts >70% of file size)
      await sharp(tmpPath)
        .webp({ quality: 85 })
        .toFile(originalPath);

      // 400px-wide thumbnail for cards (strips metadata)
      await sharp(tmpPath)
        .resize({ width: 400, withoutEnlargement: true })
        .webp({ quality: 75 })
        .toFile(thumbPath);

      // Remove multer's temp file
      fs.unlink(tmpPath, () => {});

      res.json({
        imageUrl:     `/api/storage/uploads/originals/${baseName}`,
        thumbnailUrl: `/api/storage/uploads/thumbnails/${baseName}`,
      });
    } catch (err) {
      logger.error({ err }, "Image processing failed");
      // Clean up temp file on error
      fs.unlink(tmpPath, () => {});
      res.status(500).json({ error: "Image processing failed" });
    }
  }
);

/* ── Static file handlers — registered BEFORE any fallback ── */

// New structured paths
router.use(
  "/storage/uploads/originals",
  express.static(getOriginalsDir(), { maxAge: "30d", immutable: true, fallthrough: false }),
  (_req: Request, res: Response) => res.status(404).json({ error: "Not found" })
);

router.use(
  "/storage/uploads/thumbnails",
  express.static(getThumbnailsDir(), { maxAge: "30d", immutable: true, fallthrough: false }),
  (_req: Request, res: Response) => res.status(404).json({ error: "Not found" })
);

// Legacy flat path — backward compat for existing image_url values stored in DB
router.use(
  "/storage/uploads",
  express.static(getUploadsDir(), { maxAge: "7d", fallthrough: true }),
  (req: Request, res: Response, next: NextFunction) => {
    logger.warn({ filename: req.path }, "Upload file not found (missing or migrated)");
    next();
  }
);

export default router;
