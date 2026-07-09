import { MeasurementModel } from '../models/measurementModel.js';
import { CvServiceClient } from './cvServiceClient.js';
import { ApiError } from '../utils/ApiError.js';

export const MeasurementService = {
  async processUpload({ userId, heightCm, frontImagePath, sideImagePath }) {
    if (!frontImagePath) {
      throw new ApiError(400, 'A front-facing photo is required.');
    }

    const cvResult = await CvServiceClient.estimateMeasurements({
      heightCm,
      frontImagePath,
      sideImagePath,
    });

    const m = cvResult.measurements;

    // Keep only one active measurement set per user; older scans stay in
    // history for future trend/progress features.
    await MeasurementModel.deactivateAllForUser(userId);

    const saved = await MeasurementModel.create({
      userId,
      heightCm,
      frontImagePath,
      sideImagePath,
      shoulderWidthCm: m.shoulder_width_cm,
      chestCm: m.chest_cm,
      waistCm: m.waist_cm,
      hipCm: m.hip_cm,
      armLengthCm: m.arm_length_cm,
      legLengthCm: m.leg_length_cm,
      bodyShape: m.body_shape,
      confidenceScore: m.confidence_score,
      rawLandmarks: cvResult.raw_landmarks,
    });

    return { measurement: saved, warnings: m.warnings || [] };
  },

  async getCurrentForUser(userId) {
    const measurement = await MeasurementModel.getActiveForUser(userId);
    if (!measurement) {
      throw new ApiError(404, 'No measurements found. Upload photos to generate an estimate.');
    }
    return measurement;
  },
};
