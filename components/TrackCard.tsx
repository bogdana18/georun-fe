import type { Track, Difficulty } from '@/lib/schemas';

interface TrackCardProps {
  track: Track;
  index: number;
}

const difficultyConfig: Record<
  Difficulty,
  { label: string; className: string; icon: string }
> = {
  easy: { label: 'Easy', className: 'badge badge-easy', icon: '🟢' },
  medium: { label: 'Medium', className: 'badge badge-medium', icon: '🟡' },
  hard: { label: 'Hard', className: 'badge badge-hard', icon: '🔴' },
};

export default function TrackCard({ track, index }: TrackCardProps) {
  const difficulty = difficultyConfig[track.difficulty] || difficultyConfig.easy;
  const distanceKm = (track.distance / 1000).toFixed(1);

  return (
    <div
      className="glass-card"
      style={{
        padding: '24px',
        animation: `fadeInUp 0.4s ease ${index * 0.06}s both`,
      }}
    >
      {/* Header Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <h3
          style={{
            fontSize: '1.05rem',
            fontWeight: 600,
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          {track.title}
        </h3>
        <span className={difficulty.className}>
          {difficulty.icon} {difficulty.label}
        </span>
      </div>

      {/* Stats Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          color: 'var(--muted)',
          fontSize: '0.875rem',
        }}
      >
        {/* Distance */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18" />
            <path d="M8 6h10v10" />
          </svg>
          <span>
            <strong style={{ color: 'var(--foreground)', fontWeight: 600 }}>
              {distanceKm}
            </strong>{' '}
            km
          </span>
        </div>

        {/* Zone */}
        {track.zoneName && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent-secondary)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{track.zoneName}</span>
          </div>
        )}
      </div>
    </div>
  );
}
