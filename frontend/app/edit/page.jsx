'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCafe, updateCafe } from '../apiClient';
import CafeForm from '../components/CafeForm';
import BackButton from '../components/BackButton';
import RequireAuth from '../components/RequireAuth';

// Static-export friendly URL: /edit?id=<cafeId> (a dynamic /edit/[id] segment
// cannot be pre-rendered for ids we only know at runtime).
export default function EditCafePage() {
  return (
    <Suspense fallback={<p className="auth-loading">Loading cafe…</p>}>
      <RequireAuth>
        <EditCafeContent />
      </RequireAuth>
    </Suspense>
  );
}

function EditCafeContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const [cafe, setCafe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState('');

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setBanner('Missing cafe id in the link.');
      return;
    }
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
