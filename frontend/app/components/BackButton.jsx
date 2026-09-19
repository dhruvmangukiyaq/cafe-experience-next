'use client';

import { useRouter } from 'next/navigation';

// Round ← icon button, same as original dashboard.
export default function BackButton({ to = '/', label = 'Back to home' }) {
  const router = useRouter();

  return (
    <button
      type="button"
      className="back-btn"
      onClick={() => router.push(to)}
      title={label}
      aria-label={label}
    >
      <span aria-hidden="true">←</span>
    </button>
  );
}
