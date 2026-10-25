'use client';

import { useState } from 'react';

export default function AuthScreen({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // ── Client-side validation ───────────────────────────────────────
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    if (isSignUp && !name) { setError('Please enter your name.'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Please enter a valid email address.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);

    try {
      const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/login';
      const payload = isSignUp
        ? { name: name.trim(), email: email.trim().toLowerCase(), password }
        : { email: email.trim().toLowerCase(), password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || data.status === 'error') {
        setError(data.detail || 'Something went wrong. Please try again.');
        return;
      }

      // ── Persist session in localStorage ─────────────────────────────
      const user = data.user; // { id, name, email }
      localStorage.setItem('sam_user', JSON.stringify(user));
      onLogin(user);
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <div style={styles.wrapper}>
      {/* Animated background */}
      <div style={styles.bgGradient} />
      <div style={styles.bgOrb1} />
      <div style={styles.bgOrb2} />

      {/* Card */}
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <div style={styles.iconRing}>
            <span style={styles.logoIcon}>🌱</span>
          </div>
          <h1 style={styles.logoText}>Smart Agri Monitor</h1>
          <p style={styles.tagline}>Satellite-powered precision agriculture</p>
        </div>

        {/* Tab switcher */}
        <div style={styles.tabs}>
          <button
            type="button"
            onClick={() => { if (isSignUp) switchMode(); }}
            style={{ ...styles.tab, ...(isSignUp ? {} : styles.tabActive) }}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { if (!isSignUp) switchMode(); }}
            style={{ ...styles.tab, ...(!isSignUp ? {} : styles.tabActive) }}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          {isSignUp && (
            <div style={styles.field}>
              <label htmlFor="auth-name" style={styles.label}>Full Name</label>
              <input
                id="auth-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                style={styles.input}
                autoComplete="name"
                disabled={loading}
              />
            </div>
          )}

          <div style={styles.field}>
            <label htmlFor="auth-email" style={styles.label}>Email Address</label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="farmer@example.com"
              style={styles.input}
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="auth-password" style={styles.label}>Password</label>
            <div style={styles.passwordWrap}>
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ ...styles.input, paddingRight: 44 }}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {isSignUp && (
              <p style={styles.hint}>Minimum 6 characters</p>
            )}
          </div>

          {error && (
            <div style={styles.errorBox} role="alert">
              <span style={{ marginRight: 6 }}>⚠️</span>{error}
            </div>
          )}

          <button type="submit" style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? (
              <span style={styles.spinnerWrap}>
                <span style={styles.spinner} />
                {isSignUp ? 'Creating account…' : 'Signing in…'}
              </span>
            ) : (
              isSignUp ? '🚀 Create Account' : '🔓 Log In'
            )}
          </button>
        </form>

        <p style={styles.footer}>
          Powered by Google Earth Engine &amp; Sentinel-2
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes orb1 {
          0%, 100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(30px, -20px) scale(1.08); }
        }
        @keyframes orb2 {
          0%, 100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(-25px, 25px) scale(1.05); }
        }
        #auth-email:focus, #auth-password:focus, #auth-name:focus {
          border-color: #2e7d32 !important;
          box-shadow: 0 0 0 3px rgba(46,125,50,0.12);
        }
      `}</style>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = {
  wrapper: {
    width: '100vw', minHeight: '100dvh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', position: 'relative', overflowY: 'auto',
    padding: '20px 16px', boxSizing: 'border-box',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  bgGradient: {
    position: 'fixed', inset: 0, zIndex: 0,
    background: 'linear-gradient(135deg, #0a3d0a 0%, #1b5e20 40%, #2e7d32 75%, #388e3c 100%)',
  },
  bgOrb1: {
    position: 'fixed', top: '10%', left: '5%', width: 340, height: 340, zIndex: 0,
    borderRadius: '50%', background: 'radial-gradient(circle, rgba(102,187,106,0.25) 0%, transparent 70%)',
    animation: 'orb1 8s ease-in-out infinite',
  },
  bgOrb2: {
    position: 'fixed', bottom: '8%', right: '6%', width: 280, height: 280, zIndex: 0,
    borderRadius: '50%', background: 'radial-gradient(circle, rgba(165,214,167,0.2) 0%, transparent 70%)',
    animation: 'orb2 10s ease-in-out infinite',
  },
  card: {
    position: 'relative', zIndex: 1, width: '100%', maxWidth: 430,
    margin: 'auto', background: 'rgba(255,255,255,0.97)',
    borderRadius: 24, boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
    padding: '36px 28px 28px', backdropFilter: 'blur(12px)',
  },
  logoWrap: { textAlign: 'center', marginBottom: 24 },
  iconRing: {
    width: 64, height: 64, borderRadius: '50%', margin: '0 auto 12px',
    background: 'linear-gradient(135deg, #c8e6c9, #a5d6a7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 16px rgba(46,125,50,0.2)',
  },
  logoIcon: { fontSize: '2rem', lineHeight: 1 },
  logoText: {
    margin: '0 0 4px', fontSize: '1.45rem', fontWeight: 800, color: '#1b5e20',
    letterSpacing: '-0.5px',
  },
  tagline: { margin: 0, fontSize: '0.8rem', color: '#888' },
  tabs: {
    display: 'flex', borderRadius: 12, overflow: 'hidden',
    border: '1.5px solid #e0e0e0', marginBottom: 24,
  },
  tab: {
    flex: 1, padding: '10px 0', fontSize: '0.88rem', fontWeight: 600,
    border: 'none', cursor: 'pointer', background: '#f5f5f5', color: '#999',
    transition: 'all 0.2s',
  },
  tabActive: {
    background: '#2e7d32', color: '#fff',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.15)',
  },
  form: { textAlign: 'left' },
  field: { marginBottom: 16 },
  label: {
    display: 'block', marginBottom: 6, fontSize: '0.78rem', fontWeight: 600,
    color: '#444', letterSpacing: '0.3px',
  },
  input: {
    width: '100%', padding: '11px 14px', fontSize: '0.9rem',
    border: '1.5px solid #e0e0e0', borderRadius: 10, outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s',
    background: '#fafafa', color: '#222',
  },
  passwordWrap: { position: 'relative' },
  eyeBtn: {
    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem',
    padding: '0 4px', lineHeight: 1,
  },
  hint: { margin: '4px 0 0', fontSize: '0.72rem', color: '#aaa' },
  errorBox: {
    margin: '0 0 14px', padding: '10px 14px', borderRadius: 8,
    background: '#fdecea', border: '1px solid #f5c2c2',
    fontSize: '0.82rem', color: '#c62828', display: 'flex', alignItems: 'center',
  },
  submitBtn: {
    width: '100%', padding: '13px', fontSize: '0.95rem', fontWeight: 700,
    background: 'linear-gradient(135deg, #2e7d32, #43a047)',
    color: '#fff', border: 'none', borderRadius: 12,
    cursor: 'pointer', boxShadow: '0 4px 16px rgba(46,125,50,0.4)',
    marginTop: 4, transition: 'opacity 0.2s, transform 0.1s',
    letterSpacing: '0.3px',
  },
  spinnerWrap: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  spinner: {
    display: 'inline-block', width: 16, height: 16,
    border: '2.5px solid rgba(255,255,255,0.35)',
    borderTopColor: '#fff', borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
  footer: {
    marginTop: 24, fontSize: '0.7rem', color: '#bbb', textAlign: 'center',
  },
};
