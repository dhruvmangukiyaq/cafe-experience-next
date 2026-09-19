// Shared helpers for the website pages (Home / Explore).
// The CRUD dashboard has its own local copies — this file is only
// for the new site, so existing CRUD code stays untouched.

// Anything that should be an array, made safe: a stray string or
// null from the database can never crash a .map()/.join() again.
export function toArray(v) {
  if (Array.isArray(v)) return v;
  if (v == null || v === '') return [];
  return [v];
}

export function wifiStars(n) {
  const v = Math.max(0, Math.min(5, Math.round(Number(n) || 0)));
  return '★'.repeat(v) + '☆'.repeat(5 - v);
}

export function ratingStars(r) {
  const v = Math.max(0, Math.min(5, Math.round(Number(r) || 0)));
  return '★'.repeat(v) + '☆'.repeat(5 - v);
}

export function wifiSpeedLabel(cafe) {
  const s = cafe.environment?.wifiSpeed;
  if (s) return s;
  const q = Number(cafe.wifiQuality) || 3;
  if (q >= 4) return 'fast';
  if (q <= 2) return 'slow';
  return 'medium';
}

export function avgRating(cafes) {
  if (!cafes.length) return '0.0';
  return (cafes.reduce((s, c) => s + (Number(c.rating) || 0), 0) / cafes.length).toFixed(1);
}

export function isWorkFriendly(cafe) {
  return (Number(cafe.wifiQuality) || 0) >= 4 && !!cafe.powerPlugsAvailable;
}

// Deterministic cover art per cafe — soft monochrome tints
// (cream / sage / blush) so cards stay calm and minimal.
const COVERS = [
  ['#f3e9d2', '#e9dabc'],
  ['#e3ebe1', '#d2ded0'],
  ['#f5e2d5', '#ecd0bd'],
];

export function coverFor(name) {
  const s = String(name || '?');
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  const [a, b] = COVERS[h % COVERS.length];
  return `linear-gradient(135deg, ${a} 0%, ${b} 100%)`;
}
// "Find my vibe" — the site's signature widget. Each vibe has a
// match predicate + a per-cafe reason line shown under the pick.
export const VIBES = {
  work: {
    label: '💻 Work Mode',
    tagline: 'Fast WiFi + power plugs — laptop kholo ane lag jao.',
    match: (c) => (Number(c.wifiQuality) || 0) >= 4 && !!c.powerPlugsAvailable,
    reason: (c) => `WiFi ${c.wifiQuality || 3}/5 • plugs available • ${wifiSpeedLabel(c)} net`,
  },
  chill: {
    label: '🌿 Chill',
    tagline: 'Quiet corners ya outdoor air — slow evening mate.',
    match: (c) => c.environment?.noiseLevel === 'quiet' || !!c.environment?.hasOutdoorSeating,
    reason: (c) =>
      c.environment?.hasOutdoorSeating
        ? `Outdoor seating • ${c.environment?.noiseLevel || 'normal'} vibe`
        : `Quiet ambience • ${c.environment?.seatingType || 'mixed'} seating`,
  },
  date: {
    label: '❤ Date Night',
    tagline: 'Highly rated spots — impression pakku.',
    match: (c) => Number(c.rating) >= 4,
    reason: (c) => `Rated ${Number(c.rating).toFixed(1)} • ${c.city}${c.area ? ' • ' + c.area : ''}`,
  },
};
