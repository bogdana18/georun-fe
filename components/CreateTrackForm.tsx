'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTrackSchema, type CreateTrackInput } from '@/lib/schemas';
import { createTrack } from '@/lib/api';
import { useState } from 'react';
import dynamic from 'next/dynamic';

const RouteMap = dynamic(() => import('@/components/RouteMap'), {
  ssr: false,
  loading: () => (
    <div
      className="w-full rounded-lg"
      style={{
        height: '400px',
        background: 'var(--input-bg)',
        border: '1px solid var(--input-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--muted)',
        fontSize: '0.875rem',
      }}
    >
      Loading map…
    </div>
  ),
});

interface CreateTrackFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CreateTrackForm({
  onSuccess,
  onCancel,
}: CreateTrackFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateTrackInput>({
    resolver: zodResolver(createTrackSchema),
    defaultValues: {
      title: '',
      difficulty: undefined,
      coordinates: [],
    },
  });

  const onSubmit = async (data: CreateTrackInput) => {
    setSubmitError(null);
    try {
      await createTrack(data);
      onSuccess();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Something went wrong'
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Title */}
        <div>
          <label htmlFor="track-title" className="form-label">
            Track Title
          </label>
          <input
            id="track-title"
            type="text"
            placeholder="e.g. Morning Run Along the River"
            className={`input-field ${errors.title ? 'error' : ''}`}
            {...register('title')}
          />
          {errors.title && (
            <p className="form-error">{errors.title.message}</p>
          )}
        </div>

        {/* Difficulty */}
        <div>
          <label htmlFor="track-difficulty" className="form-label">
            Difficulty
          </label>
          <select
            id="track-difficulty"
            className={`select-field ${errors.difficulty ? 'error' : ''}`}
            defaultValue=""
            {...register('difficulty')}
          >
            <option value="" disabled>
              Select difficulty...
            </option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          {errors.difficulty && (
            <p className="form-error">{errors.difficulty.message}</p>
          )}
        </div>

        {/* Route Map */}
        <div>
          <label className="form-label">
            Draw Route
          </label>
          <Controller
            name="coordinates"
            control={control}
            render={({ field }) => (
              <RouteMap
                coordinates={(field.value ?? []) as [number, number][]}
                onChange={(coords) => field.onChange(coords)}
              />
            )}
          />
          {errors.coordinates && (
            <p className="form-error">{errors.coordinates.message}</p>
          )}
        </div>

        {/* Submit Error */}
        {submitError && (
          <div
            style={{
              background: 'rgba(248, 113, 113, 0.1)',
              border: '1px solid rgba(248, 113, 113, 0.3)',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '0.85rem',
              color: 'var(--error)',
            }}
          >
            {submitError}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '4px' }}>
          <button type="button" className="btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  style={{ animation: 'spin 1s linear infinite' }}
                >
                  <circle
                    cx="8"
                    cy="8"
                    r="6"
                    stroke="currentColor"
                    strokeOpacity="0.3"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M14 8a6 6 0 00-6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
                Creating...
              </span>
            ) : (
              'Create Track'
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </form>
  );
}
