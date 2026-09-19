'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../auth';

// Wrapper ONLY for the website pages (Home, Explore, Login, Register).
// Dashboard (/dashboard), Add (/add) and Edit (/edit/:id) render
// outside this layout so the CRUD UI stays exactly as-is.
export default function SiteLayout({ children }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const linkClass = (href) =>
    pathname === href ? 'site-link active' : 'site-link';

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="site">
      <nav className="site-nav">
        <Link href="/" className="site-logo">
          ☕ Cafe <span>Experience</span>
        </Link>
        <div className="site-links">
          <Link href="/" className={linkClass('/')}>Home</Link>
          <Link href="/explore" className={linkClass('/explore')}>Explore</Link>
          <Link href="/dashboard" className={linkClass('/dashboard')}>Dashboard</Link>
        </div>
        {user ? (
          <>
            <span className="site-user">Hi, {user.name}</span>
            <button type="button" className="site-logout" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <div className="site-nav-actions">
            <Link href="/add" className="site-cta">+ Add Cafe</Link>
            <Link href="/login" className={linkClass('/login')}>Login</Link>
          </div>
        )}
      </nav>

      {children}

      <footer className="site-footer">
        <div className="site-foot-grid">
          <div className="site-foot-col">
            <p className="site-foot-brand">☕ Cafe <span>Experience</span></p>
            <p>Find your perfect work &amp; chill spot. Every visit rated, every vibe captured — your personal cafe journal.</p>
          </div>
          <div className="site-foot-col">
            <b>Discover</b>
            <Link href="/">Home</Link>
            <Link href="/explore">Explore cafes</Link>
            <Link href="/add">+ Add a cafe</Link>
          </div>
          <div className="site-foot-col">
            <b>Manage</b>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/explore">Find my vibe</Link>
          </div>
        </div>
        <div className="site-foot-bottom">
          <span>Made with ☕ for cafe lovers.</span>
          <span><Link href="/dashboard">Manage cafes</Link></span>
        </div>
      </footer>
    </div>
  );
}
