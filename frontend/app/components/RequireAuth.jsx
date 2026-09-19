'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../auth';

// Blocks logged-out visitors from protected pages — sends them to /login
// and remembers where they came from so login redirects them back.
export default function RequireAuth({ children }) {
  const { user, authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?from=' + encodeURIComponent(window.location.pathname));
    }
  }, [user, authLoading, router]);

  if (authLoading) return <p className="auth-loading">Checking session…</p>;
  if (!user) return <p className="auth-loading">Checking session…</p>;
  return children;
}
