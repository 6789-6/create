import { createElement, useMemo, useState } from 'react';

const h = createElement;

const scenes = [
  { id: 'first', name: '初见', title: '第一束光', text: '像夜色里忽然亮起的坐标，不喧哗，只把两个人轻轻照见。', x: 24, y: 58, color: '#ffd7ee' },
  { id: 'vow', name: '誓约', title: '极光誓约', text: '光环收拢成一个安静的承诺，像把未来放进同一片夜空。', x: 76, y: 42, color: '#9ffff1' },
  { id: 'moon', name: '月信', title: '月光来信', text: '没有说出口的话，被月光折成细小的银色信笺。', x: 66, y: 72, color: '#ffe0aa' },
  { id: 'star', name: '星港', title: '星港慢舞', text: '所有星尘都停在远处，像一场只为此刻打开的港湾。', x: 38, y: 34, color: '#c5a8ff' }
];

type SceneItem = typeof scenes[number];

function StarField() {
  const stars = useMemo(() => Array.from({ length: 160 }, (_, i) => ({
    id: i,
    left: `${(i * 47) % 100}%`,
    top: `${(i * 83) % 100}%`,
    opacity: 0.18 + (i % 7) * 0.08,
    scale: 0.7 + (i % 5) * 0.22
  })), []);
  return h('div', { className: 'vow-stars' }, stars.map(s => h('i', { key: s.id, style: { left: s.left, top: s.top, opacity: s.opacity, transform: `scale(${s.scale})` } })));
}

function HeartGlyph() {
  return h('svg', { className: 'vow-heart', viewBox: '0 0 420 380', role: 'img', 'aria-label': 'glass heart' },
    h('defs', null,
      h('radialGradient', { id: 'vowHeartGradient', cx: '43%', cy: '30%', r: '75%' },
        h('stop', { offset: '0%', stopColor: '#fff7fb' }),
        h('stop', { offset: '30%', stopColor: '#ffadd5' }),
        h('stop', { offset: '68%', stopColor: '#8d3e79' }),
        h('stop', { offset: '100%', stopColor: '#1b071c' })
      )
    ),
    h('path', { d: 'M210 338C95 253 48 178 67 111c18-63 92-79 143-18 51-61 125-45 143 18 19 67-28 142-143 227Z', fill: 'url(#vowHeartGradient)', opacity: '.72' }),
    h('path', { d: 'M112 132c42-62 91-15 98 34 7-49 56-96 98-34', fill: 'none', stroke: '#fff2fb', strokeWidth: '6', strokeLinecap: 'round', opacity: '.62' }),
    h('path', { d: 'M132 210c34 36 63 58 78 69 16-11 45-33 78-69', fill: 'none', stroke: '#9ffff1', strokeWidth: '3', strokeLinecap: 'round', opacity: '.36' })
  );
}

function AuroraRitual({ active }: { active: SceneItem | null }) {
  if (!active) return null;
  const style = { '--accent': active.color } as Record<string, string>;
  return h('div', { className: 'aurora-ritual', style },
    h('div', { className: 'aurora-ring ring-one' }),
    h('div', { className: 'aurora-ring ring-two' }),
    h('div', { className: 'aurora-ring ring-three' }),
    h('div', { className: 'aurora-word' }, active.name),
    h('p', { className: 'aurora-line' }, active.text)
  );
}

export function RomanceOrbitApp() {
  const [active, setActive] = useState<SceneItem | null>(null);
  return h('main', { className: 'vow-page' },
    h('style', null, css),
    h(StarField),
    h('div', { className: 'vow-veil veil-a' }),
    h('div', { className: 'vow-veil veil-b' }),
    h('section', { className: 'vow-brand' },
      h('p', null, 'ROMANCE ORBIT · AURORA VOW'),
      h('h1', null, active ? active.title : '极光誓约'),
      h('span', null, active ? active.text : '点击珍珠光点，进入一段短暂过场；随后画面停成安静的浪漫场景。')
    ),
    h('section', { className: 'vow-stage' },
      h('div', { className: 'orbit-line line-a' }),
      h('div', { className: 'orbit-line line-b' }),
      h(HeartGlyph),
      scenes.map(s => h('button', { key: s.id, className: `vow-pearl ${active?.id === s.id ? 'active' : ''}`, style: { left: `${s.x}%`, top: `${s.y}%`, '--c': s.color } as Record<string, string>, onClick: () => setActive(s) }, h('span', null, s.name)))
    ),
    h(AuroraRitual, { active }),
    h('nav', { className: 'vow-pills' }, scenes.map(s => h('button', { key: s.id, className: active?.id === s.id ? 'active' : '', onClick: () => setActive(s) }, s.name))),
    h('aside', { className: 'vow-card' }, h('p', null, active ? 'CURRENT VOW' : 'SELECT A PEARL'), h('h2', null, active ? active.title : '选择一枚珍珠光点'), h('span', null, active ? active.text : '主题不再画塑料玫瑰，改用玻璃心形星体、极光圆环和珍珠星尘。'))
  );
}

const css = `
*{box-sizing:border-box}html,body,#root{margin:0;width:100%;height:100%;overflow:hidden}body{font-family:Inter,ui-sans-serif,system-ui,'Microsoft YaHei',sans-serif;background:#020106;color:#fff}.vow-page{position:fixed;inset:0;overflow:hidden;background:radial-gradient(circle at 55% 40%,rgba(112,37,91,.34),transparent 28%),radial-gradient(circle at 86% 8%,rgba(116,255,238,.14),transparent 24%),linear-gradient(135deg,#050209,#0e0613 42%,#010104)}.vow-stars i{position:absolute;width:2px;height:2px;border-radius:50%;background:rgba(255,226,240,.75);box-shadow:0 0 12px rgba(255,140,198,.55)}.vow-veil{position:absolute;left:-10%;right:-10%;height:42%;filter:blur(26px);opacity:.32;background:linear-gradient(90deg,transparent,rgba(255,92,171,.28),rgba(134,255,239,.2),transparent);transform:rotate(-8deg)}.veil-a{bottom:9%}.veil-b{top:10%;opacity:.22;transform:rotate(13deg)}.vow-brand{position:absolute;left:4vw;top:6vh;width:min(520px,42vw);z-index:5}.vow-brand p{margin:0 0 12px;font-size:12px;letter-spacing:.3em;color:#ffc2df}.vow-brand h1{margin:0;font-size:clamp(56px,8vw,126px);line-height:.88;letter-spacing:-.08em;text-shadow:0 0 34px rgba(255,110,185,.7)}.vow-brand span{display:block;margin-top:22px;line-height:1.9;color:rgba(255,238,246,.68);font-size:16px}.vow-stage{position:absolute;left:50%;top:50%;width:min(72vw,900px);height:min(72vw,740px);transform:translate(-50%,-50%)}.vow-heart{position:absolute;left:50%;top:50%;width:48%;overflow:visible;transform:translate(-50%,-47%);filter:drop-shadow(0 0 34px rgba(255,104,178,.42))}.orbit-line{position:absolute;left:50%;top:50%;border:1px solid rgba(255,220,236,.18);border-radius:50%;transform:translate(-50%,-50%) rotate(-9deg);box-shadow:0 0 60px rgba(255,87,165,.08)}.line-a{width:86%;height:34%}.line-b{width:58%;height:86%;transform:translate(-50%,-50%) rotate(62deg);border-color:rgba(127,255,238,.16)}.vow-pearl{position:absolute;z-index:6;transform:translate(-50%,-50%);border:0;background:transparent;color:#fff;cursor:pointer}.vow-pearl:before{content:'';display:block;width:18px;height:18px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,var(--c) 36%,rgba(255,255,255,.05) 72%);box-shadow:0 0 24px var(--c),0 0 60px rgba(255,255,255,.18)}.vow-pearl span{position:absolute;left:50%;top:28px;transform:translateX(-50%);white-space:nowrap;font-size:12px;letter-spacing:.18em;color:rgba(255,239,247,.72);opacity:0;transition:.25s}.vow-pearl:hover span,.vow-pearl.active span{opacity:1}.vow-pills{position:absolute;left:4vw;bottom:5vh;z-index:5;display:flex;gap:10px}.vow-pills button{color:#ffe8f3;background:rgba(255,255,255,.06);border:1px solid rgba(255,225,238,.18);border-radius:999px;padding:10px 18px;backdrop-filter:blur(12px);cursor:pointer}.vow-pills .active{background:rgba(255,95,161,.22);border-color:rgba(255,159,207,.48)}.vow-card{position:absolute;right:4vw;bottom:5vh;width:350px;z-index:5;padding:28px;border-radius:30px;background:linear-gradient(145deg,rgba(28,9,27,.72),rgba(8,5,15,.76));border:1px solid rgba(255,212,235,.2);box-shadow:0 30px 90px rgba(0,0,0,.45),inset 0 0 40px rgba(255,88,166,.06);backdrop-filter:blur(18px)}.vow-card p{margin:0 0 12px;color:#d6a8c5;letter-spacing:.22em;font-size:12px}.vow-card h2{margin:0 0 12px;font-size:34px}.vow-card span{color:rgba(255,238,246,.68);line-height:1.75}.aurora-ritual{position:absolute;inset:0;z-index:3;pointer-events:none;--accent:#9ffff1}.aurora-ring{position:absolute;left:50%;top:50%;border-radius:50%;border:1.5px solid var(--accent);box-shadow:0 0 38px var(--accent);opacity:.46;transform:translate(-50%,-50%) rotate(-10deg);animation:ringIn 1.1s cubic-bezier(.2,.8,.2,1) both}.ring-one{width:42vw;height:16vw}.ring-two{width:31vw;height:31vw;opacity:.24;transform:translate(-50%,-50%) rotate(56deg)}.ring-three{width:56vw;height:23vw;opacity:.16}.aurora-word{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:clamp(42px,7vw,110px);font-weight:800;letter-spacing:-.08em;text-shadow:0 0 26px var(--accent),0 0 80px rgba(255,255,255,.22)}.aurora-line{position:absolute;left:50%;top:66%;max-width:560px;transform:translateX(-50%);text-align:center;color:rgba(255,239,247,.68);line-height:1.75}@keyframes ringIn{from{opacity:0;scale:.3;filter:blur(8px)}to{filter:blur(0)}}@media(max-width:760px){.vow-brand{width:82vw}.vow-card{left:4vw;right:4vw;width:auto}.vow-stage{width:108vw;height:70vh}.vow-pills{flex-wrap:wrap;right:4vw}.vow-brand h1{font-size:58px}}
`;
