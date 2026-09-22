'use client';

import { useEffect, useRef } from 'react';

// Floating color aura that trails the cursor on every page.
// Three blurred blobs (purple / magenta / amber) chase the pointer
// at different speeds + hue-rotate over time, screen-blended.
// Disabled on touch devices and prefers-reduced-motion.
export default function CursorAura() {
  const ref = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const el = ref.current;
    if (!el) return;

    let ax = window.innerWidth / 2;
    let ay = window.innerHeight / 3;
    let bx = ax;
    let by = ay;
    let cx = ax;
    let cy = ay;
    let tx = ax;
    let ty = ay;
    let raf = 0;

    const onMove = (e) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    const tick = () => {
      ax += (tx - ax) * 0.16;
      ay += (ty - ay) * 0.16;
      bx += (tx - bx) * 0.08;
      by += (ty - by) * 0.08;
      cx += (tx - cx) * 0.045;
      cy += (ty - cy) * 0.045;
      el.style.setProperty('--ax', `${ax}px`);
      el.style.setProperty('--ay', `${ay}px`);
      el.style.setProperty('--bx', `${bx}px`);
      el.style.setProperty('--by', `${by}px`);
      el.style.setProperty('--cx', `${cx}px`);
      el.style.setProperty('--cy', `${cy}px`);
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="cursor-aura" aria-hidden="true">
      <span className="blob b1" />
      <span className="blob b2" />
      <span className="blob b3" />
    </div>
  );
}
