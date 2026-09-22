// Free geocoding via OpenStreetMap Nominatim (no API key needed).
// Turns "area + city" into { lat, lng } for the map pin.
// Falls back to city-only when the area isn't found.
// Never throws — returns null when lookup fails so cafe save always works.
async function lookup(q) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, {
      headers: {
        // Nominatim usage policy requires a descriptive User-Agent
        'User-Agent': 'cafe-experience-tracker/1.0 (contact: admin@localhost)',
      },
    });
    if (!res.ok) return null;
    const [hit] = await res.json();
    if (!hit) return null;
    const lat = Number(hit.lat);
    const lng = Number(hit.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  } catch {
    return null;
  }
}

async function geocode(area, city, address) {
  const full = [address, area, city].filter(Boolean).join(', ');
  // 1) full address, 2) area + city, 3) city only — first hit wins
  return (
    (await lookup(full)) ||
    (await lookup([area, city].filter(Boolean).join(', '))) ||
    (await lookup(city))
  );
}

module.exports = geocode;
