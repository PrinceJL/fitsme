import { z } from 'zod';

export const uploadMeasurementSchema = z.object({
  body: z.object({
    heightCm: z
      .string()
      .regex(/^\d+(\.\d+)?$/, 'heightCm must be a number')
      .transform(Number)
      .refine((val) => val > 50 && val < 250, 'heightCm must be between 50 and 250'),
  }),
});
