import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export const CvServiceClient = {
  /**
   * Sends the uploaded photos + height to the Python CV microservice and
   * returns its parsed estimate. Throws ApiError(502) if the service is
   * unreachable or returns a failure, so the controller doesn't need to
   * know about the CV service's internals.
   */
  async estimateMeasurements({ heightCm, frontImagePath, sideImagePath }) {
    const form = new FormData();
    form.append('height_cm', String(heightCm));
    form.append('front_image', fs.createReadStream(frontImagePath));
    if (sideImagePath) {
      form.append('side_image', fs.createReadStream(sideImagePath));
    }

    let response;
    try {
      response = await axios.post(`${env.cvServiceUrl}/estimate`, form, {
        headers: form.getHeaders(),
        timeout: 30_000,
      });
    } catch (err) {
      throw new ApiError(502, 'Computer vision service is unavailable. Please try again shortly.');
    }

    const data = response.data;
    if (!data.success) {
      throw new ApiError(422, data.error || 'Could not estimate measurements from the provided photos.');
    }

    return data;
  },
};
