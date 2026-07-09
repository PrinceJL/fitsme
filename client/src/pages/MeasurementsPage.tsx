import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MeasurementApi } from '../services/measurementApi';
import type { Measurement } from '../types/measurement';

export default function MeasurementsPage() {
  const [heightCm, setHeightCm] = useState('');
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [sideImage, setSideImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [measurement, setMeasurement] = useState<Measurement | null>(null);
  const [isLoadingExisting, setIsLoadingExisting] = useState(true);

  useEffect(() => {
    MeasurementApi.getCurrent()
      .then(setMeasurement)
      .catch(() => setMeasurement(null))
      .finally(() => setIsLoadingExisting(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setWarnings([]);

    if (!frontImage) {
      setError('A front-facing photo is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await MeasurementApi.upload(Number(heightCm), frontImage, sideImage || undefined);
      setMeasurement(result.measurement);
      setWarnings(result.warnings);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Could not process photos. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-full bg-gray-50">
      <header className="flex items-center justify-between border-b bg-white px-8 py-4">
        <Link to="/dashboard" className="text-lg font-semibold text-brand-600">
          FitsMe
        </Link>
        <Link to="/dashboard" className="text-sm text-gray-500 hover:text-gray-800">
          Back to dashboard
        </Link>
      </header>

      <main className="mx-auto max-w-xl px-8 py-12">
        <h2 className="text-xl font-semibold text-gray-900">Body measurements</h2>
        <p className="mt-1 text-sm text-gray-500">
          Upload a front photo (required) and a side photo (recommended, improves chest/waist
          accuracy). These are estimates, not medical-grade measurements.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Height (cm)</label>
            <input
              type="number"
              required
              min={50}
              max={250}
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Front photo</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required
              onChange={(e) => setFrontImage(e.target.files?.[0] || null)}
              className="w-full text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Side photo <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setSideImage(e.target.files?.[0] || null)}
              className="w-full text-sm"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Analyzing photos…' : 'Estimate measurements'}
          </button>
        </form>

        {warnings.length > 0 && (
          <div className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-medium">Heads up:</p>
            <ul className="mt-1 list-inside list-disc">
              {warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        {!isLoadingExisting && measurement && (
          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Latest results</h3>
              {measurement.confidence_score && (
                <span className="rounded-full bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700">
                  {Math.round(Number(measurement.confidence_score) * 100)}% confidence
                </span>
              )}
            </div>
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <MeasurementRow label="Shoulder width" value={measurement.shoulder_width_cm} />
              <MeasurementRow label="Chest" value={measurement.chest_cm} />
              <MeasurementRow label="Waist" value={measurement.waist_cm} />
              <MeasurementRow label="Hip" value={measurement.hip_cm} />
              <MeasurementRow label="Arm length" value={measurement.arm_length_cm} />
              <MeasurementRow label="Leg length" value={measurement.leg_length_cm} />
              <div>
                <dt className="text-gray-500">Body shape</dt>
                <dd className="font-medium capitalize text-gray-900">
                  {measurement.body_shape?.replace('_', ' ') || '—'}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </main>
    </div>
  );
}

function MeasurementRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium text-gray-900">{value ? `${value} cm` : '—'}</dd>
    </div>
  );
}
