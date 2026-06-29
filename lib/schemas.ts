import { z } from 'zod';

export const createTrackSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be under 100 characters'),
  difficulty: z.enum(['easy', 'medium', 'hard'], {
    error: 'Select a difficulty level',
  }),
  coordinates: z
    .array(z.array(z.number()).length(2))
    .min(2, 'Route must have at least 2 points'),
});

export type CreateTrackInput = z.infer<typeof createTrackSchema>;

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Track {
  id: number;
  title: string;
  distance: number;
  difficulty: Difficulty;
  zoneName: string | null;
}
