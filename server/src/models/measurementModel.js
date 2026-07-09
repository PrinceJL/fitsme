import { query } from '../config/db.js';

export const MeasurementModel = {
  async deactivateAllForUser(userId) {
    await query('UPDATE measurements SET is_active = FALSE WHERE user_id = $1', [userId]);
  },

  async create(data) {
    const { rows } = await query(
      `INSERT INTO measurements (
        user_id, height_cm, front_image_path, side_image_path,
        shoulder_width_cm, chest_cm, waist_cm, hip_cm, arm_length_cm, leg_length_cm,
        body_shape, confidence_score, raw_landmarks, is_active
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,TRUE)
      RETURNING id, user_id, height_cm, shoulder_width_cm, chest_cm, waist_cm,
                hip_cm, arm_length_cm, leg_length_cm, body_shape, confidence_score,
                is_active, created_at`,
      [
        data.userId,
        data.heightCm,
        data.frontImagePath,
        data.sideImagePath,
        data.shoulderWidthCm,
        data.chestCm,
        data.waistCm,
        data.hipCm,
        data.armLengthCm,
        data.legLengthCm,
        data.bodyShape,
        data.confidenceScore,
        data.rawLandmarks ? JSON.stringify(data.rawLandmarks) : null,
      ]
    );
    return rows[0];
  },

  async getActiveForUser(userId) {
    const { rows } = await query(
      `SELECT id, user_id, height_cm, shoulder_width_cm, chest_cm, waist_cm,
              hip_cm, arm_length_cm, leg_length_cm, body_shape, confidence_score,
              is_active, created_at
       FROM measurements
       WHERE user_id = $1 AND is_active = TRUE
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    );
    return rows[0] || null;
  },
};
