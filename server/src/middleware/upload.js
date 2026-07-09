import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env.js';

fs.mkdirSync(env.uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, env.uploadDir);
  },
  filename: (req, file, cb) => {
    const userId = req.user?.id || 'anonymous';
    const ext = path.extname(file.originalname) || '.jpg';
    const unique = `${userId}-${file.fieldname}-${Date.now()}${ext}`;
    cb(null, unique);
  },
});

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(new Error('Only JPEG, PNG, or WEBP images are allowed.'));
  }
  cb(null, true);
}

export const uploadPhotos = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.maxUploadSizeMb * 1024 * 1024 },
}).fields([
  { name: 'frontImage', maxCount: 1 },
  { name: 'sideImage', maxCount: 1 },
]);
