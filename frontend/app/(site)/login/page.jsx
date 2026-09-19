'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginUser } from '../../apiClient';
import { useAuth } from '../../auth';
import BackButton from '../../components/BackButton';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

function validate({ email, password }) {
  const errors = {};
  if (!email.trim()) errors.email = 'Email is required';
  else if (!EMAIL_RE.test(email.trim())) errors.email = 'Enter a valid email address';
  if (!password) errors.password = 'Password is required';
  else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
  return errors;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="auth-loading">Loading…</p>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const from = searchParams.get('from') || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      const data = await loginUser({ email: form.email.trim(), password: form.password });
      login(data.user, data.token);
      router.replace(from);
    } catch (err) {
      setServerError(err.message || 'Login failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="site-back-row">
        <BackButton to="/" />
      </div>
      <div className="auth-wrap">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <p className="auth-kicker">Welcome back</p>
        <h2>Log in</h2>
        <p className="auth-sub">Manage your cafes, ratings and work-friendly spots.</p>
        {serverError && <p className="auth-server-error">{serverError}</p>}

        <label className="auth-field">
          Email
          <input
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="you@example.com"
            className={errors.email ? 'invalid' : ''}
          />
          {errors.email && <span className="auth-error">{errors.email}</span>}
        </label>

        <label className="auth-field">
          Password
          <span className="auth-pw-wrap">
            <input
              type={showPw ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              placeholder="••••••••"
              className={errors.password ? 'invalid' : ''}
            />
            <button type="button" className="auth-toggle" onClick={() => setShowPw((s) => !s)}>
              {showPw ? 'Hide' : 'Show'}
            </button>
          </span>
          {errors.password && <span className="auth-error">{errors.password}</span>}
        </label>

        <button type="submit" className="site-btn site-btn-gold auth-submit" disabled={saving}>
          {saving ? 'Logging in…' : 'Log in'}
        </button>

        <p className="auth-switch">
          New here? <Link href="/register">Create an account</Link>
        </p>
      </form>
      </div>
    </>
  );
}
