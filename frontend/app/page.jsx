'use client';

import { useState, useEffect } from 'react';
import CafeForm from './components/CafeForm';
import CafeList from './components/CafeList';
import { getCafes, createCafe, updateCafe, deleteCafe } from './apiClient';

export default function Home() {
  const [cafes, setCafes] = useState([]);
  const [selectedCafe, setSelectedCafe] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load all cafes when the website opens
  const fetchCafes = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getCafes();
      setCafes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCafes();
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleCreate = async (formData) => {
    try {
      setError('');
      await createCafe(formData);
      handleClose();
      fetchCafes();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdate = async (formData) => {
    try {
      setError('');
      await updateCafe(selectedCafe._id, formData);
      handleClose();
      fetchCafes();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = (formData) => {
    if (selectedCafe) {
      handleUpdate(formData);
    } else {
      handleCreate(formData);
    }
  };

  // "Add" button -> open empty form in modal
  const handleAdd = () => {
    setSelectedCafe(null);
    setShowForm(true);
  };

  // "Edit" button -> open form filled with cafe data
  const handleEdit = (cafe) => {
    setSelectedCafe(cafe);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      setError('');
      await deleteCafe(id);
      fetchCafes();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClose = () => {
    setShowForm(false);
    setSelectedCafe(null);
  };

  const avgRating = cafes.length
    ? (cafes.reduce((sum, c) => sum + (c.rating || 0), 0) / cafes.length).toFixed(1)
    : '—';

  return (
    <div className="container">
      {/* Header with title + Add button */}
      <header className="hero">
        <div>
          <h1>☕ Cafe Experience</h1>
          <p>All your cafe visits, ratings and work-friendly spots in one place.</p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={handleAdd}>
          + Add Cafe
        </button>
      </header>

      {/* Small stats */}
      <div className="stats">
        <div className="stat">
          <span className="stat-number">{cafes.length}</span>
          <span className="stat-label">Cafes tracked</span>
        </div>
        <div className="stat">
          <span className="stat-number">{avgRating}</span>
          <span className="stat-label">Average rating</span>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* List opens first */}
      {loading ? (
        <div className="card empty">Loading cafes…</div>
      ) : (
        <CafeList cafes={cafes} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      {/* Form opens only after clicking Add / Edit */}
      {showForm && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <CafeForm
              key={selectedCafe ? selectedCafe._id : 'new'}
              initialValues={selectedCafe}
              onSubmit={handleSubmit}
              onCancel={handleClose}
            />
          </div>
        </div>
      )}
    </div>
  );
}
