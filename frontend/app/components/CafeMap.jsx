'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// Name-tag marker — cafe name pill with a dot pinned on the exact spot
function pinIcon(name) {
  const label = String(name || '?')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return L.divIcon({
    className: 'cafe-pin-wrap',
    html: `<div class="cafe-tag"><span class="cafe-tag-name">${label}</span><span class="cafe-tag-dot"></span></div>`,
    iconSize: [170, 54],
    iconAnchor: [85, 50],
    popupAnchor: [0, -50],
  });
}

// Cluster badge — groups overlapping pins (same area) into one count.
// Click to zoom in; at max zoom the pins spider out so every cafe shows.
function clusterIcon(cluster) {
  const n = cluster.getChildCount();
  return L.divIcon({
    className: 'cafe-cluster-wrap',
    html: `<div class="cafe-cluster">${n}</div>`,
    iconSize: [46, 46],
    iconAnchor: [23, 23],
  });
}
function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
    } else if (points.length === 1) {
      map.setView(points[0], 13);
    }
  }, [map, points]);
  return null;
}

// Map of cafes — every cafe with a location shows as a pin.
// Clicking "View details" opens the same detail modal as the cards.
export default function CafeMap({ cafes, onOpen }) {
  const pinned = (cafes || []).filter(
    (c) => Number.isFinite(c.location?.lat) && Number.isFinite(c.location?.lng)
  );
  const points = pinned.map((c) => [c.location.lat, c.location.lng]);

  // Default center: India. FitBounds takes over once pins load.
  return (
    <div className="cafe-map-card">
      <MapContainer
        center={[22.7196, 75.8577]}
        zoom={5}
        scrollWheelZoom={false}
        className="cafe-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />
        <MarkerClusterGroup
          chunkedLoading
          showCoverageOnHover={false}
          spiderfyOnMaxZoom
          maxClusterRadius={60}
          iconCreateFunction={clusterIcon}
        >
          {pinned.map((cafe) => (
            <Marker
              key={cafe._id}
              position={[cafe.location.lat, cafe.location.lng]}
              icon={pinIcon(cafe.name)}
            >
            <Popup>
              <div className="cafe-pin-pop">
                <b>{cafe.name}</b>
                {cafe.address && <span>{cafe.address}</span>}
                <span>
                  {cafe.area ? `${cafe.area}, ` : ''}{cafe.city}
                </span>
                  {cafe.avgPricePerPerson != null && <span>₹{cafe.avgPricePerPerson}</span>}
                  <button type="button" onClick={() => onOpen(cafe)}>
                    View details
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
      {!pinned.length && (
        <p className="cafe-map-empty">
          Map pins appear here as soon as cafes have a location — just add a cafe with its area + city.
        </p>
      )}
      {!!pinned.length && (
        <p className="cafe-map-legend">
          <span className="cafe-map-dot" /> {pinned.length} cafe{pinned.length > 1 ? 's' : ''} on
          the map • click a name for details
        </p>
      )}
    </div>
  );
}
