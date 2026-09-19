'use client';

import { useState } from 'react';
import { toArray } from '../site-helpers';
import Attachments from './Attachments';

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.city.trim()) {
      setError('Name and City are required.');
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
    };
    onSubmit(payload, pending);
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
