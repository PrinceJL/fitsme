export interface Measurement {
  id: string;
  user_id: string;
  height_cm: string;
  shoulder_width_cm: string | null;
  chest_cm: string | null;
  waist_cm: string | null;
  hip_cm: string | null;
  arm_length_cm: string | null;
  leg_length_cm: string | null;
  body_shape: string | null;
  confidence_score: string | null;
  is_active: boolean;
  created_at: string;
}

export interface UploadMeasurementResponse {
  measurement: Measurement;
  warnings: string[];
}
