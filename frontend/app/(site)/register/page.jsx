'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerUser } from '../../apiClient';
import { useAuth } from '../../auth';
import BackButton from '../../components/BackButton';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

function validate({ name, email, password, confirm }) {
  const errors = {};
  if (!name.trim()) errors.name = 'Name is required';
  else if (name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
  if (!email.trim()) errors.email = 'Email is required';
  else if (!EMAIL_RE.test(email.trim())) errors.email = 'Enter a valid email address';
  if (!password) errors.password = 'Password is required';
  else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
  if (!confirm) errors.confirm = 'Please confirm your password';
  else if (confirm !== password) errors.confirm = 'Passwords do not match';
  return errors;
}

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined, ...(field === 'password' ? { confirm: undefined } : {}) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      const data = await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      login(data.user, data.token);
      router.replace('/dashboard');
    } catch (err) {
      // Field-level errors from the server (e.g. duplicate email) map back to fields
      if (err.details && typeof err.details === 'object' && !Array.isArray(err.details)) {
        setErrors(err.details);
      } else {
        setServerError(err.message || 'Registration failed');
      }
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
        <p className="auth-kicker">Join the club</p>
        <h2>Create account</h2>
        <p className="auth-sub">Start your personal cafe journal in seconds.</p>
        {serverError && <p className="auth-server-error">{serverError}</p>}

        <label className="auth-field">
          Name
          <input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Your name"
            className={errors.name ? 'invalid' : ''}
          />
          {errors.name && <span className="auth-error">{errors.name}</span>}
        </label>

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
              placeholder="Min. 6 characters"
              className={errors.password ? 'invalid' : ''}
            />
            <button type="button" className="auth-toggle" onClick={() => setShowPw((s) => !s)}>
              {showPw ? 'Hide' : 'Show'}
            </button>
          </span>
          {errors.password && <span className="auth-error">{errors.password}</span>}
        </label>

        <label className="auth-field">
          Confirm password
          <input
            type={showPw ? 'text' : 'password'}
            value={form.confirm}
            onChange={(e) => set('confirm', e.target.value)}
            placeholder="Repeat password"
            className={errors.confirm ? 'invalid' : ''}
          />
          {errors.confirm && <span className="auth-error">{errors.confirm}</span>}
        </label>

        <button type="submit" className="site-btn site-btn-gold auth-submit" disabled={saving}>
          {saving ? 'Creating…' : 'Create account'}
        </button>

        <p className="auth-switch">
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </form>
      </div>
    </>
  );
}
