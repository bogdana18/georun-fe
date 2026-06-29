'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Track } from '@/lib/schemas';
import { fetchTracks, getToken, getRole, clearAuth } from '@/lib/api';
import TrackCard from '@/components/TrackCard';
import Modal from '@/components/Modal';
import CreateTrackForm from '@/components/CreateTrackForm';

export default function DashboardPage() {
  const router = useRouter();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // ── Auth guard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace('/login');
      return;
    }
    setRole(getRole());
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserEmail(payload.email ?? null);
    } catch {

    }
  }, [router]);

  const loadTracks = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await fetchTracks();
      setTracks(data);
      setLoading(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load tracks';
      if (
        msg.toLowerCase().includes('session expired') ||
        msg.toLowerCase().includes('not authenticated') ||
        msg.toLowerCase().includes('log in')
      ) {
        // Redirection is handled centrally in the API client,
        // so we return early and keep the loading state to avoid UI flashes/stuttering.
        return;
      }
      setError(msg);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (getToken()) loadTracks();
  }, [loadTracks]);

  const handleTrackCreated = () => {
    setModalOpen(false);
    loadTracks();
  };

  const handleLogout = () => {
    clearAuth();
    router.replace('/login');
  };

  const isAdmin = role === 'admin';

  return (
    <>
      {/* Mesh background */}
      <div className="bg-mesh" />

      {/* Header */}
      <header
        style={{
          borderBottom: '1px solid var(--card-border)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: 'rgba(12, 14, 20, 0.8)',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo + title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}
            >
              🏃
            </div>
            <div>
              <h1
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  margin: 0,
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                GeoRun
              </h1>
              <p
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--muted)',
                  margin: 0,
                  marginTop: '1px',
                }}
              >
                Track your running routes
              </p>
            </div>
          </div>

          {/* Right side: user info + actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Role badge */}
            {role && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  background: isAdmin
                    ? 'rgba(99,102,241,0.15)'
                    : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${isAdmin ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  color: isAdmin ? '#a5b4fc' : 'var(--muted)',
                }}
              >
                <span style={{ fontSize: '10px' }}>
                  {isAdmin ? '⚡' : '👤'}
                </span>
                {userEmail
                  ? `${userEmail} · ${role}`
                  : role}
              </div>
            )}

            {/* New Track button — only shown to admins */}
            {isAdmin && (
              <button
                id="open-create-modal"
                className="btn-primary"
                onClick={() => setModalOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 3v10M3 8h10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                New Track
              </button>
            )}

            {/* Logout */}
            <button
              id="logout-btn"
              className="btn-ghost"
              onClick={handleLogout}
              style={{ fontSize: '0.8rem', padding: '8px 14px' }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '32px 24px 64px',
        }}
      >
        {/* Stats Bar */}
        {!loading && !error && tracks.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: '24px',
              marginBottom: '32px',
              color: 'var(--muted)',
              fontSize: '0.875rem',
            }}
          >
            <span>
              <strong style={{ color: 'var(--foreground)', fontSize: '1.1rem' }}>
                {tracks.length}
              </strong>{' '}
              {tracks.length === 1 ? 'track' : 'tracks'}
            </span>
            <span>
              <strong style={{ color: 'var(--foreground)', fontSize: '1.1rem' }}>
                {(tracks.reduce((sum, t) => sum + t.distance, 0) / 1000).toFixed(1)}
              </strong>{' '}
              km total
            </span>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '20px',
            }}
          >
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: '120px' }} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="glass-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⚠️</div>
            <p style={{ color: 'var(--error)', marginBottom: '16px' }}>{error}</p>
            <button className="btn-ghost" onClick={loadTracks}>
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && tracks.length === 0 && (
          <div className="empty-state">
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🗺️</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>
              No tracks yet
            </h2>
            <p
              style={{
                color: 'var(--muted)',
                marginBottom: '24px',
                maxWidth: '360px',
                margin: '0 auto 24px',
              }}
            >
              {isAdmin
                ? 'Start by adding your first running track. Track your routes, measure distances, and monitor difficulty.'
                : 'No tracks have been added yet. Ask an admin to create some routes.'}
            </p>
            {isAdmin && (
              <button
                className="btn-primary"
                onClick={() => setModalOpen(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 3v10M3 8h10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                Add First Track
              </button>
            )}
          </div>
        )}

        {/* Track Cards Grid */}
        {!loading && !error && tracks.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '20px',
            }}
          >
            {tracks.map((track, i) => (
              <TrackCard key={track.id} track={track} index={i} />
            ))}
          </div>
        )}
      </main>

      {/* Create Track Modal — admin only */}
      {isAdmin && (
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Create New Track"
        >
          <CreateTrackForm
            onSuccess={handleTrackCreated}
            onCancel={() => setModalOpen(false)}
          />
        </Modal>
      )}
    </>
  );
}
