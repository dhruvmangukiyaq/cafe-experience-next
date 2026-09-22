'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { toArray } from '../site-helpers';
import Attachments from './Attachments';

// Mini map loads only in the browser (Leaflet needs window)
const LocationPicker = dynamic(() => import('./LocationPicker'), { ssr: false });

const EMPTY_FORM = {
  name: '',
  city: '',
  area: '',
  foodSpecialties: '',
  noiseLevel: 'normal',
  seatingType: 'mixed',
  wifiSpeed: 'medium',
  hasAC: true,
  hasOutdoorSeating: false,
  avgPricePerPerson: '',
  wifiQuality: '3',
  powerPlugsAvailable: false,
  ambienceTags: '',
  rating: '',
  notes: '',
  address: '',
  mapLat: '',
  mapLng: '',
};

function fromInitialValues(cafe) {
  if (!cafe) return EMPTY_FORM;
  return {
    name: cafe.name || '',
    city: cafe.city || '',
    area: cafe.area || '',
    foodSpecialties: toArray(cafe.foodSpecialties).join(', '),
    noiseLevel: cafe.environment?.noiseLevel || 'normal',
    seatingType: cafe.environment?.seatingType || 'mixed',
    wifiSpeed: cafe.environment?.wifiSpeed || 'medium',
    hasAC: cafe.environment?.hasAC ?? true,
    hasOutdoorSeating: cafe.environment?.hasOutdoorSeating ?? false,
    avgPricePerPerson: cafe.avgPricePerPerson ?? '',
    wifiQuality: cafe.wifiQuality ?? '3',
    powerPlugsAvailable: cafe.powerPlugsAvailable ?? false,
    ambienceTags: toArray(cafe.ambienceTags).join(', '),
    rating: cafe.rating ?? '',
    notes: cafe.notes || '',
    address: cafe.address || '',
    mapLat: cafe.location?.lat ?? '',
    mapLng: cafe.location?.lng ?? '',
  };
}

function splitTags(value) {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

const RATING_OPTIONS = [];
for (let v = 0; v <= 5; v += 0.5) RATING_OPTIONS.push(v);

export default function CafeForm({ initialValues, onSubmit, onCancel, title, submitLabel }) {
  const [form, setForm] = useState(() => fromInitialValues(initialValues));
  const [pending, setPending] = useState([]); // files waiting (Add mode only)
  const [error, setError] = useState('');
  const isEdit = !!initialValues;

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const useMyLocation = () => {
    setError('');
    if (!navigator.geolocation) {
      setError('Geolocation is not supported on this device.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set('mapLat', String(pos.coords.latitude.toFixed(6)));
        set('mapLng', String(pos.coords.longitude.toFixed(6)));
      },
      () => setError('Could not get your location. Please enter it manually.'),
      { timeout: 10000 }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.city.trim()) {
      setError('Name and City are required.');
      return;
    }
    if ((form.mapLat !== '' || form.mapLng !== '') && (form.mapLat === '' || form.mapLng === '')) {
      setError('Enter both latitude and longitude for the map pin.');
      return;
    }
    const wifi = Number(form.wifiQuality);
    if (form.wifiQuality !== '' && (wifi < 1 || wifi > 5)) {
      setError('WiFi quality must be between 1 and 5.');
      return;
    }
    const payload = {
      name: form.name.trim(),
      city: form.city.trim(),
      area: form.area.trim() || undefined,
      foodSpecialties: splitTags(form.foodSpecialties),
      environment: {
        noiseLevel: form.noiseLevel,
        seatingType: form.seatingType,
        wifiSpeed: form.wifiSpeed,
        hasAC: form.hasAC,
        hasOutdoorSeating: form.hasOutdoorSeating,
      },
      avgPricePerPerson: form.avgPricePerPerson === '' ? undefined : Number(form.avgPricePerPerson),
      wifiQuality: form.wifiQuality === '' ? undefined : wifi,
      powerPlugsAvailable: form.powerPlugsAvailable,
      ambienceTags: splitTags(form.ambienceTags),
      rating: form.rating === '' ? 0 : Number(form.rating),
      notes: form.notes.trim(),
      address: form.address.trim() || undefined,
      location:
        form.mapLat !== '' && form.mapLng !== ''
          ? { lat: Number(form.mapLat), lng: Number(form.mapLng) }
          : undefined, // empty → backend auto-detects from address + area + city
    };
    onSubmit(payload, pending);
  };

  // "Find on map" — geocode the typed address and drop the pin there
  const [finding, setFinding] = useState(false);
  const findOnMap = async () => {
    const q = [form.address, form.area, form.city].filter((s) => s && s.trim()).join(', ');
    if (!q) {
      setError('Pehla address / area / city lakho, pachi Find on map dabavo.');
      return;
    }
    setFinding(true);
    setError('');
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`
      );
      const [hit] = await res.json();
      if (hit && Number.isFinite(Number(hit.lat))) {
        set('mapLat', String(Number(hit.lat).toFixed(6)));
        set('mapLng', String(Number(hit.lon).toFixed(6)));
      } else {
        setError('Address map par malyu nahi — mini map par click kari pin muko.');
      }
    } catch {
      setError('Address shodhvama error — mini map par click kari pin muko.');
    } finally {
      setFinding(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{title || (isEdit ? 'Edit Cafe' : 'Add New Cafe')}</h2>
      {error && <p className="error">{error}</p>}

      <div className="form-grid">
        <label className="field">
          Name *
          <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="" />
        </label>
        <label className="field">
          City *
          <input value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="" />
        </label>
        <label className="field">
          Area
          <input value={form.area} onChange={(e) => set('area', e.target.value)} placeholder="" />
        </label>
        <label className="field">
          Avg Price Per Person
          <input
            type="number"
            min="0"
            value={form.avgPricePerPerson}
            onChange={(e) => set('avgPricePerPerson', e.target.value)}
            placeholder=""
          />
        </label>
        <label className="field full">
          Food Specialties
          <input
            value={form.foodSpecialties}
            onChange={(e) => set('foodSpecialties', e.target.value)}
            placeholder=""
          />
        </label>
        <label className="field full">
          Street Address
          <input
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
            placeholder="Shop no, street, landmark…"
          />
        </label>
      </div>

      <fieldset className="env-box">
        <legend>Environment</legend>
        <div className="env-grid">
          <label className="field">
            Noise Level
            <select value={form.noiseLevel} onChange={(e) => set('noiseLevel', e.target.value)}>
              <option value="quiet">Quiet</option>
              <option value="normal">Normal</option>
              <option value="loud">Loud</option>
            </select>
          </label>
          <label className="field">
            Seating Type
            <select value={form.seatingType} onChange={(e) => set('seatingType', e.target.value)}>
              <option value="sofa">Sofa</option>
              <option value="chairs">Chairs</option>
              <option value="mixed">Mixed</option>
            </select>
          </label>
          <label className="field">
            Wifi Speed
            <select value={form.wifiSpeed} onChange={(e) => set('wifiSpeed', e.target.value)}>
              <option value="slow">Slow</option>
              <option value="medium">Medium</option>
              <option value="fast">Fast</option>
            </select>
          </label>
        </div>
        <div className="check-row">
          <label className="check">
            <input type="checkbox" checked={form.hasAC} onChange={(e) => set('hasAC', e.target.checked)} />
            Has AC
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={form.hasOutdoorSeating}
              onChange={(e) => set('hasOutdoorSeating', e.target.checked)}
            />
            Has Outdoor Seating
          </label>
        </div>
      </fieldset>

      <div className="inline-row">
        <label className="field">
          Wifi Quality
          <input
            type="number"
            min="1"
            max="5"
            value={form.wifiQuality}
            onChange={(e) => set('wifiQuality', e.target.value)}
          />
        </label>
        <label className="field">
          Rating
          <select value={form.rating} onChange={(e) => set('rating', e.target.value)}>
            <option value="">Select rating</option>
            {RATING_OPTIONS.map((n) => (
              <option key={n} value={n}>{n.toFixed(1)}</option>
            ))}
          </select>
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={form.powerPlugsAvailable}
            onChange={(e) => set('powerPlugsAvailable', e.target.checked)}
          />
          Power Plugs Available
        </label>
      </div>

      <fieldset className="env-box">
        <legend>Map location</legend>
        <p className="attach-hint" style={{ margin: '0 0 10px' }}>
          Address lakhi <b>Find on map</b> dabavo, athva mini map par <b>click/drag</b> kari pin muko.
        </p>
        <div className="modal-actions" style={{ marginTop: 0, marginBottom: 10 }}>
          <button type="button" className="btn-secondary" onClick={findOnMap} disabled={finding}>
            {finding ? 'Shodhu chu…' : '🔍 Find on map'}
          </button>
          <button type="button" className="btn-secondary" onClick={useMyLocation}>
            📍 Use my current location
          </button>
        </div>
        <LocationPicker
          lat={form.mapLat}
          lng={form.mapLng}
          onPick={(la, ln) => {
            set('mapLat', String(la));
            set('mapLng', String(ln));
          }}
        />
        <p className="attach-hint">
          {form.mapLat !== '' && form.mapLng !== ''
            ? `Pin: ${form.mapLat}, ${form.mapLng}`
            : 'Pin set nathi — khali rakhso to address + area + city parthi auto-detect thase.'}
        </p>
      </fieldset>

      <div className="form-grid" style={{ marginTop: 14 }}>
        <label className="field full">
          Ambience Tags
          <input
            value={form.ambienceTags}
            onChange={(e) => set('ambienceTags', e.target.value)}
            placeholder=""
          />
        </label>
        <label className="field full">
          Notes
          <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} />
        </label>
      </div>

      <div style={{ marginTop: 14 }}>
        <Attachments
          cafeId={initialValues?._id || null}
          pending={pending}
          onPendingChange={setPending}
        />
      </div>

      <div className="modal-actions">
        <button type="submit" className="btn-primary">
          {submitLabel || (isEdit ? 'Save changes' : 'Create Cafe')}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
