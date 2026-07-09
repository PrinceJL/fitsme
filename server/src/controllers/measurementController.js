import { MeasurementService } from '../services/measurementService.js';

export const MeasurementController = {
  async upload(req, res, next) {
    try {
      const heightCm = Number(req.body.heightCm);
      const frontImagePath = req.files?.frontImage?.[0]?.path;
      const sideImagePath = req.files?.sideImage?.[0]?.path;

      const { measurement, warnings } = await MeasurementService.processUpload({
        userId: req.user.id,
        heightCm,
        frontImagePath,
        sideImagePath,
      });

      res.status(201).json({ measurement, warnings });
    } catch (err) {
      next(err);
    }
  },

  async getCurrent(req, res, next) {
    try {
      const measurement = await MeasurementService.getCurrentForUser(req.user.id);
      res.status(200).json({ measurement });
    } catch (err) {
      next(err);
    }
  },
};
