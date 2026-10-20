'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, FeatureGroup, Marker, Popup, useMap } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

// Fix default Leaflet marker icon issue in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ── Tile layer definitions ──────────────────────────────────────────
const TILE_LAYERS = {
  street: {
    label: 'Street',
    emoji: '🗺️',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  satellite: {
    label: 'Satellite',
    emoji: '🛰️',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, Maxar, Earthstar Geographics',
  },
  terrain: {
    label: 'Terrain',
    emoji: '⛰️',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
  },
};

// ── Analysis definitions with legend items ──────────────────────────
const ANALYSES = [
  {
    key: 'ndvi', label: 'NDVI – Crop Health', emoji: '🌿', color: '#2e7d32',
    description: 'Chlorophyll vitality & green crop density',
    legend: [
      { bg: '#1a9850', text: 'Excellent Health' },
      { bg: '#66bd63', text: 'Good Growth' },
      { bg: '#a6d96a', text: 'Moderate' },
      { bg: '#fee08b', text: 'Sparse / Weak' },
      { bg: '#d73027', text: 'Bare Soil / Dead' },
    ],
  },
  {
    key: 'ndwi', label: 'NDWI – Water Bodies', emoji: '💧', color: '#1976d2',
    description: 'Open surface water & standing ponds',
    legend: [
      { bg: '#2c7bb6', text: 'Water Body' },
      { bg: '#7fcdbb', text: 'Wet / Flooded' },
      { bg: '#ffffbf', text: 'Low Moisture' },
      { bg: '#f46d43', text: 'Dry Land' },
      { bg: '#d7191c', text: 'Very Dry' },
    ],
  },
  {
    key: 'mndwi', label: 'MNDWI – Modified Water', emoji: '🌊', color: '#0288d1',
    description: 'Built-up / farm runoff & canal detection',
    legend: [
      { bg: '#2c7bb6', text: 'Water Detected' },
      { bg: '#7fcdbb', text: 'Shallow Water' },
      { bg: '#ffffbf', text: 'Mixed / Canal' },
      { bg: '#f46d43', text: 'Mostly Dry' },
      { bg: '#d7191c', text: 'No Water' },
    ],
  },
  {
    key: 'ndmi', label: 'NDMI – Soil Moisture', emoji: '💦', color: '#00796b',
    description: 'Crop water stress & soil moisture levels',
    legend: [
      { bg: '#1a9850', text: 'Well Irrigated' },
      { bg: '#66bd63', text: 'Good Moisture' },
      { bg: '#fee08b', text: 'Moderate' },
      { bg: '#f46d43', text: 'Dry Soil' },
      { bg: '#d73027', text: 'Needs Irrigation' },
    ],
  },
  {
    key: 'salinity', label: 'Salinity Index', emoji: '🧂', color: '#e65100',
    description: 'White salt deposits & soil degradation',
    legend: [
      { bg: '#d73027', text: 'High Salt' },
      { bg: '#fc8d59', text: 'Moderate Salt' },
      { bg: '#fee090', text: 'Mild Salt' },
      { bg: '#e0e0e0', text: 'Low Salt' },
      { bg: '#f7f7f7', text: 'Normal Soil' },
    ],
  },
  {
    key: 'nbr', label: 'NBR – Burn Ratio', emoji: '🔥', color: '#bf360c',
    description: 'Stubble burn tracking & fire severity',
    legend: [
      { bg: '#1a9850', text: 'Healthy Land' },
      { bg: '#a6d96a', text: 'Recovering' },
      { bg: '#fee08b', text: 'Low Severity' },
      { bg: '#f46d43', text: 'Moderate Burn' },
      { bg: '#d73027', text: 'Severe Burn' },
    ],
  },
  {
    key: 'true_color', label: 'True Colour Composite', emoji: '🛰️', color: '#546e7a',
    description: 'Sentinel-2 natural photo-like visual',
    legend: null,
  },
];

// ── Hook: detect mobile viewport ────────────────────────────────────
function useIsMobile(breakpoint = 840) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint]);
  return isMobile;
}

// ── Helper: fly the map to a new centre ─────────────────────────────
function FlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom ?? 16, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

export default function MapComponent({ onLogout, userEmail }) {
  const isMobile = useIsMobile();
  const [baseLayer, setBaseLayer] = useState('street');
  const [flyTarget, setFlyTarget] = useState(null);
  const [position, setPosition] = useState([23.0225, 72.5714]);
  const [polygonCoords, setPolygonCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState('ndvi');
  const [eeLayerUrl, setEeLayerUrl] = useState(null);
  const [analysisLabel, setAnalysisLabel] = useState('');
  // Show side drawer: closed by default on mobile, open on desktop
  const [showDrawer, setShowDrawer] = useState(false);
  const [locating, setLocating] = useState(false);
  const [showDrawHint, setShowDrawHint] = useState(true);
  const [savedFarms, setSavedFarms] = useState([]);
  const [savingFarm, setSavingFarm] = useState(false);

  // Set initial drawer visibility on mount
  useEffect(() => {
    if (window.innerWidth >= 840) {
      setShowDrawer(true);
    }
  }, []);

  // Hide draw hint once user draws a polygon
  useEffect(() => {
    if (polygonCoords) setShowDrawHint(false);
  }, [polygonCoords]);

  // ── Load saved farms from MongoDB on mount ────────────────────────
  useEffect(() => {
    if (!userEmail) return;
    fetch(`/api/farms/${encodeURIComponent(userEmail)}`)
      .then(r => r.json())
      .then(data => {
        if (data.status === 'success') setSavedFarms(data.farms || []);
      })
      .catch(() => {});
  }, [userEmail]);

  // ── Save current farm boundary ────────────────────────────────────
  const handleSaveFarm = useCallback(async () => {
    if (!polygonCoords || !userEmail) return;
    const name = prompt('Enter a name for this farm boundary:');
    if (!name || !name.trim()) return;
    setSavingFarm(true);
    try {
      const res = await fetch('/api/farms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail, farmName: name.trim(), coordinates: polygonCoords }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setSavedFarms(prev => [data.farm, ...prev]);
        alert('Farm boundary saved successfully! ✅');
      } else {
        alert(data.detail || 'Could not save farm boundary.');
      }
    } catch {
      alert('Failed to connect to database. Please check your MongoDB setup.');
    } finally {
      setSavingFarm(false);
    }
  }, [polygonCoords, userEmail]);

  // ── Load a saved farm boundary onto the map ───────────────────────
  const handleLoadFarm = useCallback((farm) => {
    setPolygonCoords(farm.coordinates);
    setEeLayerUrl(null);
    setAnalysisLabel('');
    if (farm.coordinates && farm.coordinates.length > 0) {
      const lats = farm.coordinates.map(c => c[1]);
      const lngs = farm.coordinates.map(c => c[0]);
      const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
      const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
      setPosition([centerLat, centerLng]);
      setFlyTarget([centerLat, centerLng]);
    }
    if (isMobile) setShowDrawer(false);
  }, [isMobile]);

  // ── Delete a saved farm ───────────────────────────────────────────
  const handleDeleteFarm = useCallback(async (farmId) => {
    if (!confirm('Delete this saved farm boundary?')) return;
    try {
      await fetch(`/api/farms?id=${farmId}`, { method: 'DELETE' });
      setSavedFarms(prev => prev.filter(f => f._id !== farmId));
    } catch {
      alert('Failed to delete farm.');
    }
  }, []);

  // ── GPS location ──────────────────────────────────────────────────
  const handleGetLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        setFlyTarget([latitude, longitude]);
        setLocating(false);
        if (isMobile) setShowDrawer(false);
      },
      () => {
        alert('Could not access GPS location. Check browser location permissions.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }, [isMobile]);

  // ── Polygon events ────────────────────────────────────────────────
  const handleCreated = useCallback((e) => {
    const geoJsonData = e.layer.toGeoJSON();
    setPolygonCoords(geoJsonData.geometry.coordinates[0]);
    setEeLayerUrl(null);
    setAnalysisLabel('');
  }, []);

  const handleDeleted = useCallback(() => {
    setPolygonCoords(null);
    setEeLayerUrl(null);
    setAnalysisLabel('');
    setShowDrawHint(true);
  }, []);

  // ── Run analysis ──────────────────────────────────────────────────
  const handleAnalyze = useCallback(async () => {
    if (!polygonCoords) {
      alert('Please draw a farm boundary polygon first using the tool on the top right!');
      return;
    }
    setLoading(true);
    setEeLayerUrl(null);
    setAnalysisLabel('');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coordinates: polygonCoords, analysis: activeAnalysis }),
      });

      const raw = await response.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        alert(`Backend error (HTTP ${response.status}). Check Vercel server logs.`);
        return;
      }

      if (!response.ok || data.status !== 'success') {
        const detail = typeof data.detail === 'string'
          ? data.detail
          : JSON.stringify(data.detail ?? data.error ?? data);
        alert('Analysis Error: ' + detail);
        return;
      }

      setEeLayerUrl(data.tile_url);
      setAnalysisLabel(data.label || '');
      // Auto-close drawer on mobile so user sees the satellite analysis map
      if (isMobile) setShowDrawer(false);
    } catch (err) {
      console.error(err);
      alert('Failed to connect to backend service. Is `vercel dev` running?');
    } finally {
      setLoading(false);
    }
  }, [polygonCoords, activeAnalysis, isMobile]);

  const tile = TILE_LAYERS[baseLayer];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      
      {/* ══════════════════════════════════════════════════════════════
          1. TOP NAVIGATION BAR (Fixed at top, mobile responsive)
          ══════════════════════════════════════════════════════════════ */}
      <header
        style={{
          height: 56,
          background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          color: '#ffffff',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          zIndex: 2000,
          flexShrink: 0,
        }}
      >
        {/* Left: 3-line Hamburger Menu Button + Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setShowDrawer(prev => !prev)}
            aria-label="Toggle navigation drawer"
            title="Open Menu"
            style={{
              width: 40,
              height: 40,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 5,
              background: showDrawer ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 8,
              cursor: 'pointer',
              padding: 0,
              transition: 'background 0.2s ease',
            }}
          >
            {/* 3 lines for the hamburger icon */}
            <span style={{ width: 20, height: 2.5, background: '#ffffff', borderRadius: 2 }} />
            <span style={{ width: 20, height: 2.5, background: '#ffffff', borderRadius: 2 }} />
            <span style={{ width: 20, height: 2.5, background: '#ffffff', borderRadius: 2 }} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '1.25rem' }}>🌱</span>
            <span style={{ fontWeight: 700, fontSize: isMobile ? '0.95rem' : '1.1rem', letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>
              Smart Agri Monitor
            </span>
          </div>
        </div>

        {/* Right: GPS Location + User / Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={handleGetLocation}
            disabled={locating}
            title="Find My Location"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: isMobile ? '6px 10px' : '7px 12px',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: locating ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.18)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 20,
              cursor: locating ? 'wait' : 'pointer',
            }}
          >
            <span>📍</span>
            <span style={{ display: isMobile ? 'none' : 'inline' }}>
              {locating ? 'Locating…' : 'GPS'}
            </span>
          </button>

          {userEmail && (
            <div
              title={userEmail}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(0,0,0,0.2)',
                padding: '4px 8px',
                borderRadius: 20,
                fontSize: '0.75rem',
                maxWidth: isMobile ? 110 : 200,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              <span>👤</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {userEmail.split('@')[0]}
              </span>
            </div>
          )}

          {onLogout && (
            <button
              onClick={onLogout}
              title="Log Out"
              style={{
                padding: isMobile ? '6px 10px' : '6px 12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: '#d32f2f',
                color: '#ffffff',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Logout
            </button>
          )}
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════
          2. BACKDROP OVERLAY (Mobile tap outside to close)
          ══════════════════════════════════════════════════════════════ */}
      {showDrawer && isMobile && (
        <div
          onClick={() => setShowDrawer(false)}
          style={{
            position: 'fixed',
            top: 56,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(2px)',
            zIndex: 2400,
            transition: 'opacity 0.25s ease',
          }}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════
          3. LEFT SLIDING DRAWER PANEL (Slides in from the left)
          ══════════════════════════════════════════════════════════════ */}
      <aside
        style={{
          position: 'fixed',
          top: 56,
          left: 0,
          bottom: 0,
          width: isMobile ? 'min(340px, 86vw)' : 340,
          height: 'calc(100% - 56px)',
          background: '#ffffff',
          boxShadow: showDrawer ? '4px 0 24px rgba(0,0,0,0.2)' : 'none',
          transform: showDrawer ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
          zIndex: 2500,
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid #e0e0e0',
          overflow: 'hidden',
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '14px 16px',
            background: '#f8fdf8',
            borderBottom: '1px solid #e8f5e9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1b5e20' }}>
              Control Panel
            </div>
            <div style={{ fontSize: '0.72rem', color: '#666', marginTop: 2 }}>
              {userEmail ? `Logged in: ${userEmail}` : 'Select tools & analysis'}
            </div>
          </div>
          <button
            onClick={() => setShowDrawer(false)}
            aria-label="Close panel"
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#eeeeee',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#555',
            }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Drawer Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {/* Quick GPS button */}
          <button
            onClick={handleGetLocation}
            disabled={locating}
            style={{
              width: '100%',
              padding: '12px',
              background: locating ? '#90caf9' : '#1976d2',
              color: '#ffffff',
              border: 'none',
              borderRadius: 8,
              cursor: locating ? 'wait' : 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 2px 8px rgba(25,118,210,0.25)',
            }}
          >
            <span>📍</span>
            <span>{locating ? 'Finding Your GPS…' : 'Find My Farm Location'}</span>
          </button>

          {/* Farm Boundary Status Card */}
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              background: polygonCoords ? '#e8f5e9' : '#fff3e0',
              border: polygonCoords ? '1px solid #a5d6a7' : '1px solid #ffe0b2',
              fontSize: '0.78rem',
            }}
          >
            <div style={{ fontWeight: 600, color: polygonCoords ? '#2e7d32' : '#e65100', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>{polygonCoords ? '✅' : '✏️'}</span>
              <span>{polygonCoords ? 'Farm Boundary Marked' : 'No Boundary Drawn'}</span>
            </div>
            <div style={{ color: '#555', marginTop: 4, lineHeight: 1.4 }}>
              {polygonCoords
                ? `${polygonCoords.length} corner points traced. Ready for analysis!`
                : 'Tap the polygon (⬟) tool on top-right of map to outline your field.'}
            </div>
          </div>

          {/* Base Map Layer Picker */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#333', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, display: 'block' }}>
              Base Map View
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {Object.entries(TILE_LAYERS).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setBaseLayer(key)}
                  style={{
                    padding: '8px 4px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    border: baseLayer === key ? '2px solid #2e7d32' : '1px solid #ddd',
                    borderRadius: 8,
                    cursor: 'pointer',
                    background: baseLayer === key ? '#e8f5e9' : '#ffffff',
                    color: baseLayer === key ? '#2e7d32' : '#555',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>{val.emoji}</span>
                  <span>{val.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Analysis Type Selector */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#333', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, display: 'block' }}>
              Satellite Analysis (Sentinel-2)
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {ANALYSES.map((a) => {
                const isSelected = activeAnalysis === a.key;
                return (
                  <button
                    key={a.key}
                    onClick={() => setActiveAnalysis(a.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: isSelected ? `2px solid ${a.color}` : '1px solid #e0e0e0',
                      background: isSelected ? `${a.color}12` : '#ffffff',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ fontSize: '1.25rem', marginTop: 1 }}>{a.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.82rem', color: isSelected ? a.color : '#333' }}>
                        {a.label}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#666', marginTop: 2 }}>
                        {a.description}
                      </div>
                    </div>
                    {isSelected && (
                      <span style={{ color: a.color, fontWeight: 'bold', fontSize: '0.9rem' }}>✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action: Run Analysis */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={handleAnalyze}
              disabled={loading || !polygonCoords}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '0.95rem',
                fontWeight: 700,
                background: polygonCoords && !loading ? '#2e7d32' : '#bdbdbd',
                color: '#ffffff',
                border: 'none',
                borderRadius: 8,
                cursor: polygonCoords && !loading ? 'pointer' : 'not-allowed',
                boxShadow: polygonCoords ? '0 4px 12px rgba(46,125,50,0.35)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <span>{loading ? '⏳' : '🛰️'}</span>
              <span>{loading ? 'Processing Satellite Data…' : 'Run Field Analysis'}</span>
            </button>

            {/* Save Farm Boundary Button */}
            {polygonCoords && (
              <button
                onClick={handleSaveFarm}
                disabled={savingFarm}
                style={{
                  width: '100%',
                  padding: '11px',
                  background: savingFarm ? '#90caf9' : '#0288d1',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  cursor: savingFarm ? 'wait' : 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <span>💾</span>
                <span>{savingFarm ? 'Saving to Database…' : 'Save Farm Boundary'}</span>
              </button>
            )}
          </div>

          {/* Overlay Status Banner */}
          {analysisLabel && (
            <div
              style={{
                padding: '10px 12px',
                background: '#e8f5e9',
                borderRadius: 8,
                fontSize: '0.8rem',
                color: '#2e7d32',
                fontWeight: 600,
                border: '1px solid #a5d6a7',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>🛰️</span>
              <span>{analysisLabel} overlay active on map</span>
            </div>
          )}

          {/* Saved Farms Section */}
          <div style={{ borderTop: '1px solid #eeeeee', paddingTop: 14 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#333', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>📁 Saved Farms ({savedFarms.length})</span>
            </label>

            {savedFarms.length === 0 ? (
              <div style={{ fontSize: '0.75rem', color: '#888', fontStyle: 'italic', padding: '6px 0' }}>
                No saved farms yet. Draw a polygon and click &quot;Save Farm Boundary&quot;.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {savedFarms.map((farm) => (
                  <div
                    key={farm._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      background: '#f9f9f9',
                      borderRadius: 8,
                      border: '1px solid #e0e0e0',
                      fontSize: '0.8rem',
                    }}
                  >
                    <button
                      onClick={() => handleLoadFarm(farm)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#1976d2',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        textAlign: 'left',
                        flex: 1,
                        padding: 0,
                      }}
                    >
                      🗺️ {farm.farmName}
                    </button>
                    <button
                      onClick={() => handleDeleteFarm(farm._id)}
                      title="Delete farm"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#d32f2f',
                        fontSize: '0.85rem',
                        padding: '2px 6px',
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════════════
          4. LEAFLET MAP VIEW (Full Remaining Height)
          ══════════════════════════════════════════════════════════════ */}
      <main style={{ position: 'relative', width: '100%', flex: 1, height: 'calc(100vh - 56px)' }}>
        
        {/* Draw Hint Banner on the Map */}
        {showDrawHint && (
          <DrawHintTooltip
            isMobile={isMobile}
            onDismiss={() => setShowDrawHint(false)}
          />
        )}

        <MapContainer
          center={position}
          zoom={13}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
        >
          {/* Base Layer */}
          <TileLayer
            key={baseLayer}
            attribution={tile.attribution}
            url={tile.url}
            maxZoom={19}
          />

          {/* Smooth Fly To Marker */}
          {flyTarget && <FlyTo center={flyTarget} zoom={16} />}

          {/* GPS Marker */}
          <Marker position={position}>
            <Popup>
              <strong>Your Selected Location</strong>
              <br />
              {position[0].toFixed(4)}, {position[1].toFixed(4)}
            </Popup>
          </Marker>

          {/* Leaflet Draw Control with BOLD BLACK Polygons */}
          <FeatureGroup>
            <EditControl
              position="topright"
              onCreated={handleCreated}
              onDeleted={handleDeleted}
              draw={{
                rectangle: false,
                circle: false,
                circlemarker: false,
                marker: false,
                polyline: false,
                polygon: {
                  allowIntersection: false,
                  drawError: { color: '#e1e10a', message: 'Boundary cannot cross itself' },
                  shapeOptions: {
                    color: '#000000',
                    weight: 4,
                    opacity: 1,
                    fillColor: '#00e676',
                    fillOpacity: 0.35,
                  },
                },
              }}
            />
          </FeatureGroup>

          {/* Google Earth Engine Analysis Overlay Tile */}
          {eeLayerUrl && (
            <TileLayer
              key={eeLayerUrl}
              url={eeLayerUrl}
              opacity={0.8}
            />
          )}

          {/* Zoom Control in Bottom-Right */}
          <ZoomControl />
        </MapContainer>

        {/* Legend Overlay at Bottom-Left */}
        {eeLayerUrl && (
          <RightLegendPanel
            activeAnalysis={activeAnalysis}
            isMobile={isMobile}
          />
        )}
      </main>
    </div>
  );
}

// ── Draw Hint Floating Tooltip ───────────────────────────────────────
function DrawHintTooltip({ isMobile, onDismiss }) {
  return (
    <div
      onClick={onDismiss}
      style={{
        position: 'absolute',
        top: 14,
        right: 60,
        zIndex: 1050,
        background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
        color: '#ffffff',
        padding: '10px 14px',
        borderRadius: 10,
        fontSize: '0.8rem',
        fontWeight: 500,
        fontFamily: "'Inter', sans-serif",
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        maxWidth: isMobile ? 220 : 280,
        lineHeight: 1.45,
        cursor: 'pointer',
        animation: 'fadeInBounce 0.4s ease',
        border: '1px solid rgba(255,255,255,0.2)',
      }}
    >
      <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span>✏️</span>
        <span>Draw Farm Boundary</span>
      </div>
      <div>
        Tap the <strong>polygon (⬟)</strong> icon at top-right → tap corners around your field → close shape → click <strong>☰ Menu</strong> to analyze.
      </div>
      <div style={{ fontSize: '0.68rem', marginTop: 6, opacity: 0.8, textAlign: 'right' }}>
        Tap to dismiss ✕
      </div>
    </div>
  );
}

// ── Zoom Control component ──────────────────────────────────────────
function ZoomControl() {
  const map = useMap();
  useEffect(() => {
    const ctrl = L.control.zoom({ position: 'bottomright' });
    ctrl.addTo(map);
    return () => ctrl.remove();
  }, [map]);
  return null;
}

// ── Analysis Legend Floating Panel ──────────────────────────────────
function RightLegendPanel({ activeAnalysis, isMobile }) {
  const info = ANALYSES.find(a => a.key === activeAnalysis);
  if (!info?.legend) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 24,
        left: 14,
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        borderRadius: 10,
        padding: '10px 14px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        border: '1px solid #e0e0e0',
        minWidth: 150,
      }}
    >
      <div
        style={{
          fontSize: '0.78rem',
          fontWeight: 700,
          color: '#333',
          marginBottom: 8,
          paddingBottom: 4,
          borderBottom: '1px solid #eee',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span>{info.emoji}</span>
        <span>{info.label}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {info.legend.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 3,
                background: item.bg,
                border: '1px solid rgba(0,0,0,0.15)',
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: '0.72rem', color: '#444', fontWeight: 500 }}>
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}