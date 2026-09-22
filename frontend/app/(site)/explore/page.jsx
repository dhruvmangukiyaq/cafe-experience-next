'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getCafes } from '../../apiClient';
import { VIBES } from '../../site-helpers';
import CafeCard from '../../components/CafeCard';
import CafeDetailModal from '../../components/CafeDetailModal';
import BackButton from '../../components/BackButton';

// Leaflet needs window — client-only import so the build stays static-safe
const CafeMap = dynamic(() => import('../../components/CafeMap'), {
  ssr: false,
  loading: () => <div className="site-empty">Loading map…</div>,
});

export default function ExplorePage() {
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  // Vibe finder + full list (top rated first)
  const [vibe, setVibe] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError('');
    getCafes()
      .then(setCafes)
      .catch((e) => setError(e.message || 'Failed to load cafes'))
      .finally(() => setLoading(false));
  }, []);

  const vibePicks = useMemo(() => {
    if (!vibe) return null;
    return cafes.filter(VIBES[vibe].match).slice(0, 3);
  }, [vibe, cafes]);

  const results = useMemo(
    () => [...cafes].sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0)),
    [cafes]
  );

  return (
    <>
      <div className="site-back-row">
        <BackButton to="/" />
      </div>
      <section className="site-section" style={{ paddingTop: 40 }}>
        <p className="site-kicker">Find my vibe</p>
        <div className="site-section-head"><h2>Tell me your mood</h2></div>
        <div className="site-vibes">
          {Object.entries(VIBES).map(([key, v]) => (
            <button
              key={key}
              className={vibe === key ? 'site-vibe active' : 'site-vibe'}
              onClick={() => setVibe(vibe === key ? null : key)}
            >
              {v.label}
            </button>
          ))}
        </div>
        {vibe && <p className="site-count">{VIBES[vibe].tagline}</p>}
        {vibePicks && (
          vibePicks.length ? (
            <div className="site-grid" style={{ marginBottom: 10 }}>
              {vibePicks.map((c) => (
                <CafeCard key={c._id} cafe={c} onOpen={setSelected} reason={VIBES[vibe].reason(c)} />
              ))}
            </div>
          ) : (
            <div className="site-empty">No cafe matches this vibe yet — add one from the Dashboard!</div>
          )
        )}
      </section>

      <section className="site-section" style={{ paddingTop: 30 }}>
        <p className="site-kicker">Map</p>
        <div className="site-section-head"><h2>Cafes on the map</h2></div>
        {loading ? (
          <div className="site-empty">Loading map…</div>
        ) : (
          <CafeMap cafes={results} onOpen={setSelected} />
        )}
      </section>

      <section className="site-section" style={{ paddingTop: 30 }}>
        {loading ? (
          <div className="site-empty">Loading cafes…</div>
        ) : error ? (
          <div className="site-empty">
            <p style={{ fontSize: 16, color: 'var(--s-gold-soft)', fontWeight: 700, margin: '0 0 8px' }}>
              Couldn&apos;t reach the cafe database
            </p>
            <p style={{ margin: '0 0 18px' }}>{error}</p>
            <Link href="/dashboard" className="site-btn site-btn-ghost site-btn-sm">Open Dashboard</Link>
          </div>
        ) : results.length ? (
          <>
            <p className="site-count">{results.length} cafe{results.length > 1 ? 's' : ''} found</p>
            <div className="site-grid">
              {results.map((c) => <CafeCard key={c._id} cafe={c} onOpen={setSelected} />)}
            </div>
          </>
        ) : (
          <div className="site-empty">
            <p style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>No cafes yet ☕</p>
            <p style={{ margin: '0 0 18px' }}>Add your first cafe and it will show up here.</p>
            <Link href="/add" className="site-btn site-btn-gold site-btn-sm">+ Add cafe</Link>
          </div>
        )}
      </section>

      {selected && <CafeDetailModal cafe={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
