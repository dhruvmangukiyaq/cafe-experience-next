'use client';

import { useCallback, useEffect, useState } from 'react';
import { getCafes, deleteCafe, createCafe, updateCafe } from '../apiClient';
import CafeList from '../components/CafeList';
import CafeForm from '../components/CafeForm';
import BackButton from '../components/BackButton';
import RequireAuth from '../components/RequireAuth';

export default function Dashboard() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}

function DashboardContent() {
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCafes();
      setCafes(data);
    } catch (err) {
      setBanner(`Failed to load cafes: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Close modal on Escape key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const avg =
    cafes.length > 0
      ? (cafes.reduce((s, c) => s + (Number(c.rating) || 0), 0) / cafes.length).toFixed(1)
      : '0.0';

  const openAdd = () => {
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (cafe) => {
    setEditing(cafe);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
  };

  const handleSubmit = async (payload) => {
    try {
      if (editing) {
        await updateCafe(editing._id, payload);
        setBanner('Cafe updated.');
      } else {
        await createCafe(payload);
        setBanner('Cafe added.');
      }
      closeModal();
      refresh();
    } catch (err) {
      setBanner(`Save failed: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCafe(id);
      setBanner('Cafe deleted.');
      refresh();
    } catch (err) {
      setBanner(`Delete failed: ${err.message}`);
    }
  };

  return (
    <>
      <div className="back-btn-row">
        <BackButton to="/" />
      </div>
      {banner && <p className="banner">{banner}</p>}

      <header className="hero">
        <div>
          <h1>☕ Cafe Experience</h1>
          <p>All your cafe visits, ratings and work-friendly spots in one place.</p>
        </div>
        <button className="btn-add" onClick={openAdd}>+ Add Cafe</button>
      </header>

      <section className="stats">
        <div className="stat-card">
          <span className="stat-num">{cafes.length}</span>
          <span className="stat-label">Cafes tracked</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">{avg}</span>
          <span className="stat-label">Average rating</span>
        </div>
      </section>

      <CafeList cafes={cafes} loading={loading} onEdit={openEdit} onDelete={handleDelete} />

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <CafeForm
              key={editing ? editing._id : 'new'}
              initialValues={editing}
              onSubmit={handleSubmit}
              onCancel={closeModal}
              title={editing ? 'Edit Cafe' : 'Add New Cafe'}
              submitLabel={editing ? 'Save changes' : 'Create Cafe'}
            />
          </div>
        </div>
      )}
    </>
  );
}
