'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getCafe, updateCafe } from '../../apiClient';
import CafeForm from '../../components/CafeForm';
import BackButton from '../../components/BackButton';
import RequireAuth from '../../components/RequireAuth';

export default function EditCafePage() {
  return (
    <RequireAuth>
      <EditCafeContent />
    </RequireAuth>
  );
}

function EditCafeContent() {
  const { id } = useParams();
  const router = useRouter();
  const [cafe, setCafe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState('');

  useEffect(() => {
    getCafe(id)
      .then((data) => setCafe(data))
      .catch((err) => setBanner(`Could not load cafe: ${err.message}`))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      await updateCafe(id, formData);
      router.push('/');
    } catch (err) {
      setBanner(`Save failed: ${err.message}`);
    }
  };

  if (loading) return <p>Loading cafe…</p>;

  if (!cafe) {
    return (
      <>
        {banner && <p className="banner">{banner}</p>}
        <p>
          Cafe not found. <Link href="/">Back to list</Link>
        </p>
      </>
    );
  }

  return (
    <>
      {banner && <p className="banner">{banner}</p>}
      <div className="back-btn-row">
        <BackButton to="/" />
      </div>
      <div className="page-center">
        <div className="modal" style={{ boxShadow: '0 2px 10px rgba(0,0,0,.08)' }}>
          <CafeForm
            key={cafe._id}
            initialValues={cafe}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/')}
            title="Edit Cafe"
            submitLabel="Save changes"
          />
        </div>
      </div>
    </>
  );
}
