'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const pickIcon = L.divIcon({
  className: 'cafe-pin-wrap',
  html: '<div class="pick-pin"></div>',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

// Click anywhere on the mini map to drop the pin there
function ClickToSet({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6)));
    },
  });
  return null;
}

// Center once on the existing pin (not on every keystroke)
function Recenter({ center }) {
  const map = useMap();
  const done = useRef(false);
  useEffect(() => {
    if (center && !done.current) {
      map.setView(center, 15);
      done.current = true;
    }
  }, [map, center]);
  return null;
}

// Mini map for the Add/Edit form — click to set, drag to adjust.
export default function LocationPicker({ lat, lng, onPick }) {
  const pos =
    lat !== '' && lng !== '' && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))
      ? [Number(lat), Number(lng)]
      : null;
  const markerRef = useRef(null);

  return (
    <MapContainer
      center={pos || [21.1702, 72.8311]}
      zoom={pos ? 15 : 11}
      scrollWheelZoom={false}
      className="pick-map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickToSet onPick={onPick} />
      <Recenter center={pos} />
      {pos && (
        <Marker
          position={pos}
          draggable
          ref={markerRef}
          icon={pickIcon}
          eventHandlers={{
            dragend() {
              const m = markerRef.current;
              if (!m) return;
              const p = m.getLatLng();
              onPick(Number(p.lat.toFixed(6)), Number(p.lng.toFixed(6)));
            },
          }}
        />
      )}
    </MapContainer>
  );
}
