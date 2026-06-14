import { useEffect, useMemo, useRef, useState } from 'react';

type Dynasty = '先秦' | '汉魏六朝' | '唐' | '宋' | '元明清' | '近现代';
type Poet = {
  id: string;
  name: string;
  dynasty: Dynasty;
  x: number;
  y: number;
  z: number;
  mass: number;
  count: number;
  summary: string;
  works: string[];
  relations: string[];
  themes: string[];
};
type Star = { x: number; y: number; z: number; r: number; dynasty: Dynasty; seed: number };

const dynastyColors: Record<Dynasty, string> = {
  先秦: '#8df7ff',
  汉魏六朝: '#b9a7ff',
  唐: '#ffd36c',
  宋: '#70ffca',
  元明清: '#ff8bc8',
  近现代: '#93b7ff'
};
const dynasties = Object.keys(dynastyColors) as Dynasty[];

const poets: Poet[] = [
  { id: 'li-bai', name: '李白', dynasty: '唐', x: -48, y: 18, z: -18, mass: 12, count: 1058, summary: '盛唐浪漫主义诗歌的最高峰之一。星域明亮、外扩，意象以月、酒、山河、远游为核心。', works: ['将进酒', '静夜思', '蜀道难', '梦游天姥吟留别'], relations: ['du-fu', 'meng-haoran', 'wang-wei'], themes: ['月', '酒', '远游', '山河'] },
  { id: 'du-fu', name: '杜甫', dynasty: '唐', x: -36, y: 8, z: 14, mass: 11, count: 1458, summary: '现实主义诗歌的巍峨主星。星域厚重，代表战争、民生、家国、历史记忆。', works: ['春望', '登高', '茅屋为秋风所破歌', '兵车行'], relations: ['li-bai', 'bai-juyi', 'wang-wei'], themes: ['家国', '民生', '历史', '沉郁'] },
  { id: 'wang-wei', name: '王维', dynasty: '唐', x: -20, y: 28, z: -45, mass: 8.5, count: 410, summary: '诗佛。山水田园诗的静默星团，色彩清冷，空间稀疏而有禅意。', works: ['山居秋暝', '鹿柴', '相思', '使至塞上'], relations: ['li-bai', 'du-fu', 'meng-haoran'], themes: ['山水', '禅', '田园', '边塞'] },
  { id: 'bai-juyi', name: '白居易', dynasty: '唐', x: -5, y: -12, z: 38, mass: 8.8, count: 3000, summary: '新乐府运动的重要诗人，星点密集，语言通俗，社会关怀清晰。', works: ['长恨歌', '琵琶行', '卖炭翁', '赋得古原草送别'], relations: ['du-fu', 'su-shi'], themes: ['叙事', '讽喻', '民生', '长歌'] },
  { id: 'su-shi', name: '苏轼', dynasty: '宋', x: 28, y: 20, z: -28, mass: 10, count: 2700, summary: '宋代文学宇宙中最明亮的恒星之一。诗、词、文、书画多维展开。', works: ['水调歌头', '念奴娇·赤壁怀古', '题西林壁', '江城子'], relations: ['bai-juyi', 'xin-qiji', 'li-qingzhao'], themes: ['豪放', '旷达', '赤壁', '人生'] },
  { id: 'li-qingzhao', name: '李清照', dynasty: '宋', x: 48, y: 4, z: 8, mass: 7.5, count: 180, summary: '婉约词宗，星域细密而明亮，前期清丽，后期沉痛。', works: ['声声慢', '如梦令', '一剪梅', '醉花阴'], relations: ['su-shi', 'xin-qiji'], themes: ['婉约', '离愁', '女性书写', '家国'] },
  { id: 'xin-qiji', name: '辛弃疾', dynasty: '宋', x: 38, y: -18, z: 38, mass: 8.8, count: 629, summary: '豪放词的巨星，剑气、山河、壮志与失意交织成高能星团。', works: ['永遇乐·京口北固亭怀古', '青玉案·元夕', '破阵子', '丑奴儿'], relations: ['su-shi', 'li-qingzhao'], themes: ['豪放', '抗金', '山河', '壮志'] },
  { id: 'qu-yuan', name: '屈原', dynasty: '先秦', x: -78, y: 2, z: 30, mass: 9.5, count: 25, summary: '中国浪漫主义诗歌的远古源点，楚辞星云呈现神话、香草美人和政治理想。', works: ['离骚', '九歌', '天问', '招魂'], relations: ['tao-yuanming', 'li-bai'], themes: ['楚辞', '神话', '理想', '香草美人'] },
  { id: 'tao-yuanming', name: '陶渊明', dynasty: '汉魏六朝', x: -62, y: -26, z: -30, mass: 8.2, count: 174, summary: '田园诗的根系主星，星域低亮、温暖、稳定，代表归隐与精神自由。', works: ['归园田居', '饮酒', '桃花源记', '杂诗'], relations: ['qu-yuan', 'wang-wei'], themes: ['田园', '归隐', '自然', '自由'] },
  { id: 'na-lan', name: '纳兰性德', dynasty: '元明清', x: 72, y: -8, z: -18, mass: 6.8, count: 340, summary: '清词中极具辨识度的明亮星点，情感纤细，光晕偏粉紫。', works: ['木兰花令', '长相思', '浣溪沙', '蝶恋花'], relations: ['li-qingzhao'], themes: ['清词', '离别', '悼亡', '幽微'] }
];

const poems = [
  { title: '将进酒', poet: '李白', text: '君不见黄河之水天上来，奔流到海不复回。' },
  { title: '春望', poet: '杜甫', text: '国破山河在，城春草木深。' },
  { title: '水调歌头', poet: '苏轼', text: '明月几时有，把酒问青天。' },
  { title: '声声慢', poet: '李清照', text: '寻寻觅觅，冷冷清清，凄凄惨惨戚戚。' },
  { title: '离骚', poet: '屈原', text: '路漫漫其修远兮，吾将上下而求索。' }
];

function rng(seed: number) {
  let t = seed + 0x6D2B79F5;
  return () => {
    t += 0x6D2B79F5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function buildStars(total = 85000): Star[] {
  const random = rng(20260614);
  const stars: Star[] = [];
  for (let i = 0; i < total; i++) {
    const d = dynasties[Math.floor(random() * dynasties.length)];
    const arm = dynasties.indexOf(d) / dynasties.length * Math.PI * 2;
    const radius = 18 + Math.pow(random(), 0.72) * 148;
    const angle = arm + radius * 0.045 + (random() - 0.5) * 0.95;
    stars.push({
      x: Math.cos(angle) * radius + (random() - 0.5) * 35,
      y: (random() - 0.5) * 72 + Math.sin(radius * 0.07) * 7,
      z: Math.sin(angle) * radius + (random() - 0.5) * 35,
      r: 0.35 + random() * 1.7,
      dynasty: d,
      seed: random()
    });
  }
  return stars;
}

function rotate(point: { x: number; y: number; z: number }, yaw: number, pitch: number, zoom: number, w: number, h: number) {
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  const x1 = point.x * cy - point.z * sy;
  const z1 = point.x * sy + point.z * cy;
  const y1 = point.y * cp - z1 * sp;
  const z2 = point.y * sp + z1 * cp;
  const depth = 360 + z2 * zoom;
  const scale = 500 / Math.max(60, depth);
  return { x: w / 2 + x1 * scale * zoom, y: h / 2 + y1 * scale * zoom, scale, depth };
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'explore' | 'network' | 'reading' | 'tour'>('explore');
  const [selected, setSelected] = useState(poets[0]);
  const [activeDynasties, setActiveDynasties] = useState<Dynasty[]>(dynasties);
  const [zoom, setZoom] = useState(1.05);
  const pointer = useRef({ down: false, x: 0, y: 0, yaw: -0.35, pitch: 0.14 });
  const stars = useMemo(() => buildStars(), []);

  const filteredPoets = useMemo(() => {
    const q = query.trim().toLowerCase();
    return poets.filter(p => activeDynasties.includes(p.dynasty) && (!q || [p.name, p.dynasty, p.summary, ...p.works, ...p.themes].join('').toLowerCase().includes(q)));
  }, [query, activeDynasties]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let raf = 0;
    let time = 0;
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      canvas.style.width = innerWidth + 'px';
      canvas.style.height = innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    addEventListener('resize', resize);

    const render = () => {
      time += 0.006;
      const w = innerWidth, h = innerHeight;
      const yaw = pointer.current.yaw + (mode === 'tour' ? time * 0.18 : 0);
      const pitch = pointer.current.pitch + Math.sin(time * 0.7) * 0.03;
      ctx.clearRect(0, 0, w, h);
      const grad = ctx.createRadialGradient(w * .5, h * .42, 0, w * .5, h * .5, Math.max(w, h));
      grad.addColorStop(0, '#102247');
      grad.addColorStop(.38, '#060b1b');
      grad.addColorStop(1, '#01030a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'lighter';
      const step = zoom < .75 ? 2 : 1;
      for (let i = 0; i < stars.length; i += step) {
        const s = stars[i];
        const active = activeDynasties.includes(s.dynasty);
        const p = rotate(s, yaw, pitch, zoom, w, h);
        if (p.x < -80 || p.x > w + 80 || p.y < -80 || p.y > h + 80) continue;
        const a = active ? Math.min(.9, .14 + p.scale * .8 + s.seed * .18) : .035;
        ctx.fillStyle = hexToRgba(dynastyColors[s.dynasty], a);
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(.28, s.r * p.scale * 1.8), 0, Math.PI * 2);
        ctx.fill();
      }

      if (mode === 'network') {
        ctx.lineWidth = 1;
        poets.forEach(p => p.relations.forEach(id => {
          const q = poets.find(item => item.id === id);
          if (!q) return;
          const a = rotate(p, yaw, pitch, zoom, w, h);
          const b = rotate(q, yaw, pitch, zoom, w, h);
          ctx.strokeStyle = 'rgba(138,232,255,.23)';
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }));
      }

      poets.forEach(poet => {
        const p = rotate(poet, yaw, pitch, zoom, w, h);
        const color = dynastyColors[poet.dynasty];
        const selectedGlow = selected.id === poet.id ? 2.3 : 1;
        const size = (poet.mass * p.scale * 2.2 + 4) * selectedGlow;
        ctx.shadowColor = color;
        ctx.shadowBlur = 22 * selectedGlow;
        ctx.fillStyle = '#fff8d7';
        ctx.beginPath(); ctx.arc(p.x, p.y, size, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(p.x, p.y, size * 1.9, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        if (p.scale > .72 || selected.id === poet.id) {
          ctx.fillStyle = selected.id === poet.id ? '#fff4b8' : 'rgba(229,246,255,.8)';
          ctx.font = `${selected.id === poet.id ? 17 : 13}px system-ui, sans-serif`;
          ctx.fillText(poet.name, p.x + size + 8, p.y - 6);
          ctx.font = '10px system-ui, sans-serif';
          ctx.fillStyle = 'rgba(221,238,255,.55)';
          ctx.fillText(`${poet.dynasty} · ${poet.count} 首`, p.x + size + 8, p.y + 10);
        }
      });
      ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(render);
    };
    render();
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize); };
  }, [stars, activeDynasties, selected, mode, zoom]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const onDown = (e: PointerEvent) => { pointer.current.down = true; pointer.current.x = e.clientX; pointer.current.y = e.clientY; };
    const onMove = (e: PointerEvent) => {
      if (!pointer.current.down) return;
      pointer.current.yaw += (e.clientX - pointer.current.x) * 0.004;
      pointer.current.pitch += (e.clientY - pointer.current.y) * 0.003;
      pointer.current.pitch = Math.max(-.8, Math.min(.8, pointer.current.pitch));
      pointer.current.x = e.clientX; pointer.current.y = e.clientY;
    };
    const onUp = () => { pointer.current.down = false; };
    const onWheel = (e: WheelEvent) => setZoom(z => Math.max(.45, Math.min(2.4, z - e.deltaY * .0008)));
    canvas.addEventListener('pointerdown', onDown);
    addEventListener('pointermove', onMove);
    addEventListener('pointerup', onUp);
    canvas.addEventListener('wheel', onWheel, { passive: true });
    return () => { canvas.removeEventListener('pointerdown', onDown); removeEventListener('pointermove', onMove); removeEventListener('pointerup', onUp); canvas.removeEventListener('wheel', onWheel); };
  }, []);

  const shownPoems = poems.filter(p => p.poet === selected.name || query && (p.title + p.text + p.poet).includes(query));

  return <main className="app">
    <canvas ref={canvasRef} className="galaxy" />
    <div className="vignette" />
    <header className="title"><span>POEM CLOUD OBSERVATORY</span><h1>诗云</h1><p><b>32,657</b> 位诗人 / <b>933,857</b> 首诗 / 三千年诗歌星系</p></header>

    <aside className="panel left">
      <div className="search"><input value={query} onChange={e => setQuery(e.target.value)} placeholder="搜索诗人、诗名、意象：李白 / 明月 / 家国" /><button onClick={() => filteredPoets[0] && setSelected(filteredPoets[0])}>定位</button></div>
      <div className="modes">{(['explore','network','reading','tour'] as const).map(m => <button key={m} className={mode===m?'active':''} onClick={() => setMode(m)}>{({explore:'探诗',network:'关系',reading:'读诗',tour:'巡航'} as const)[m]}</button>)}</div>
      <section><h3>朝代星云</h3><div className="dynasties">{dynasties.map(d => <button key={d} className={activeDynasties.includes(d)?'active':''} style={{'--c': dynastyColors[d]} as React.CSSProperties} onClick={() => setActiveDynasties(a => a.includes(d) ? (a.length > 1 ? a.filter(x => x!==d) : a) : [...a, d])}><i />{d}</button>)}</div></section>
      <section><h3>诗人主星</h3><div className="results">{filteredPoets.map(p => <button key={p.id} onClick={() => { setSelected(p); setMode('explore'); }}><b>{p.name}</b><span>{p.dynasty} · {p.count} 首 · {p.themes.join(' / ')}</span></button>)}</div></section>
    </aside>

    <aside className="panel right" style={{'--accent': dynastyColors[selected.dynasty]} as React.CSSProperties}>
      <div className="star-card"><div className="big-star" /><div><span>{selected.dynasty}主星</span><h2>{selected.name}</h2><p>{selected.count} 首诗词映射为局部星域</p></div></div>
      <section><h3>星域解释</h3><p className="summary">{selected.summary}</p><div className="tags">{selected.themes.map(t => <em key={t}>{t}</em>)}</div></section>
      <section><h3>代表作品</h3><div className="works">{selected.works.map(w => <button key={w} onClick={() => setMode('reading')}>{w}<span>点击进入沉浸读诗</span></button>)}</div></section>
      <section><h3>关系航线</h3><div className="tags">{selected.relations.map(id => <em key={id}>{poets.find(p => p.id===id)?.name}</em>)}</div></section>
      {mode === 'reading' && <section className="reader"><h3>诗歌切片</h3>{(shownPoems.length ? shownPoems : poems).slice(0,3).map(p => <blockquote key={p.title}><strong>《{p.title}》 · {p.poet}</strong><br />{p.text}</blockquote>)}</section>}
    </aside>

    <footer className="console"><i />拖拽旋转星系<span>滚轮缩放</span><span>关系模式显示诗人航线</span><span>读诗模式打开沉浸卡片</span></footer>
  </main>;
}

function hexToRgba(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

export default App;
