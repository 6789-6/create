import { createElement, useEffect, useRef } from 'react';

const h = createElement;
const nodes = [
  { id: 'first', title: '初见微光', x: 0.42, y: 0.38, c: '#ffd3ea' },
  { id: 'rose', title: '玫瑰星云', x: 0.55, y: 0.46, c: '#ff5f9b' },
  { id: 'moon', title: '月光来信', x: 0.67, y: 0.35, c: '#ffe0a4' },
  { id: 'aurora', title: '极光慢舞', x: 0.49, y: 0.58, c: '#89fff1' },
  { id: 'future', title: '未来光环', x: 0.61, y: 0.64, c: '#ffa85c' }
];

function rand(seed: number) {
  let s = seed;
  return () => {
    s = Math.imul(1664525, s) + 1013904223;
    return ((s >>> 0) / 4294967296);
  };
}
function mix(a: number, b: number, t: number) { return a + (b - a) * t; }
function ease(t: number) { return t * t * (3 - 2 * t); }
function clamp(v: number, a = 0, b = 1) { return Math.max(a, Math.min(b, v)); }

export function RomanceOrbitApp() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const selected = useRef<any>(null);
  const startTime = useRef(0);
  const camera = useRef({ x: 0.5, y: 0.5, z: 1 });
  const target = useRef({ x: 0.5, y: 0.5, z: 1 });

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const reduce = window.devicePixelRatio > 1.5 ? 1.35 : 1;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.8) / reduce;
    let w = 1, hgt = 1, raf = 0;
    const r = rand(912733);
    const stars = Array.from({ length: 1200 }, () => ({ x: r(), y: r(), z: r(), s: 0.25 + r() * 1.25, hue: r() }));
    const dust = Array.from({ length: 2600 }, (_, i) => {
      const t = i / 2600 * Math.PI * 2 * 3.4;
      const rr = Math.pow(r(), 0.55);
      return { x: Math.cos(t) * rr * (0.36 + r() * 0.08), y: Math.sin(t) * rr * (0.2 + r() * 0.05), z: (r() - 0.5) * 0.25, s: 0.3 + r() * 1.8, hue: r() };
    });
    const petals = Array.from({ length: 150 }, (_, i) => {
      const lane = i / 150;
      const a = lane * Math.PI * 2 * 4.2 + r() * 0.9;
      const rr = 0.16 + Math.pow(r(), 0.65) * 0.72;
      return { a, rr, x: Math.cos(a) * rr, y: Math.sin(a) * rr * 0.62 + (r() - 0.5) * 0.18, rot: r() * Math.PI, sc: 0.55 + r() * 1.15, delay: r() * 0.36, color: ['#5b1028', '#9d294d', '#d84d78', '#ff8daf', '#ffc2d7'][Math.floor(r() * 5)] };
    });
    function resize() {
      w = window.innerWidth; hgt = window.innerHeight;
      canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(hgt * dpr);
      canvas.style.width = w + 'px'; canvas.style.height = hgt + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function proj(px: number, py: number, pz = 0) {
      const cx = (px - camera.current.x) * camera.current.z + 0.5;
      const cy = (py - camera.current.y) * camera.current.z + 0.5;
      return { x: cx * w + pz * 80, y: cy * hgt + pz * 38 };
    }
    function orbPath(t: number) {
      const a = t * Math.PI * 2;
      return { x: 0.52 + Math.cos(a) * 0.19, y: 0.5 + Math.sin(a * 1.15) * 0.13 };
    }
    function glow(x: number, y: number, radius: number, color: string, alpha: number) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
      g.addColorStop(0, color);
      g.addColorStop(0.32, color + Math.floor(alpha * 255).toString(16).padStart(2, '0'));
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
    }
    function drawPetal(x: number, y: number, scale: number, angle: number, color: string, alpha: number) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.scale(scale, scale);
      ctx.globalAlpha = alpha;
      const g = ctx.createLinearGradient(-20, -36, 22, 42);
      g.addColorStop(0, '#ffe1eb'); g.addColorStop(0.28, color); g.addColorStop(1, '#360613');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, -42);
      ctx.bezierCurveTo(-35, -18, -36, 30, 0, 48);
      ctx.bezierCurveTo(36, 30, 35, -18, 0, -42);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,230,240,.18)'; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.restore(); ctx.globalAlpha = 1;
    }
    function drawRing(cx: number, cy: number, progress: number, color: string) {
      const e = ease(progress);
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.12);
      for (let i = 0; i < 4; i++) {
        ctx.globalAlpha = (0.26 - i * 0.035) * e;
        ctx.strokeStyle = i % 2 ? '#fff2fa' : color;
        ctx.lineWidth = 2.2 - i * 0.28;
        ctx.beginPath(); ctx.ellipse(0, 0, (190 + i * 42) * e, (90 + i * 22) * e, 0.12 * i, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.restore(); ctx.globalAlpha = 1;
    }
    function drawRoseOutline(cx: number, cy: number, progress: number) {
      const e = ease(progress); if (e <= 0) return;
      ctx.save(); ctx.translate(cx, cy); ctx.globalAlpha = e;
      ctx.strokeStyle = 'rgba(255,190,215,.92)'; ctx.lineWidth = 1.35;
      ctx.shadowColor = '#ff4f93'; ctx.shadowBlur = 18;
      for (let k = 0; k < 3; k++) {
        ctx.beginPath();
        for (let i = 0; i <= 620; i++) {
          const t = i / 620 * Math.PI * 2 * 3.25;
          const rose = 0.45 + 0.28 * Math.cos(5 * t + k * 0.7);
          const rad = (46 + rose * 130 + k * 14) * e;
          const x = Math.cos(t) * rad;
          const y = Math.sin(t) * rad * 0.78;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.restore(); ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    }
    function draw(ts: number) {
      raf = requestAnimationFrame(draw);
      camera.current.x = mix(camera.current.x, target.current.x, 0.045);
      camera.current.y = mix(camera.current.y, target.current.y, 0.045);
      camera.current.z = mix(camera.current.z, target.current.z, 0.045);
      ctx.clearRect(0, 0, w, hgt);
      const bg = ctx.createRadialGradient(w * 0.5, hgt * 0.45, 0, w * 0.5, hgt * 0.5, Math.max(w, hgt));
      bg.addColorStop(0, '#1c0718'); bg.addColorStop(0.45, '#08030b'); bg.addColorStop(1, '#000006');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, hgt);
      stars.forEach(s => { const p = proj(s.x, s.y, (s.z - 0.5) * 0.1); ctx.fillStyle = s.hue > .62 ? 'rgba(255,119,173,.5)' : 'rgba(154,255,238,.34)'; ctx.fillRect(p.x, p.y, s.s, s.s); });
      dust.forEach(s => { const p = proj(0.5 + s.x, 0.5 + s.y, s.z); ctx.fillStyle = s.hue > .72 ? 'rgba(255,110,160,.55)' : 'rgba(255,205,225,.38)'; ctx.fillRect(p.x, p.y, s.s, s.s); });
      nodes.forEach((n, i) => {
        const base = orbPath(i / nodes.length + 0.03);
        const p = proj(base.x, base.y, 0.02);
        glow(p.x, p.y, 34, n.c, .18); ctx.fillStyle = '#fff7fb'; ctx.beginPath(); ctx.arc(p.x, p.y, 7, 0, Math.PI * 2); ctx.fill();
      });
      const current = selected.current;
      if (current) {
        const elapsed = Math.min(1, (ts - startTime.current) / 1800);
        const p0 = orbPath(current.index / nodes.length + 0.03);
        const center = proj(p0.x, p0.y, 0.04);
        glow(center.x, center.y, 160 * (1 - elapsed), current.c, 0.2 * (1 - elapsed));
        const petalProgress = clamp((elapsed - 0.14) / 0.72);
        petals.forEach((pt, i) => {
          const q = clamp((petalProgress - pt.delay) / (1 - pt.delay));
          const e = ease(q);
          const x = center.x + pt.x * w * 0.42 * e;
          const y = center.y + pt.y * hgt * 0.62 * e;
          drawPetal(x, y, pt.sc * (0.42 + e * 0.72), pt.rot + e * 1.1 + i * 0.03, pt.color, e * 0.9);
        });
        drawRing(center.x, center.y, clamp((elapsed - 0.28) / 0.55), current.c);
        drawRoseOutline(center.x, center.y, clamp((elapsed - 0.46) / 0.48));
      }
      ctx.fillStyle = 'rgba(255,245,250,.94)'; ctx.font = '700 clamp(38px,8vw,112px) system-ui'; ctx.fillText(selected.current ? selected.current.title : '黑场花瓣雨', 44, 120);
      ctx.fillStyle = 'rgba(255,235,245,.64)'; ctx.font = '15px system-ui'; ctx.fillText('点击光点后，镜头推近，光点消散成可见玫瑰花瓣雨，最后停成霓虹圆环与玫瑰轮廓。', 48, 154);
    }
    function click(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      let best: any = null, bd = 1e9;
      nodes.forEach((n, i) => { const base = orbPath(i / nodes.length + 0.03); const p = proj(base.x, base.y); const d = Math.hypot(mx - p.x, my - p.y); if (d < bd) { bd = d; best = { ...n, index: i }; } });
      if (best && bd < 90) { selected.current = best; startTime.current = performance.now(); const base = orbPath(best.index / nodes.length + 0.03); target.current = { x: base.x, y: base.y, z: 1.95 }; }
    }
    window.addEventListener('resize', resize); canvas.addEventListener('click', click); resize(); raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); canvas.removeEventListener('click', click); };
  }, []);

  return h('div', { style: { position: 'fixed', inset: 0, background: '#020006', overflow: 'hidden' } },
    h('canvas', { ref: canvasRef, style: { position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' } })
  );
}
