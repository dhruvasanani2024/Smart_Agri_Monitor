'use client';

import { useState } from 'react';

export default function AuthScreen({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (isSignUp && !name) {
      setError('Please enter your name');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // For now, just store in localStorage and proceed
    const user = { email, name: name || email.split('@')[0] };
    localStorage.setItem('sam_user', JSON.stringify(user));
    onLogin(user);
  };

  return (
    <div style={styles.wrapper}>
      {/* Background gradient */}
      <div style={styles.bgGradient} />

      {/* Floating card */}
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <span style={styles.logoIcon}>🌱</span>
          <h1 style={styles.logoText}>Smart Agri Monitor</h1>
          <p style={styles.tagline}>
            Satellite-powered precision agriculture
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <h2 style={styles.formTitle}>
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>

          {isSignUp && (
            <div style={styles.field}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                style={styles.input}
              />
            </div>
          )}

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="farmer@example.com"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.submitBtn}>
            {isSignUp ? '🚀 Sign Up' : '🔓 Log In'}
          </button>

          <p style={styles.switchText}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
              style={styles.switchBtn}
            >
              {isSignUp ? 'Log In' : 'Sign Up'}
            </button>
          </p>
        </form>

        <p style={styles.footer}>
          Powered by Google Earth Engine &amp; Sentinel-2
        </p>
      </div>
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────────────
const styles = {
  wrapper: {
    width: '100vw', minHeight: '100dvh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', position: 'relative', overflowY: 'auto',
    padding: '20px 16px', boxSizing: 'border-box',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  bgGradient: {
    position: 'fixed', inset: 0, zIndex: 0,
    background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 30%, #43a047 60%, #66bb6a 100%)',
  },
  card: {
    position: 'relative', zIndex: 1, width: '100%', maxWidth: 420,
    margin: 'auto', background: 'rgba(255,255,255,0.98)',
    borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    padding: '32px 24px 24px', textAlign: 'center',
  },
  logoWrap: { marginBottom: 24 },
  logoIcon: { fontSize: '3rem' },
  logoText: {
    margin: '8px 0 0', fontSize: '1.4rem', fontWeight: 800, color: '#2e7d32',
    letterSpacing: '-0.5px',
  },
  tagline: { margin: '4px 0 0', fontSize: '0.82rem', color: '#888' },
  form: { textAlign: 'left' },
  formTitle: {
    margin: '0 0 18px', fontSize: '1.15rem', fontWeight: 700, color: '#333',
    textAlign: 'center',
  },
  field: { marginBottom: 14 },
  label: {
    display: 'block', marginBottom: 4, fontSize: '0.78rem', fontWeight: 600,
    color: '#555',
  },
  input: {
    width: '100%', padding: '10px 14px', fontSize: '0.9rem', border: '1.5px solid #ddd',
    borderRadius: 8, outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  error: {
    margin: '0 0 10px', fontSize: '0.8rem', color: '#d32f2f', textAlign: 'center',
  },
  submitBtn: {
    width: '100%', padding: '12px', fontSize: '0.95rem', fontWeight: 700,
    background: '#2e7d32', color: '#fff', border: 'none', borderRadius: 10,
    cursor: 'pointer', boxShadow: '0 4px 12px rgba(46,125,50,0.35)',
    marginTop: 4,
  },
  switchText: {
    marginTop: 16, fontSize: '0.82rem', color: '#777', textAlign: 'center',
  },
  switchBtn: {
    background: 'none', border: 'none', color: '#1976d2', cursor: 'pointer',
    fontWeight: 600, fontSize: '0.82rem', padding: 0, textDecoration: 'underline',
  },
  footer: {
    marginTop: 20, fontSize: '0.7rem', color: '#aaa',
  },
};
