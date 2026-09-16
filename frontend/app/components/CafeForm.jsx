'use client';

import { useState, useEffect } from 'react';

const parseArray = (str) => {
  if (!str) return [];
  return str.split(',').map(s => s.trim()).filter(Boolean);
};

const formatArray = (arr) => {
  if (!arr || !Array.isArray(arr)) return '';
  return arr.join(', ');
};

const CafeForm = ({ initialValues, onSubmit, onCancel }) => {
  const isEditing = !!initialValues;
  
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    area: '',
    foodSpecialties: '',
    environment: {
      noiseLevel: 'normal',
      seatingType: 'mixed',
      hasAC: true,
      hasOutdoorSeating: false,
      wifiSpeed: 'medium'
    },
    avgPricePerPerson: '',
    wifiQuality: 3,
    powerPlugsAvailable: false,
    ambienceTags: '',
    rating: 0,
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValues) {
      setFormData({
        name: initialValues.name || '',
        city: initialValues.city || '',
        area: initialValues.area || '',
        foodSpecialties: formatArray(initialValues.foodSpecialties),
        environment: {
          noiseLevel: initialValues.environment?.noiseLevel || 'normal',
          seatingType: initialValues.environment?.seatingType || 'mixed',
          hasAC: initialValues.environment?.hasAC ?? true,
          hasOutdoorSeating: initialValues.environment?.hasOutdoorSeating ?? false,
          wifiSpeed: initialValues.environment?.wifiSpeed || 'medium'
        },
        avgPricePerPerson: initialValues.avgPricePerPerson || '',
        wifiQuality: initialValues.wifiQuality || 3,
        powerPlugsAvailable: initialValues.powerPlugsAvailable || false,
        ambienceTags: formatArray(initialValues.ambienceTags),
        rating: initialValues.rating || 0,
        notes: initialValues.notes || ''
      });
    }
  }, [initialValues]);

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (formData.wifiQuality && (formData.wifiQuality < 1 || formData.wifiQuality > 5)) {
      newErrors.wifiQuality = 'Wifi quality must be between 1 and 5';
    }
    
    if (formData.rating && (formData.rating < 0 || formData.rating > 5)) {
      newErrors.rating = 'Rating must be between 0 and 5';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('environment.')) {
      const envKey = name.replace('environment.', '');
      setFormData(prev => ({
        ...prev,
        environment: {
          ...prev.environment,
          [envKey]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    const submitData = {
      name: formData.name.trim(),
      city: formData.city.trim(),
      area: formData.area.trim(),
      foodSpecialties: parseArray(formData.foodSpecialties),
      environment: {
        noiseLevel: formData.environment.noiseLevel,
        seatingType: formData.environment.seatingType,
        hasAC: formData.environment.hasAC,
        hasOutdoorSeating: formData.environment.hasOutdoorSeating,
        wifiSpeed: formData.environment.wifiSpeed
      },
      avgPricePerPerson: formData.avgPricePerPerson ? Number(formData.avgPricePerPerson) : undefined,
      wifiQuality: Number(formData.wifiQuality),
      powerPlugsAvailable: formData.powerPlugsAvailable,
      ambienceTags: parseArray(formData.ambienceTags),
      rating: Number(formData.rating),
      notes: formData.notes.trim()
    };
    
    onSubmit(submitData);
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <div className="cafe-form">
      <h2>{isEditing ? 'Edit Cafe' : 'Add New Cafe'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            {errors.name && <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.name}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="city">City *</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
            {errors.city && <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.city}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="area">Area</label>
            <input
              type="text"
              id="area"
              name="area"
              value={formData.area}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="avgPricePerPerson">Avg Price Per Person</label>
            <input
              type="number"
              id="avgPricePerPerson"
              name="avgPricePerPerson"
              value={formData.avgPricePerPerson}
              onChange={handleChange}
              min="0"
              step="10"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="foodSpecialties">Food Specialties</label>
          <input
            type="text"
            id="foodSpecialties"
            name="foodSpecialties"
            value={formData.foodSpecialties}
            onChange={handleChange}
          />
        </div>

        <fieldset className="form-group" style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '16px' }}>
          <legend style={{ fontWeight: '600', marginBottom: '12px' }}>Environment</legend>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="noiseLevel">Noise Level</label>
              <select
                id="noiseLevel"
                name="environment.noiseLevel"
                value={formData.environment.noiseLevel}
                onChange={handleChange}
              >
                <option value="quiet">Quiet</option>
                <option value="normal">Normal</option>
                <option value="loud">Loud</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="seatingType">Seating Type</label>
              <select
                id="seatingType"
                name="environment.seatingType"
                value={formData.environment.seatingType}
                onChange={handleChange}
              >
                <option value="sofa">Sofa</option>
                <option value="chairs">Chairs</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="wifiSpeed">Wifi Speed</label>
              <select
                id="wifiSpeed"
                name="environment.wifiSpeed"
                value={formData.environment.wifiSpeed}
                onChange={handleChange}
              >
                <option value="slow">Slow</option>
                <option value="medium">Medium</option>
                <option value="fast">Fast</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="hasAC"
                name="environment.hasAC"
                checked={formData.environment.hasAC}
                onChange={handleChange}
              />
              <label htmlFor="hasAC">Has AC</label>
            </div>
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="hasOutdoorSeating"
                name="environment.hasOutdoorSeating"
                checked={formData.environment.hasOutdoorSeating}
                onChange={handleChange}
              />
              <label htmlFor="hasOutdoorSeating">Has Outdoor Seating</label>
            </div>
          </div>
        </fieldset>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="wifiQuality">Wifi Quality</label>
            <input
              type="number"
              id="wifiQuality"
              name="wifiQuality"
              value={formData.wifiQuality}
              onChange={handleChange}
              min="1"
              max="5"
            />
            {errors.wifiQuality && <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.wifiQuality}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="rating">Rating</label>
            <select
              id="rating"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
            >
              <option value={0}>Select rating</option>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
            </select>
            {errors.rating && <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.rating}</span>}
          </div>
          <div className="form-group checkbox-group" style={{ alignSelf: 'flex-end' }}>
            <input
              type="checkbox"
              id="powerPlugsAvailable"
              name="powerPlugsAvailable"
              checked={formData.powerPlugsAvailable}
              onChange={handleChange}
            />
            <label htmlFor="powerPlugsAvailable">Power Plugs Available</label>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="ambienceTags">Ambience Tags</label>
          <input
            type="text"
            id="ambienceTags"
            name="ambienceTags"
            value={formData.ambienceTags}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" className="btn btn-primary">
            {isEditing ? 'Update Cafe' : 'Create Cafe'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CafeForm;