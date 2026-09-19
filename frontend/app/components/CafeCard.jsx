'use client';

import { coverFor, ratingStars, toArray, wifiStars, wifiSpeedLabel } from '../site-helpers';

// Dark premium cafe card: visual cover header + info body.
// (CRUD table untouched — this card is only for Home / Explore.)
export default function CafeCard({ cafe, onOpen, reason }) {
  const specs = toArray(cafe.foodSpecialties);
  const rating = Number(cafe.rating ?? 0);
  const initial = (cafe.name || '?').trim().charAt(0).toUpperCase();
  return (
    <article className="site-card" onClick={() => onOpen(cafe)}>
      <div className="site-card-cover" style={{ background: coverFor(cafe.name) }}>
        <span className="cover-initial">{initial}</span>
        <span className="cover-badge">★ {rating.toFixed(1)}</span>
      </div>
      <div className="site-card-body">
        <div className="site-card-top">
          <h3>{cafe.name}</h3>
          <span className="site-stars">{ratingStars(rating)}</span>
        </div>
        <p className="site-card-loc">
          {cafe.city}{cafe.area ? ` • ${cafe.area}` : ''}
        </p>
        <div className="site-pills">
          {specs.slice(0, 3).map((s) => (
            <span key={s} className="site-pill">{s}</span>
          ))}
          {cafe.environment?.hasAC && <span className="site-pill green">AC</span>}
          {cafe.powerPlugsAvailable && <span className="site-pill green">Plugs</span>}
        </div>
        <div className="site-card-foot">
          <span className="site-price">
            {cafe.avgPricePerPerson != null ? `₹${cafe.avgPricePerPerson}` : '—'}
          </span>
          <span className="site-rating">{rating.toFixed(1)} / 5</span>
          <span className="site-wifi">{wifiStars(cafe.wifiQuality)} · {wifiSpeedLabel(cafe)}</span>
        </div>
        {reason && <p className="site-reason">{reason}</p>}
      </div>
    </article>
  );
}
