'use client';

import { useEffect, useRef } from 'react';

// Liquid-ink cursor — like ink drops dispersing in water.
// Every movement releases glowing droplets in cycling colors
// (violet / indigo / cyan / gold) that drift, swirl and dissolve.
// Fades fully when the cursor rests. Canvas + additive glow.
const COLORS = ['168,85,247', '99,102,241', '34,211,238', '226,166,61'];
const MAX_DROPS = 260;

export default function CursorAura() {
  const ref = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;
    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const drops = [];
    let tx = w / 2;
    let ty = h / 3;
    let px = tx;
    let py = ty;
    let lastMove = 0;
    let colorIdx = 0;
    let raf = 0;
    let visible = true;
    const onVis = () => {
      visible = !document.hidden;
      if (visible) raf = requestAnimationFrame(tick);
    };
    document.addEventListener('visibilitychange', onVis);

    const onMove = (e) => {
      tx = e.clientX;
      ty = e.clientY;
      lastMove = performance.now();
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    const spawn = (x, y, vx, vy, speed) => {
      if (drops.length >= MAX_DROPS) drops.shift();
      const color = COLORS[colorIdx % COLORS.length];
      if (speed > 4) colorIdx += 1;
      drops.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: vx * 0.12 + (Math.random() - 0.5) * 1.4,
        vy: vy * 0.12 + (Math.random() - 0.5) * 1.4,
        r: 3 + Math.random() * (4 + Math.min(speed, 22) * 0.45),
        life: 1,
        decay: 0.012 + Math.random() * 0.02,
        color,
      });
    };

    const tick = (now) => {
      if (!visible) return;
      // water fade — old ink dissolves instead of vanishing
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(13, 10, 20, 0.14)';
      ctx.fillRect(0, 0, w, h);

      const vx = tx - px;
      const vy = ty - py;
      const speed = Math.hypot(vx, vy);
      px = tx;
      py = ty;

      if (now - lastMove < 600 && speed > 0.4) {
        const n = speed > 14 ? 3 : 2;
        for (let i = 0; i < n; i += 1) spawn(tx, ty, vx, vy, speed);
      }

      ctx.globalCompositeOperation = 'lighter';
      for (let i = drops.length - 1; i >= 0; i -= 1) {
        const d = drops[i];
        d.x += d.vx;
        d.y += d.vy;
        // gentle water swirl
        d.vx += Math.sin((d.y + now * 0.001) * 0.05) * 0.03;
        d.vy += Math.cos((d.x + now * 0.001) * 0.05) * 0.03;
        d.vx *= 0.985;
        d.vy *= 0.985;
        d.life -= d.decay;
        if (d.life <= 0) {
          drops.splice(i, 1);
          continue;
        }
        const a = Math.max(d.life, 0) * 0.55;
        const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r * 3);
        g.addColorStop(0, `rgba(${d.color},${a})`);
        g.addColorStop(1, `rgba(${d.color},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return <canvas ref={ref} className="cursor-aura-canvas" aria-hidden="true" />;
}
