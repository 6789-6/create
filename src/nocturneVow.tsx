import { createElement, useMemo, useState } from 'react';

const h = createElement;
const scenes = [
  ['first', '初见', '一束很轻的光，停在夜色边缘。', '#f6d7e7', 34, 54],
  ['vow', '誓约', '把一句话收进安静的玻璃圆环。', '#d9c291', 68, 43],
  ['moon', '月信', '月光像没有寄出的信。', '#d8e8ff', 58, 66],
  ['aurora', '极光', '远处的极光被折成一条细线。', '#9fe7d8', 76, 58]
] as const;

type Scene = typeof scenes[number];

const css = `
*{box-sizing:border-box}html,body,#root{margin:0;width:100%;height:100%;overflow:hidden}body{font-family:Inter,ui-sans-serif,system-ui,'Microsoft YaHei',sans-serif;background:#030305;color:#f8f0ec}.nv{position:fixed;inset:0;overflow:hidden;background:radial-gradient(circle at 68% 38%,rgba(162,137,108,.13),transparent 28%),radial-gradient(circle at 22% 72%,rgba(106,42,74,.2),transparent 34%),linear-gradient(135deg,#030304,#08060a 46%,#020204)}.nv:before{content:'';position:absolute;inset:0;background-image:radial-gradient(circle,rgba(255,244,230,.7) 0 1px,transparent 1.6px);background-size:96px 96px;opacity:.13}.nv:after{content:'';position:absolute;inset:-20%;background:radial-gradient(ellipse at 50% 50%,transparent 35%,rgba(0,0,0,.55) 78%)}.brand{position:absolute;left:5vw;top:7vh;z-index:3;max-width:420px}.brand small{display:inline-block;padding:8px 14px;border:1px solid rgba(230,205,170,.22);border-radius:999px;color:#c8b99f;letter-spacing:.26em;font-size:11px;background:rgba(255,255,255,.035)}.brand h1{margin:24px 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:clamp(48px,7vw,118px);line-height:.88;font-weight:500;letter-spacing:-.08em;color:#fff6ef;text-shadow:0 0 34px rgba(218,177,132,.2)}.brand p{margin:0;color:rgba(255,242,232,.62);line-height:1.85;font-size:15px}.stage{position:absolute;left:50%;top:50%;width:min(72vw,900px);height:min(72vw,720px);transform:translate(-48%,-48%);z-index:1}.glass{position:absolute;inset:0;filter:drop-shadow(0 0 44px rgba(214,178,132,.12))}.pearl{position:absolute;z-index:4;transform:translate(-50%,-50%);border:0;background:transparent;color:#fff;cursor:pointer}.pearl i{display:block;width:18px;height:18px;border-radius:50%;background:radial-gradient(circle at 35% 28%,#fff,var(--c) 40%,rgba(255,255,255,.05) 76%);box-shadow:0 0 24px var(--c),0 0 70px rgba(230,205,170,.16)}.pearl span{position:absolute;left:50%;top:28px;transform:translateX(-50%);padding:5px 10px;border-radius:999px;border:1px solid rgba(255,236,210,.14);background:rgba(8,8,10,.45);font-size:12px;letter-spacing:.18em;white-space:nowrap;opacity:0;transition:.25s}.pearl:hover span,.pearl.on span{opacity:1}.ritual{position:absolute;inset:0;z-index:2;pointer-events:none;animation:arrive 1.2s cubic-bezier(.2,.8,.2,1) both}.ritual .beam{position:absolute;left:50%;top:50%;width:46vw;height:1px;background:linear-gradient(90deg,transparent,var(--c),#fff,var(--c),transparent);transform:translate(-50%,-50%) rotate(-18deg);box-shadow:0 0 26px var(--c);opacity:.62}.ritual .halo{position:absolute;left:50%;top:50%;width:36vw;height:16vw;border:1px solid var(--c);border-radius:50%;transform:translate(-50%,-50%) rotate(-13deg);box-shadow:0 0 80px color-mix(in srgb,var(--c),transparent 55%);opacity:.48}.ritual .trace{position:absolute;left:50%;top:50%;width:18vw;height:18vw;transform:translate(-50%,-50%)}.card{position:absolute;right:5vw;bottom:7vh;z-index:4;width:340px;padding:26px 28px;border-radius:26px;border:1px solid rgba(228,203,172,.18);background:linear-gradient(145deg,rgba(20,18,22,.62),rgba(5,5,8,.75));box-shadow:0 36px 90px rgba(0,0,0,.45);backdrop-filter:blur(18px)}.card small{color:#bfae90;letter-spacing:.22em;font-size:11px}.card h2{margin:12px 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:38px;font-weight:500}.card p{margin:0;color:rgba(255,242,232,.62);line-height:1.75}.nav{position:absolute;left:5vw;bottom:7vh;z-index:5;display:flex;gap:10px}.nav button{border:1px solid rgba(233,211,183,.17);background:rgba(255,255,255,.045);color:#f8eee6;border-radius:999px;padding:10px 18px;cursor:pointer;letter-spacing:.08em}.nav button.on{border-color:var(--c);box-shadow:0 0 22px color-mix(in srgb,var(--c),transparent 70%)}@keyframes arrive{from{opacity:0;filter:blur(14px);transform:scale(.88)}to{opacity:1;filter:blur(0);transform:scale(1)}}@media(max-width:760px){.brand{left:24px;right:24px;max-width:none}.brand h1{font-size:56px}.stage{width:110vw;height:70vh}.card{left:24px;right:24px;width:auto;bottom:92px}.nav{left:24px;right:24px;bottom:24px;flex-wrap:wrap}}
`;

function Artwork({ active }: { active: Scene | null }) {
  const accent = active?.[3] || '#d9c291';
  return h('div', { className: 'stage' },
    h('svg', { className: 'glass', viewBox: '0 0 900 720' },
      h('defs', null,
        h('linearGradient', { id: 'goldLine', x1: '0', x2: '1' }, h('stop', { offset: '0%', stopColor: '#6a5b48' }), h('stop', { offset: '50%', stopColor: '#fff0d7' }), h('stop', { offset: '100%', stopColor: '#6f5e4e' })),
        h('radialGradient', { id: 'core', cx: '45%', cy: '40%', r: '65%' }, h('stop', { offset: '0%', stopColor: '#fffaf1' }), h('stop', { offset: '32%', stopColor: accent }), h('stop', { offset: '100%', stopColor: 'rgba(255,255,255,0)' }))
      ),
      h('ellipse', { cx: '450', cy: '360', rx: '330', ry: '105', fill: 'none', stroke: 'url(#goldLine)', strokeWidth: '1.2', opacity: '.35', transform: 'rotate(-10 450 360)' }),
      h('ellipse', { cx: '450', cy: '360', rx: '240', ry: '310', fill: 'none', stroke: '#9fe7d8', strokeWidth: '.8', opacity: '.16', transform: 'rotate(38 450 360)' }),
      h('ellipse', { cx: '450', cy: '360', rx: '150', ry: '150', fill: 'url(#core)', opacity: '.2' }),
      h('path', { d: 'M451 460 C375 392 352 322 385 276 C420 226 486 246 506 304 C535 249 604 248 629 302 C656 362 578 432 451 460Z', fill: 'rgba(255,255,255,.035)', stroke: '#e6caa5', strokeWidth: '1.1', opacity: '.48' }),
      h('path', { d: 'M330 394 C410 355 494 344 586 386 M346 320 C436 378 502 382 593 324 M450 250 C432 338 438 403 450 512', fill: 'none', stroke: '#fff5df', strokeWidth: '1.1', opacity: '.28' }),
      h('circle', { cx: '450', cy: '360', r: '5', fill: '#fff9ef', opacity: '.9' })
    ),
    scenes.map(s => h('button', { key: s[0], className: `pearl ${active?.[0] === s[0] ? 'on' : ''}`, style: { left: `${s[4]}%`, top: `${s[5]}%`, '--c': s[3] } as any, onClick: () => window.dispatchEvent(new CustomEvent('choose-scene', { detail: s[0] })) }, h('i'), h('span', null, s[1])))
  );
}

function Ritual({ active }: { active: Scene | null }) {
  if (!active) return null;
  const c = active[3];
  return h('div', { className: 'ritual', style: { '--c': c } as any },
    h('div', { className: 'beam' }),
    h('div', { className: 'halo' }),
    h('svg', { className: 'trace', viewBox: '0 0 300 300' },
      h('path', { d: 'M150 238 C70 168 64 94 112 76 C137 66 158 82 150 111 C164 76 213 63 231 101 C253 148 198 197 150 238Z', fill: 'none', stroke: c, strokeWidth: '2', opacity: '.75' }),
      h('path', { d: 'M96 164 C139 136 170 135 210 160 M116 108 C145 146 170 151 206 112', fill: 'none', stroke: '#fff7ef', strokeWidth: '1', opacity: '.38' })
    )
  );
}

export function RomanceOrbitApp() {
  const [active, setActive] = useState<Scene | null>(null);
  useMemo(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      setActive(scenes.find(s => s[0] === id) || scenes[0]);
    };
    window.addEventListener('choose-scene', handler);
    return () => window.removeEventListener('choose-scene', handler);
  }, []);
  const current = active || scenes[1];
  return h('main', { className: 'nv' },
    h('style', null, css),
    h('section', { className: 'brand' }, h('small', null, 'ROMANCE ORBIT · NOCTURNE'), h('h1', null, current[1]), h('p', null, current[2])),
    h(Artwork, { active }),
    h(Ritual, { active }),
    h('nav', { className: 'nav' }, scenes.map(s => h('button', { key: s[0], className: current[0] === s[0] ? 'on' : '', style: { '--c': s[3] } as any, onClick: () => setActive(s) }, s[1]))),
    h('aside', { className: 'card' }, h('small', null, active ? 'CURRENT SCENE' : 'SELECT A PEARL'), h('h2', null, current[1]), h('p', null, current[2]))
  );
}
