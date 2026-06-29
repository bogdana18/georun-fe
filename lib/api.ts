const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

import type { Track, CreateTrackInput } from './schemas';

// ─── Token helpers ────────────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('access_token');
  if (!token || token === 'null' || token === 'undefined') {
    return null;
  }
  return token;
}

export function getRole(): string | null {
  if (typeof window === 'undefined') return null;
  const role = localStorage.getItem('role');
  if (!role || role === 'null' || role === 'undefined') {
    return null;
  }
  return role;
}

export function setAuth(token: string, role: string): void {
  localStorage.setItem('access_token', token);
  localStorage.setItem('role', role);
}

export function clearAuth(): void {
  localStorage.removeItem('access_token');
  localStorage.removeItem('role');
}

// Centralized API fetch wrapper to intercept 401 Unauthorized responses
async function fetchApi(url: string, options: RequestInit = {}): Promise<Response> {
  const res = await fetch(url, options);
  if (res.status === 401) {
    clearAuth();
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }
  return res;
}

// ─── Auth API calls ───────────────────────────────────────────────────────────

export interface AuthResponse {
  access_token: string;
  user: { id: number; email: string; role: string };
}

export async function loginApi(
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetchApi(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `Login failed: ${res.status}`);
  }
  return res.json();
}

export async function registerApi(
  email: string,
  password: string,
  role: 'user' | 'admin' = 'user'
): Promise<{ id: number; email: string; role: string }> {
  const res = await fetchApi(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `Registration failed: ${res.status}`);
  }
  return res.json();
}

// ─── Tracks API calls ─────────────────────────────────────────────────────────

function authHeaders(): HeadersInit {
  const token = getToken();
  if (!token) throw new Error('Not authenticated. Please log in.');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchTracks(): Promise<Track[]> {
  const res = await fetchApi(`${API_BASE}/tracks`, {
    cache: 'no-store',
    headers: authHeaders(),
  });
  if (res.status === 401) {
    throw new Error('Session expired. Please log in again.');
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch tracks: ${res.status}`);
  }
  return res.json();
}

export async function createTrack(data: CreateTrackInput): Promise<Track> {
  const res = await fetchApi(`${API_BASE}/tracks`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (res.status === 401) {
    throw new Error('Session expired. Please log in again.');
  }
  if (res.status === 403) {
    throw new Error('Only admins can create tracks.');
  }
  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(
      errorBody?.message ?? `Failed to create track: ${res.status}`
    );
  }
  return res.json();
}
