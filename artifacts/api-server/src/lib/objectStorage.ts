import path from "path";
import fs from "fs";

export function getUploadsDir(): string {
  const dir = process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}
