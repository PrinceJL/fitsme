import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';
import { isProd } from '../config/env.js';

export function notFoundHandler(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.message,
      details: err.details,
    });
  }

  if (err instanceof multer.MulterError || /Only JPEG, PNG, or WEBP/.test(err.message || '')) {
    return res.status(400).json({ error: err.message });
  }

  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error.',
    ...(isProd ? {} : { stack: err.stack }),
  });
}
