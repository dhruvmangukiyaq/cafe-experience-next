'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getCafes } from '../apiClient';
import { avgRating, coverFor, isWorkFriendly, ratingStars, toArray, wifiSpeedLabel } from '../site-helpers';
import CafeCard from '../components/CafeCard';
import CafeDetailModal from '../components/CafeDetailModal';

// Leaflet needs window — client-only import so the build stays static-safe
const CafeMap = dynamic(() => import('../components/CafeMap'), {
  ssr: false,
  loading: () => <div className="site-empty">Loading map…</div>,
});

const MARQUEE = ['Work-friendly', 'Date Night', 'Slow Evenings', 'Great Espresso', 'Power Plugs', 'Cozy Corners'];

export default function HomePage() {
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  const load = () => {
    setLoading(true);
    setError('');
    getCafes()
      .then((data) => setCafes(data))
      .catch((e) => setError(e.message || 'Failed to load cafes'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const topRated = useMemo(
    () => [...cafes].sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0)).slice(0, 3),
    [cafes]
  );
  const spotlight = topRated[0] || null;
  const workPicks = useMemo(() => cafes.filter(isWorkFriendly).slice(0, 3), [cafes]);
  const cities = useMemo(() => new Set(cafes.map((c) => c.city).filter(Boolean)).size, [cafes]);

  return (
    <>
      <header className="site-hero">
        <div className="site-hero-inner">
        <span className="site-eyebrow reveal">Work • Chill • Repeat</span>
        <h1 className="reveal d1">Find your perfect <em>cafe escape</em></h1>
        <p className="reveal d2">
          Every cafe you&apos;ve visited, rated and loved — curated into one dark,
          premium guide for work sessions, slow evenings and date nights.
        </p>
        <div className="site-proof reveal d2">
          <span className="avatar-stack"><i>H</i><i>C</i><i>M</i><i>+</i></span>
          <span className="site-proof-txt"><b>★★★★★</b> Loved by cafe hoppers{cafes.length > 0 ? ` across ${cities} ${cities === 1 ? 'city' : 'cities'}` : ''}</span>
        </div>
        <div className="site-hero-actions reveal d3">
          <Link href="/explore" className="site-btn site-btn-gold">Explore cafes</Link>
          <Link href="/dashboard" className="site-btn site-btn-ghost">Open Dashboard</Link>
        </div>
        </div>
      </header>

      <div className="site-marquee">
        <div className="marquee-track">
          {[0, 1].map((n) => (
            <div className="marquee-group" key={n}>
              {MARQUEE.map((m) => <span key={m}>{m} <i>✦</i></span>)}
            </div>
          ))}
        </div>
      </div>

      <section className="site-stats">
        <div className="site-stat"><span className="site-stat-ico">☕</span><b>{loading ? '–' : cafes.length}</b><span>Cafes tracked</span></div>
        <div className="site-stat"><span className="site-stat-ico">⭐</span><b>{loading ? '–' : avgRating(cafes)}</b><span>Average rating</span></div>
        <div className="site-stat"><span className="site-stat-ico">🌍</span><b>{loading ? '–' : cities}</b><span>Cities covered</span></div>
        <div className="site-stat"><span className="site-stat-ico">💻</span><b>{loading ? '–' : workPicks.length}</b><span>Work-friendly picks</span></div>
      </section>

      {error && (
        <section className="site-section" style={{ paddingTop: 30 }}>
          <div className="site-empty">
            <p style={{ fontSize: 17, color: 'var(--s-gold-soft)', fontWeight: 700, margin: '0 0 8px' }}>
              Couldn&apos;t reach the cafe database
            </p>
            <p style={{ margin: '0 0 18px' }}>
              {error}. The backend may be waking up or its database isn&apos;t connected yet.
            </p>
            <button type="button" className="site-btn site-btn-gold site-btn-sm" onClick={load}>Try again</button>
          </div>
        </section>
      )}

      {!error && !loading && cafes.length === 0 && (
        <section className="site-section" style={{ paddingTop: 30 }}>
          <div className="site-spot">
            <div className="site-spot-cover" style={{ background: 'linear-gradient(135deg,#c97a1e,#3a1e06)' }}>
              <span>☕</span>
            </div>
            <div className="site-spot-body">
              <span className="site-spot-tag">Fresh start</span>
              <h3>Your cafe journal starts here</h3>
              <p className="site-spot-loc">Add your first cafe — rating, WiFi, price, notes, everything.</p>
              <div className="site-hero-actions" style={{ justifyContent: 'flex-start', marginTop: 0 }}>
                <Link href="/add" className="site-btn site-btn-gold site-btn-sm">+ Add your first cafe</Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {spotlight && (
        <section className="site-section">
          <p className="site-kicker">✨ Cafe of the moment</p>
          <div className="site-section-head"><h2>Everyone&apos;s favourite</h2></div>
          <div className="site-spot">
            <div className="site-spot-cover" style={{ background: coverFor(spotlight.name) }}>
              <span>{(spotlight.name || '?').trim().charAt(0).toUpperCase()}</span>
            </div>
            <div className="site-spot-body">
              <span className="site-spot-tag">★ {Number(spotlight.rating).toFixed(1)} top rated</span>
              <h3>{spotlight.name}</h3>
              <p className="site-spot-loc">{spotlight.city}{spotlight.area ? ` • ${spotlight.area}` : ''}</p>
              <div className="site-pills">
                {toArray(spotlight.foodSpecialties).map((s) => <span key={s} className="site-pill">{s}</span>)}
                {toArray(spotlight.ambienceTags).map((t) => <span key={t} className="site-pill green">{t}</span>)}
              </div>
              <div className="site-spot-meta">
                <span className="site-price">{spotlight.avgPricePerPerson != null ? `₹${spotlight.avgPricePerPerson}` : '—'}</span>
                <span className="site-stars">{ratingStars(spotlight.rating)}</span>
                <span className="site-wifi">WiFi {wifiSpeedLabel(spotlight)}</span>
              </div>
              <div className="site-hero-actions" style={{ justifyContent: 'flex-start', marginTop: 0 }}>
                <button type="button" className="site-btn site-btn-gold site-btn-sm" onClick={() => setSelected(spotlight)}>View details</button>
                <Link href="/explore" className="site-btn site-btn-ghost site-btn-sm">Explore more</Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {!!topRated.length && (
        <section className="site-section">
          <p className="site-kicker">Barista&apos;s picks</p>
          <div className="site-section-head">
            <h2>Top rated right now</h2>
            <Link href="/explore">View all →</Link>
          </div>
          <div className="site-grid">
            {topRated.map((c) => <CafeCard key={c._id} cafe={c} onOpen={setSelected} />)}
          </div>
        </section>
      )}

      {!!workPicks.length && (
        <section className="site-section">
          <p className="site-kicker">Laptop friendly</p>
          <div className="site-section-head">
            <h2>Best for deep work</h2>
            <Link href="/explore">Find my vibe →</Link>
          </div>
          <div className="site-grid">
            {workPicks.map((c) => (
              <CafeCard key={c._id} cafe={c} onOpen={setSelected} reason={`WiFi ${c.wifiQuality || 3}/5 • plugs available`} />
            ))}
          </div>
        </section>
      )}

      <section className="site-section">
        <p className="site-kicker">Map</p>
        <div className="site-section-head">
          <h2>Find them on the map</h2>
          <Link href="/explore">Explore all →</Link>
        </div>
        {!loading && !error && !!cafes.length && (
          <CafeMap cafes={cafes} onOpen={setSelected} />
        )}
      </section>

      <section className="site-section">
        <p className="site-kicker">How it works</p>
        <div className="site-section-head"><h2>Three steps, zero confusion</h2></div>
        <div className="site-steps">
          <div className="site-step"><span className="n">1</span><b>Explore</b><p>Browse cafes by vibe, city, rating and WiFi — pick where your mood fits.</p></div>
          <div className="site-step"><span className="n">2</span><b>Visit &amp; rate</b><p>Add new finds from the Dashboard with price, ambience and notes.</p></div>
          <div className="site-step"><span className="n">3</span><b>Relive</b><p>Your ratings and notes build a personal cafe journal over time.</p></div>
        </div>
      </section>

      {selected && <CafeDetailModal cafe={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
