import React, { createElement, useEffect, useMemo, useState } from 'react';

const h = createElement;
const scenes = [
  { id: 'first', name: '初见', title: '第一束光', text: '像夜色里忽然亮起的坐标，不喧哗，只把两个人轻轻照见。', x: 18, y: 58, c: '#ffd7ee' },
  { id: 'vow', name: '誓约', title: '极光誓约', text: '光环收拢成一个安静的承诺，像把未来放进同一片夜空。', x: 78, y: 44, c: '#9ffff1' },
  { id: 'moon', name: '月信', title: '月光来信', text: '没有说出口的话，被月光折成细小的银色信笺。', x: 67, y: 72, c: '#ffe0aa' },
  { id: 'star', name: '星港', title: '星港慢舞', text: '所有星尘都停在远处，像一场只为此刻打开的港湾。', x: 35, y: 34, c: '#c5a8ff' },
];

function SceneHeart() {
  return h('svg', { className: 'aurora-heart', viewBox: '0 0 400 360', role: 'img', 'aria-label': 'Aurora heart' },
    h('defs', null,
      h('radialGradient', { id: 'heartCore', cx: '45%', cy: '34%', r: '70%' },
        h('stop', { offset: '0%', stopColor: '#fff6fb' }),
        h('stop', { offset: '28%', stopColor: '#ffb9dd' }),
        h('stop', { offset: '62%', stopColor: '#a14b88' }),
        h('stop', { offset: '100%', stopColor: '#2b0a2a' })
      ),
      h('linearGradient', { id: 'glassLine', x1: '0%', y1: '0%', x2: '100%', y2: '100%' },
        h('stop', { offset: '0%', stopColor: '#fff', stopOpacity: '.85' }),
        h('stop', { offset: '45%', stopColor: '#ff78bd', stopOpacity: '.45' }),
        h('stop', { offset: '100%', stopColor: '#93fff0', stopOpacity: '.55' })
      ),
      h('filter', { id: 'softGlow', x: '-40%', y: '-40%', width: '180%', height: '180%' },
        h('feGaussianBlur', { stdDeviation: '8', result: 'blur' }),
        h('feMerge', null, h('feMergeNode', { in: 'blur' }), h('feMergeNode', { in: 'SourceGraphic' }))
      )
    ),
    h('path', { className: 'heart-shadow', d: 'M200 318C92 238 48 168 66 106c17-58 85-72 134-18 49-54 117-40 134 18 18 62-26 132-134 212Z' }),
    h('path', { className: 'heart-fill', filter: 'url(#softGlow)', d: 'M200 318C92 238 48 168 66 106c17-58 85-72 134-18 49-54 117-40 134 18 18 62-26 132-134 212Z' }),
    h('path', { className: 'heart-line line1', d: 'M105 123c43-60 90-8 95 38 5-46 52-98 95-38' }),
    h('path', { className: 'heart-line line2', d: 'M117 194c38 44 70 68 83 77 15-10 50-37 84-77' }),
    h('path', { className: 'heart-spark', d: 'M147 108c22-23 47-22 70 2' }),
    h('circle', { cx: '155', cy: '92', r: '4', fill: '#fff', opacity: '.85' }),
    h('circle', { cx: '239', cy: '112', r: '3', fill: '#bffff5', opacity: '.75' })
  );
}

function RitualView({ scene, phase }: { scene: typeof scenes[number] | null; phase: number }) {
  if (!scene) return null;
  const style = { ['--accent' as any]: scene.c } as React.CSSProperties;
  return h('div', { className: `ritual ${phase < 2 ? 'forming' : 'still'}`, style },
    h('div', { className: 'vow-ring ring-a' }),
    h('div', { className: 'vow-ring ring-b' }),
    h('div', { className: 'vow-ring ring-c' }),
    h('div', { className: 'pearl-field' }, Array.from({ length: 46 }).map((_, i) => h('i', { key: i, style: { ['--i' as any]: i } as React.CSSProperties }))),
    h('div', { className: 'vow-mark' }, scene.name),
    h('div', { className: 'vow-caption' }, h('span', null, scene.title), h('p', null, scene.text))
  );
}

export function RomanceOrbitApp() {
  const [scene, setScene] = useState<typeof scenes[number] | null>(null);
  const [phase, setPhase] = useState(2);
  const stars = useMemo(() => Array.from({ length: 130 }, (_, i) => ({ id: i, l: (i * 47) % 100, t: (i * 83) % 100, s: 1 + (i % 4) * .45 })), []);
  useEffect(() => {
    if (!scene) return;
    setPhase(0);
    const a = window.setTimeout(() => setPhase(1), 80);
    const b = window.setTimeout(() => setPhase(2), 1280);
    return () => { window.clearTimeout(a); window.clearTimeout(b); };
  }, [scene]);
  const choose = (s: typeof scenes[number]) => setScene(s);

  return h('main', { className: 'vow-page' },
    h('style', null, css),
    h('div', { className: 'stars' }, stars.map(s => h('b', { key: s.id, style: { left: s.l + '%', top: s.t + '%', transform: `scale(${s.s})` } }))),
    h('div', { className: 'aurora-veil veil-one' }),
    h('div', { className: 'aurora-veil veil-two' }),
    h('section', { className: 'brand' },
      h('p', null, 'ROMANCE ORBIT · AURORA VOW'),
      h('h1', null, scene ? scene.title : '极光誓约'),
      h('span', null, scene ? scene.text : '点击珍珠光点，进入一段短暂过场；画面随后停成一张克制、干净、浪漫的静态场景。')
    ),
    h('section', { className: 'stage' },
      h('div', { className: 'orbit-ring ring-main' }),
      h('div', { className: 'orbit-ring ring-side' }),
      h(SceneHeart),
      scenes.map(s => h('button', { key: s.id, className: `pearl ${scene?.id === s.id ? 'active' : ''}`, style: { left: s.x + '%', top: s.y + '%', ['--c' as any]: s.c } as React.CSSProperties, onClick: () => choose(s), 'aria-label': s.title }, h('span', null, s.name)))
    ),
    h(RitualView, { scene, phase }),
    h('nav', { className: 'scene-pills' }, scenes.map(s => h('button', { key: s.id, className: scene?.id === s.id ? 'active' : '', onClick: () => choose(s) }, s.name))),
    h('aside', { className: 'note-card' }, h('p', null, scene ? 'CURRENT VOW' : 'SELECT A PEARL'), h('h2', null, scene ? scene.title : '选择一枚珍珠光点'), h('span', null, scene ? scene.text : '这次不再画塑料玫瑰，画面核心改成玻璃心形星体、极光圆环和珍珠星尘。'))
  );
}

const css = `
*{box-sizing:border-box}html,body,#root{margin:0;width:100%;height:100%;overflow:hidden}body{font-family:Inter,ui-sans-serif,system-ui,"Microsoft YaHei",sans-serif;background:#030207;color:#fff}.vow-page{position:fixed;inset:0;overflow:hidden;background:radial-gradient(circle at 55% 40%,rgba(104,28,80,.28),transparent 28%),radial-gradient(circle at 85% 10%,rgba(108,255,229,.12),transparent 24%),linear-gradient(135deg,#050209,#0d0611 42%,#010104);}.stars b{position:absolute;width:2px;height:2px;border-radius:50%;background:rgba(255,220,236,.65);box-shadow:0 0 10px rgba(255,155,210,.6);opacity:.55}.aurora-veil{position:absolute;inset:auto -10% 6% -10%;height:48%;filter:blur(22px);opacity:.34;transform:rotate(-8deg);background:linear-gradient(90deg,transparent,rgba(255,92,171,.28),rgba(134,255,239,.18),transparent);}.veil-two{top:8%;bottom:auto;opacity:.22;transform:rotate(12deg);background:linear-gradient(90deg,transparent,rgba(255,211,138,.18),rgba(255,93,164,.22),transparent)}.brand{position:absolute;left:4vw;top:6vh;width:min(520px,42vw);z-index:4}.brand p{margin:0 0 12px;letter-spacing:.28em;color:#ffbdd8;font-size:12px}.brand h1{margin:0;line-height:.88;font-size:clamp(58px,8.2vw,128px);letter-spacing:-.08em;text-shadow:0 0 34px rgba(255,116,185,.7)}.brand span{display:block;margin-top:22px;line-height:1.9;color:rgba(255,238,246,.68);font-size:16px}.stage{position:absolute;left:50%;top:50%;width:min(72vw,900px);height:min(72vw,740px);transform:translate(-50%,-50%);}.aurora-heart{position:absolute;left:50%;top:50%;width:48%;transform:translate(-50%,-47%);overflow:visible}.heart-fill{fill:url(#heartCore);opacity:.82}.heart-shadow{fill:rgba(255,80,155,.08)}.heart-line,.heart-spark{fill:none;stroke:url(#glassLine);stroke-width:5;stroke-linecap:round;opacity:.58}.line2{stroke-width:3;opacity:.32}.heart-spark{stroke-width:4;opacity:.48}.orbit-ring{position:absolute;left:50%;top:50%;border:1px solid rgba(255,210,230,.18);border-radius:50%;transform:translate(-50%,-50%) rotate(-9deg);box-shadow:0 0 60px rgba(255,87,165,.09)}.ring-main{width:86%;height:34%}.ring-side{width:58%;height:86%;transform:translate(-50%,-50%) rotate(62deg);border-color:rgba(127,255,238,.16)}.pearl{position:absolute;z-index:6;transform:translate(-50%,-50%);border:0;background:transparent;color:#fff;cursor:pointer}.pearl:before{content:"";display:block;width:18px;height:18px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,var(--c) 35%,rgba(255,255,255,.05) 70%);box-shadow:0 0 22px var(--c),0 0 58px rgba(255,255,255,.18)}.pearl span{position:absolute;left:50%;top:28px;transform:translateX(-50%);white-space:nowrap;font-size:12px;letter-spacing:.18em;color:rgba(255,239,247,.7);opacity:0;transition:.25s}.pearl:hover span,.pearl.active span{opacity:1}.scene-pills{position:absolute;left:4vw;bottom:5vh;z-index:5;display:flex;gap:10px}.scene-pills button{color:#ffe8f3;background:rgba(255,255,255,.06);border:1px solid rgba(255,225,238,.18);border-radius:999px;padding:10px 18px;backdrop-filter:blur(14px);cursor:pointer}.scene-pills .active{background:rgba(255,95,161,.2);border-color:rgba(255,159,207,.48)}.note-card{position:absolute;right:4vw;bottom:5vh;width:350px;z-index:5;padding:28px;border-radius:30px;background:linear-gradient(145deg,rgba(28,9,27,.72),rgba(8,5,15,.76));border:1px solid rgba(255,212,235,.2);box-shadow:0 30px 90px rgba(0,0,0,.45),inset 0 0 40px rgba(255,88,166,.06);backdrop-filter:blur(22px)}.note-card p{margin:0 0 12px;color:#d6a8c5;letter-spacing:.22em;font-size:12px}.note-card h2{margin:0 0 12px;font-size:34px}.note-card span{color:rgba(255,238,246,.68);line-height:1.75}.ritual{position:absolute;inset:0;pointer-events:none;z-index:3;--accent:#ff8dc8}.ritual.forming .vow-ring{animation:ringIn 1.1s cubic-bezier(.2,.8,.2,1) both}.vow-ring{position:absolute;left:50%;top:50%;border-radius:50%;border:1.5px solid color-mix(in srgb,var(--accent),white 18%);box-shadow:0 0 38px color-mix(in srgb,var(--accent),transparent 35%);opacity:.72;transform:translate(-50%,-50%) rotate(-10deg)}.ring-a{width:42vw;height:16vw}.ring-b{width:31vw;height:31vw;transform:translate(-50%,-50%) rotate(56deg);opacity:.34}.ring-c{width:56vw;height:23vw;opacity:.2}.vow-mark{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:clamp(42px,7vw,110px);font-weight:800;letter-spacing:-.08em;color:#fff;text-shadow:0 0 26px var(--accent),0 0 80px rgba(255,255,255,.22)}.vow-caption{position:absolute;left:50%;top:67%;transform:translateX(-50%);text-align:center;max-width:520px}.vow-caption span{font-size:22px;font-weight:700}.vow-caption p{color:rgba(255,239,247,.66);line-height:1.7}.pearl-field i{position:absolute;left:calc(50% + (sin(var(--i))*1px));top:50%;width:4px;height:4px;border-radius:50%;background:var(--accent);box-shadow:0 0 16px var(--accent);transform:translate(calc(cos(var(--i))*22vw),calc(sin(var(--i))*10vw));opacity:.5}@keyframes ringIn{from{opacity:0;scale:.62;filter:blur(8px)}to{opacity:.72;scale:1;filter:blur(0)}}@media(max-width:760px){.brand{width:86vw}.note-card{left:4vw;right:4vw;width:auto}.stage{width:96vw;height:70vh}.scene-pills{flex-wrap:wrap;right:4vw}.brand h1{font-size:62px}}
`;
";}