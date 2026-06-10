import { Router, type IRouter, type Request, type Response } from "express";
import express from "express";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";
import { getUploadsDir } from "../lib/objectStorage";
import { requireAuth, requireTenant, requireRole } from "../lib/auth";

const router: IRouter = Router();
const MGMT = requireRole("platform_owner", "owner", "manager");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, getUploadsDir()),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

/**
 * POST /storage/uploads
 * Accepts a multipart/form-data request with a single "file" field.
 * Saves the file to UPLOADS_DIR and returns the serving URL.
 */
router.post(
  "/storage/uploads",
  requireAuth,
  requireTenant,
  MGMT,
  upload.single("file"),
  (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    const imageUrl = `/api/storage/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  }
);

/**
 * GET /storage/uploads/:filename
 * Serve uploaded files from UPLOADS_DIR.
 */
router.use("/storage/uploads", express.static(getUploadsDir(), {
  maxAge: "7d",
  fallthrough: false,
}));

export default router;
