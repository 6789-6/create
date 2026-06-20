import { createElement, useEffect, useRef } from 'react';

const h = createElement;
const nodes = [
  { title: '初见', x: 0.38, y: 0.47, color: '#f6d6df' },
  { title: '玫瑰', x: 0.50, y: 0.40, color: '#d55a7e' },
  { title: '月光', x: 0.63, y: 0.48, color: '#f4d9a5' },
  { title: '极光', x: 0.55, y: 0.60, color: '#a7fff0' },
  { title: '未来', x: 0.70, y: 0.56, color: '#f1a968' }
];

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function clamp(v: number) { return Math.max(0, Math.min(1, v)); }
function ease(t: number) { return t * t * (3 - 2 * t); }
function rnd(seed: number) {
  let s = seed;
  return () => {
    s = Math.imul(1664525, s) + 1013904223;
    return (s >>> 0) / 4294967296;
  };
}

export function RomanceOrbitApp() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const chosen = useRef<any>(null);
  const started = useRef(0);
  const cam = useRef({ x: 0.5, y: 0.5, z: 1 });
  const to = useRef({ x: 0.5, y: 0.5, z: 1 });

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    let w = 1, hgt = 1, raf = 0;
    const dpr = Math.min(devicePixelRatio || 1, 1.8);
    const rand = rnd(20260620);
    const stars = Array.from({ length: 1300 }, () => ({ x: rand(), y: rand(), s: 0.25 + rand() * 1.15, a: 0.08 + rand() * 0.45 }));
    const motes = Array.from({ length: 360 }, () => ({ x: (rand() - .5), y: (rand() - .5), r: rand(), a: rand() * Math.PI * 2, s: .4 + rand() * 1.6 }));

    function resize() {
      w = innerWidth; hgt = innerHeight;
      canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(hgt * dpr);
      canvas.style.width = w + 'px'; canvas.style.height = hgt + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function project(x: number, y: number) {
      return { x: ((x - cam.current.x) * cam.current.z + .5) * w, y: ((y - cam.current.y) * cam.current.z + .5) * hgt };
    }
    function bg() {
      const g = ctx.createRadialGradient(w * .58, hgt * .42, 0, w * .5, hgt * .5, Math.max(w, hgt));
      g.addColorStop(0, '#1b0714'); g.addColorStop(.42, '#07020a'); g.addColorStop(1, '#000004');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, hgt);
      ctx.fillStyle = 'rgba(255,210,226,.75)';
      stars.forEach(s => { ctx.globalAlpha = s.a; ctx.fillRect(s.x * w, s.y * hgt, s.s, s.s); });
      ctx.globalAlpha = 1;
    }
    function pearl(x: number, y: number, color: string, big = false) {
      const r = big ? 26 : 16;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, '#fff'); g.addColorStop(.2, color); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff8fb'; ctx.beginPath(); ctx.arc(x, y, big ? 5 : 3.5, 0, Math.PI * 2); ctx.fill();
    }
    function drawOrbit() {
      ctx.save(); ctx.translate(w * .52, hgt * .5); ctx.rotate(-0.18);
      for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = `rgba(255,202,222,${0.12 - i * 0.03})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(0, 0, w * (.17 + i * .055), hgt * (.08 + i * .02), 0, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.restore();
    }
    function rosePath(cx: number, cy: number, scale: number, reveal: number) {
      ctx.save(); ctx.translate(cx, cy); ctx.scale(scale, scale);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalAlpha = reveal;
      ctx.strokeStyle = 'rgba(255,221,232,.96)'; ctx.lineWidth = 2.1; ctx.shadowColor = '#c74b78'; ctx.shadowBlur = 14;
      const steps = Math.floor(22 * reveal);
      const curves = [
        [-18,-10,-42,-45,8,-58,20,-26], [20,-26,50,-54,60,-5,18,8], [18,8,42,38,-18,45,-22,10],
        [-22,10,-55,24,-45,-25,-18,-10], [-6,-4,-12,-28,18,-30,16,-6], [16,-6,34,0,15,20,-2,10],
        [-2,10,-23,22,-24,-8,-6,-4], [0,34,4,84,1,120,0,164], [0,86,-44,70,-72,38,-82,8],
        [3,104,42,94,68,60,82,28], [-8,154,-46,160,-74,188,-96,220], [10,148,50,154,80,184,106,216]
      ];
      ctx.beginPath();
      for (let i = 0; i < Math.min(curves.length, steps); i++) {
        const c = curves[i]; ctx.moveTo(c[0], c[1]); ctx.bezierCurveTo(c[2], c[3], c[4], c[5], c[6], c[7]);
      }
      ctx.stroke();
      ctx.shadowBlur = 0; ctx.globalAlpha = 1; ctx.restore();
    }
    function goldDust(cx: number, cy: number, progress: number) {
      const p = ease(progress);
      motes.forEach(m => {
        const rad = (40 + m.r * 220) * p;
        const x = cx + Math.cos(m.a) * rad * .9;
        const y = cy + Math.sin(m.a) * rad * .5;
        ctx.globalAlpha = (1 - p * .6) * .45;
        ctx.fillStyle = m.r > .5 ? '#f7d8a5' : '#f3abc8';
        ctx.beginPath(); ctx.arc(x, y, m.s, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
    }
    function draw(ts: number) {
      raf = requestAnimationFrame(draw);
      cam.current.x = lerp(cam.current.x, to.current.x, .045);
      cam.current.y = lerp(cam.current.y, to.current.y, .045);
      cam.current.z = lerp(cam.current.z, to.current.z, .045);
      bg(); drawOrbit();
      nodes.forEach((n, i) => {
        const angle = i / nodes.length * Math.PI * 2 - .4;
        const p = project(.52 + Math.cos(angle) * .18, .5 + Math.sin(angle) * .13);
        pearl(p.x, p.y, n.color, chosen.current?.title === n.title);
      });
      if (chosen.current) {
        const age = clamp((ts - started.current) / 1800);
        const p = project(chosen.current.x, chosen.current.y);
        goldDust(p.x, p.y, clamp(age / .55));
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(-.1);
        ctx.strokeStyle = 'rgba(255,212,230,.55)'; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.ellipse(0, 0, 210 * ease(clamp((age-.22)/.5)), 76 * ease(clamp((age-.22)/.5)), 0, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
        rosePath(p.x, p.y - 85, Math.min(w, hgt) / 760, clamp((age - .32) / .55));
      }
      ctx.fillStyle = 'rgba(255,247,250,.92)';
      ctx.font = '700 clamp(26px,5vw,68px) system-ui';
      ctx.fillText(chosen.current ? chosen.current.title : 'Romance Atelier', 44, 82);
      ctx.font = '14px system-ui'; ctx.fillStyle = 'rgba(255,227,237,.62)';
      ctx.fillText(chosen.current ? '光点散成金粉，线稿玫瑰在暗场中安静描出。' : '点击任意珍珠光点，进入一段克制、静态、线稿玫瑰过场。', 48, 112);
    }
    function click(e: MouseEvent) {
      const mx = e.clientX, my = e.clientY; let best: any = null, bd = 9999;
      nodes.forEach((n, i) => {
        const angle = i / nodes.length * Math.PI * 2 - .4;
        const p0 = { x: .52 + Math.cos(angle) * .18, y: .5 + Math.sin(angle) * .13 };
        const p = project(p0.x, p0.y); const d = Math.hypot(mx - p.x, my - p.y);
        if (d < bd) { bd = d; best = { ...n, x: p0.x, y: p0.y }; }
      });
      if (best && bd < 90) { chosen.current = best; started.current = performance.now(); to.current = { x: best.x, y: best.y, z: 2.05 }; }
    }
    addEventListener('resize', resize); canvas.addEventListener('click', click); resize(); raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize); canvas.removeEventListener('click', click); };
  }, []);
  return h('div', { style: { position: 'fixed', inset: 0, background: '#020006' } }, h('canvas', { ref, style: { width: '100%', height: '100%', display: 'block' } }));
}
