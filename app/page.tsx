'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically load both components on client only (Leaflet needs `window`)
const MapWithNoSSR = dynamic(() => import('./components/MapComponent.js'), {
  ssr: false,
  loading: () => (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      height: '100vh', background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '2rem', marginBottom: 8 }}>🌍</p>
        <p style={{ fontSize: '1rem', color: '#2e7d32', fontWeight: 600 }}>Loading Satellite Map…</p>
      </div>
    </div>
  ),
});

const AuthScreen = dynamic(() => import('./components/AuthScreen.js'), {
  ssr: false,
  loading: () => (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      height: '100vh', background: '#1b5e20',
    }}>
      <p style={{ color: '#fff', fontFamily: 'sans-serif' }}>Loading…</p>
    </div>
  ),
});

export default function Home() {
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  // Check for existing session
  useEffect(() => {
    try {
      const stored = localStorage.getItem('sam_user');
      if (stored) setUser(JSON.parse(stored));
    } catch {
      // ignore
    }
    setCheckingAuth(false);
  }, []);

  const handleLogin = (u: { email: string; name?: string }) => {
    setUser(u);
  };

  const handleLogout = () => {
    localStorage.removeItem('sam_user');
    setUser(null);
  };

  if (checkingAuth) {
    return (
      <div
        suppressHydrationWarning
        style={{
          width: '100vw', height: '100vh', display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: '#1b5e20',
        }}
      >
        <p style={{ color: '#fff', fontFamily: 'sans-serif', fontSize: '1.1rem' }}>🌱 Loading…</p>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <main style={{ width: '100vw', height: '100dvh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <MapWithNoSSR onLogout={handleLogout} userEmail={user.email} />
    </main>
  );
}