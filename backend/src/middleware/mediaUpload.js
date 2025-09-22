// Author: Aazaf Ritha
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure base upload folders exist (now under frontend/public/uploads)
// __dirname: backend/src/middleware -> repo root: ../../../
const baseDir = path.join(__dirname, '../../../frontend/public/uploads');
const contentDir = path.join(baseDir, 'content');
const imagesDir = path.join(contentDir, 'images');
const pdfsDir = path.join(contentDir, 'pdfs');

for (const dir of [baseDir, contentDir, imagesDir, pdfsDir]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Utility to build destination based on file type
function getDestForFile(file) {
  const mime = file.mimetype || '';
  if (mime.startsWith('image/')) return imagesDir;
  if (mime === 'application/pdf') return pdfsDir;
  return contentDir;
}

// File name generator
function makeFilename(prefix, file) {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const ext = path.extname(file.originalname) || '';
  return `${prefix}-${uniqueSuffix}${ext}`;
}

// Shared storage using dynamic destination
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      cb(null, getDestForFile(file));
    } catch (e) {
      cb(e);
    }
  },
  filename: (req, file, cb) => {
    try {
      const prefix = file.mimetype === 'application/pdf' ? 'pdf' : 'img';
      cb(null, makeFilename(prefix, file));
    } catch (e) {
      cb(e);
    }
  }
});

// Image-only upload middleware
export const uploadImageMiddleware = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// PDF-only upload middleware
export const uploadPdfMiddleware = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') return cb(null, true);
    cb(new Error('Only PDF files are allowed'));
  },
  limits: { fileSize: 12 * 1024 * 1024 } // 12MB
});

// Helper to convert a saved file path to public URL
export function toPublicUrl(filePath) {
  // Input like: C:\...\backend\uploads\content\images\img-...png
  // We want URL: /uploads/content/images/...
  const rel = filePath.split(path.sep).join('/').split('/uploads/')[1];
  return `/uploads/${rel}`;
}
