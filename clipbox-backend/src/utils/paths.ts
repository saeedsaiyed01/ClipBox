import fs from 'fs';
import path from 'path';

/**
 * On Render:
 * process.cwd() === /opt/render/project/src/clipbox-backend
 */
export const ROOT_DIR = process.cwd();

export const UPLOADS_DIR = path.join(ROOT_DIR, 'uploads');
export const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

export function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

export function ensurePublicDir() {
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }
}
