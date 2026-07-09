import { apiClient } from './apiClient';
import type { Measurement, UploadMeasurementResponse } from '../types/measurement';

export const MeasurementApi = {
  async upload(
    heightCm: number,
    frontImage: File,
    sideImage?: File
  ): Promise<UploadMeasurementResponse> {
    const form = new FormData();
    form.append('heightCm', String(heightCm));
    form.append('frontImage', frontImage);
    if (sideImage) {
      form.append('sideImage', sideImage);
    }

    const { data } = await apiClient.post<UploadMeasurementResponse>(
      '/measurements/upload',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return data;
  },

  async getCurrent(): Promise<Measurement> {
    const { data } = await apiClient.get<{ measurement: Measurement }>('/measurements/current');
    return data.measurement;
  },
};
