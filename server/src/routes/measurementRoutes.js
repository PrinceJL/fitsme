import { Router } from 'express';
import { MeasurementController } from '../controllers/measurementController.js';
import { authenticate } from '../middleware/authenticate.js';
import { uploadPhotos } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import { uploadMeasurementSchema } from '../utils/validators/measurementValidators.js';

const router = Router();

router.post(
  '/upload',
  authenticate,
  uploadPhotos,
  validate(uploadMeasurementSchema),
  MeasurementController.upload
);

router.get('/current', authenticate, MeasurementController.getCurrent);

export default router;
