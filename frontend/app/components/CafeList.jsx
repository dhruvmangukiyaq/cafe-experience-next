'use client';

// Table view matching the dashboard: NAME / CITY-AREA / SPECIALTIES /
// ENVIRONMENT / PRICE / WIFI / RATING / TAGS / ACTIONS.
import { toArray } from '../site-helpers';

function wifiStars(n) {
  const v = Math.max(0, Math.min(5, Math.round(Number(n) || 0)));
  return '★'.repeat(v) + '☆'.repeat(5 - v);
}

function ratingStars(r) {
  const v = Math.max(0, Math.min(5, Math.round(Number(r) || 0)));
  return '★'.repeat(v) + '☆'.repeat(5 - v);
}

function wifiSpeedLabel(cafe) {
  // New field environment.wifiSpeed, fallback: derive from wifiQuality
  const s = cafe.environment?.wifiSpeed;
  if (s) return s;
  const q = Number(cafe.wifiQuality) || 3;
  if (q >= 4) return 'fast';
  if (q <= 2) return 'slow';
  return 'medium';
}

export default function CafeList({ cafes, loading, onEdit, onDelete }) {
  if (loading) return <div className="table-card"><p className="muted">Loading cafes…</p></div>;
  if (!cafes.length)
    return <div className="table-card"><p className="empty">No cafes found. Click “+ Add Cafe” to add your first spot!</p></div>;

  return (
    <div className="table-card">
      <table className="cafe-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>City / Area</th>
            <th>Specialties</th>
            <th>Environment</th>
            <th>Price</th>
            <th>Wifi</th>
            <th>Rating</th>
            <th>Tags</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {cafes.map((cafe, i) => {
            const specs = toArray(cafe.foodSpecialties);
            const tags = toArray(cafe.ambienceTags);
            const rating = Number(cafe.rating ?? 0);
            return (
              <tr key={cafe._id} className={i % 2 === 1 ? '' : i === 2 ? 'alt' : ''}>
                <td className="cafe-name">{cafe.name}</td>
                <td>
                  <span className="city-main">{cafe.city}</span>
                  {cafe.area && <span className="city-area">{cafe.area}</span>}
                </td>
                <td>
                  {specs.length ? (
                    specs.map((s) => (
                      <span key={s} className="pill pill-blue">{s}</span>
                    ))
                  ) : (
                    <span className="dash">-</span>
                  )}
                </td>
                <td className="env-text">
                  Noise: {cafe.environment?.noiseLevel || 'normal'} • Seating:{' '}
                  {cafe.environment?.seatingType || 'mixed'}
                  {cafe.environment?.hasAC ? ' • AC' : ''} • WiFi: {wifiSpeedLabel(cafe)}
                </td>
                <td className="price">
                  {cafe.avgPricePerPerson != null ? `₹${cafe.avgPricePerPerson}` : <span className="dash">-</span>}
                </td>
                <td>
                  <span className="pill pill-green">{wifiStars(cafe.wifiQuality)}</span>
                </td>
                <td>
                  <span className="pill pill-yellow">
                    {ratingStars(rating)} {rating.toFixed(1)}
                  </span>
                </td>
                <td>{tags.length ? tags.join(', ') : <span className="dash">-</span>}</td>
                <td>
                  <div className="row-actions">
                    <button className="btn-edit" onClick={() => onEdit(cafe)}>Edit</button>
                    <button
                      className="btn-delete"
                      onClick={() => {
                        if (window.confirm(`Delete "${cafe.name}"?`)) onDelete(cafe._id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
