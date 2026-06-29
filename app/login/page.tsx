'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginApi, registerApi, setAuth, getToken } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getToken()) router.replace('/');
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        const data = await loginApi(email, password);
        setAuth(data.access_token, data.user.role);
        router.push('/');
      } else {
        await registerApi(email, password, role);
        const data = await loginApi(email, password);
        setAuth(data.access_token, data.user.role);
        router.push('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .login-bg {
          min-height: 100vh;
          background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.18) 0%, transparent 60%),
                      radial-gradient(ellipse 50% 40% at 80% 100%, rgba(168,85,247,0.12) 0%, transparent 60%),
                      #0c0e14;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          font-family: 'Inter', sans-serif;
        }
        .login-card {
          width: 100%;
          max-width: 420px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 40px 36px;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow: 0 24px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06);
        }
        .login-logo {
          width: 48px; height: 48px;
          border-radius: 14px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          display: flex; align-items: center; justify-content: center;
          font-size: 24px;
          margin: 0 auto 20px;
          box-shadow: 0 8px 24px rgba(99,102,241,0.35);
        }
        .login-title {
          text-align: center;
          font-size: 1.6rem;
          font-weight: 700;
          margin: 0 0 4px;
          background: linear-gradient(135deg, #e0e0ff, #fff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .login-subtitle {
          text-align: center;
          color: rgba(255,255,255,0.45);
          font-size: 0.875rem;
          margin: 0 0 32px;
        }
        .tab-row {
          display: flex;
          background: rgba(255,255,255,0.05);
          border-radius: 10px;
          padding: 4px;
          margin-bottom: 28px;
          gap: 4px;
        }
        .tab-btn {
          flex: 1;
          padding: 8px;
          border-radius: 7px;
          border: none;
          background: transparent;
          color: rgba(255,255,255,0.45);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        .tab-btn.active {
          background: rgba(99,102,241,0.25);
          color: #a5b4fc;
          font-weight: 600;
        }
        .form-group {
          margin-bottom: 18px;
        }
        .form-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: rgba(255,255,255,0.6);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }
        .form-input {
          width: 100%;
          padding: 11px 14px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: #fff;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .form-input:focus {
          border-color: rgba(99,102,241,0.6);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }
        .form-input::placeholder { color: rgba(255,255,255,0.25); }
        .form-select {
          width: 100%;
          padding: 11px 14px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: #fff;
          font-size: 0.9rem;
          outline: none;
          cursor: pointer;
          box-sizing: border-box;
        }
        .form-select option { background: #1a1b2e; }
        .error-box {
          background: rgba(248,113,113,0.1);
          border: 1px solid rgba(248,113,113,0.3);
          border-radius: 10px;
          padding: 11px 14px;
          font-size: 0.85rem;
          color: #fca5a5;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .submit-btn {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.1s, box-shadow 0.2s;
          box-shadow: 0 4px 16px rgba(99,102,241,0.3);
          position: relative;
          overflow: hidden;
        }
        .submit-btn:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(99,102,241,0.4);
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .divider {
          display: flex; align-items: center; gap: 12px;
          margin: 24px 0; color: rgba(255,255,255,0.2); font-size: 0.8rem;
        }
        .divider::before, .divider::after {
          content: ''; flex: 1;
          height: 1px; background: rgba(255,255,255,0.08);
        }
        .demo-hint {
          text-align: center;
          font-size: 0.75rem;
          color: rgba(255,255,255,0.3);
          line-height: 1.6;
        }
        .demo-hint strong { color: rgba(255,255,255,0.5); }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="login-bg">
        <div className="login-card">
          {/* Logo */}
          <div className="login-logo">🏃</div>
          <h1 className="login-title">GeoRun</h1>
          <p className="login-subtitle">
            {mode === 'login' ? 'Welcome back! Sign in to your account.' : 'Create a new account to get started.'}
          </p>

          {/* Mode tabs */}
          <div className="tab-row" role="tablist">
            <button
              id="tab-login"
              role="tab"
              aria-selected={mode === 'login'}
              className={`tab-btn${mode === 'login' ? ' active' : ''}`}
              onClick={() => { setMode('login'); setError(null); }}
            >
              Sign In
            </button>
            <button
              id="tab-register"
              role="tab"
              aria-selected={mode === 'register'}
              className={`tab-btn${mode === 'register' ? ' active' : ''}`}
              onClick={() => { setMode('register'); setError(null); }}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form id="auth-form" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="form-group">
              <label htmlFor="login-email" className="form-label">Email</label>
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="login-password" className="form-label">Password</label>
              <input
                id="login-password"
                type="password"
                placeholder={mode === 'login' ? '••••••••' : 'At least 6 characters'}
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
              />
            </div>

            {/* Role selector (register only) */}
            {mode === 'register' && (
              <div className="form-group">
                <label htmlFor="register-role" className="form-label">Account Role</label>
                <select
                  id="register-role"
                  className="form-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
                >
                  <option value="user">User — can view tracks</option>
                  <option value="admin">Admin — can create tracks</option>
                </select>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="error-box" role="alert" id="auth-error">
                <span>⚠️</span>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              id="auth-submit"
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                    style={{ animation: 'spin 0.8s linear infinite' }}>
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.3"
                      strokeWidth="2" fill="none" />
                    <path d="M14 8a6 6 0 00-6-6" stroke="currentColor"
                      strokeWidth="2" strokeLinecap="round" fill="none" />
                  </svg>
                  {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                </span>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Demo hint */}
          <div className="divider">or</div>
          <div className="demo-hint">
            <strong>Quick demo:</strong> Register with <strong>admin</strong> role<br />
            to unlock the ability to create new tracks.
          </div>
        </div>
      </div>
    </>
  );
}
