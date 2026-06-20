import { CSSProperties, createElement, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { themeItems } from './themeData';
import { nodeSeeds, OrbitNode } from './romanceCore';

const h = createElement;
const three = (tag: string, props?: any, ...children: any[]) => h(tag as any, props, ...children);
const SCENE_ROT = new THREE.Euler(-0.05, -0.16, 0);

const vertex = `
  attribute float size;
  attribute vec3 color;
  varying vec3 vColor;
  void main(){
    vColor=color;
    vec4 mv=modelViewMatrix*vec4(position,1.0);
    gl_PointSize=clamp(size*(300.0/max(1.0,-mv.z)),1.0,18.0);
    gl_Position=projectionMatrix*mv;
  }
`;

const fragment = `
  varying vec3 vColor;
  void main(){
    vec2 p=gl_PointCoord-vec2(.5);
    float d=length(p);
    float a=smoothstep(.5,0.,d)+smoothstep(.5,.1,d)*.45;
    if(a<.03) discard;
    gl_FragColor=vec4(vColor,a);
  }
`;

const detail: Record<string, { k: string; t: string; s: string; m: string[] }> = {
  first: { k: 'SCENE 01 · 星光初见', t: '一束光先替我靠近你', s: '镜头先靠近那颗光点，然后停成一条安静的心跳彗尾。', m: ['靠近', '心跳', '星束'] },
  rose: { k: 'SCENE 02 · 玫瑰星云', t: '不是一朵花，是一片夜空盛开', s: '抵达玫瑰光点后，五瓣玫瑰星云在旁边静止盛开。', m: ['玫瑰', '花瓣', '柔光'] },
  moon: { k: 'SCENE 03 · 月光来信', t: '月亮把没说出口的话写成金色轨道', s: '镜头停靠后，金色信笺线像月光折成的来信。', m: ['月光', '信笺', '金色'] },
  aurora: { k: 'SCENE 04 · 极光慢舞', t: '安静也可以有颜色', s: '靠近极光节点后，青绿色光幕固定成一片立体夜色。', m: ['极光', '慢舞', '夜空'] },
  future: { k: 'SCENE 05 · 未来光环', t: '把愿望折成一圈一圈靠近的轨道', s: '镜头抵达未来光点，戒环星门停成一个愿望坐标。', m: ['星门', '戒环', '未来'] }
};

function rnd(seed: number) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function ease(x: number) { return 1 - Math.pow(1 - x, 3); }
function lerpVec(a: THREE.Vector3, b: THREE.Vector3, t: number) { return a.clone().lerp(b, t); }
function bezier(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, t: number) { return lerpVec(lerpVec(a, b, t), lerpVec(b, c, t), t); }

function heart(t: number, scale = .16) {
  return new THREE.Vector3(16 * Math.pow(Math.sin(t), 3) * scale, (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * scale - .18, 0);
}

function worldPos(node: OrbitNode) { return new THREE.Vector3(...node.pos).applyEuler(SCENE_ROT); }

function makeNodes(): OrbitNode[] {
  return nodeSeeds.map(([id, title, subtitle, color, note], i) => {
    const t = (i / nodeSeeds.length) * Math.PI * 2 + .38;
    const p = heart(t, .19 + (i % 2) * .018);
    p.z = Math.sin(t * 2) * .82;
    return { id, title, subtitle, color, note, pos: [p.x, p.y, p.z] };
  });
}

function cloud(count: number, seed: number, maker: (i: number, r: () => number) => { p: THREE.Vector3; c: THREE.Color; size: number }) {
  const rand = rnd(seed);
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const size = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const v = maker(i, rand);
    pos.set([v.p.x, v.p.y, v.p.z], i * 3);
    col.set([v.c.r, v.c.g, v.c.b], i * 3);
    size[i] = v.size;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setAttribute('size', new THREE.BufferAttribute(size, 1));
  return g;
}

function Material() { return three('shaderMaterial', { vertexShader: vertex, fragmentShader: fragment, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }); }

function StarBody() {
  const geometry = useMemo(() => {
    const colors = ['#ff7ac4', '#ffc3df', '#bda4ff', '#8ffff1', '#fff1bd'].map(c => new THREE.Color(c));
    return cloud(15000, 7701, (_i, rand) => {
      const t = rand() * Math.PI * 2;
      const layer = Math.pow(rand(), .5);
      const p = heart(t, .09 + layer * .21);
      p.x += (rand() - .5) * (.16 + layer * .48);
      p.y += (rand() - .5) * (.12 + layer * .34);
      p.z = Math.sin(t * 2.2) * (.18 + layer * .74) + (rand() - .5) * .75;
      const c = colors[Math.floor(rand() * colors.length)].clone().lerp(new THREE.Color('#fff7fb'), layer < .25 ? .36 : rand() * .16);
      return { p, c, size: .018 + Math.pow(rand(), 2.4) * .058 };
    });
  }, []);
  return three('points', { geometry }, h(Material));
}

function DeepStars() {
  const geometry = useMemo(() => cloud(2100, 93011, (_i, rand) => {
    const r = 14 + rand() * 24;
    const a = rand() * Math.PI * 2;
    const p = new THREE.Vector3(Math.cos(a) * r, (rand() - .5) * 16, Math.sin(a) * r);
    return { p, c: new THREE.Color(rand() > .5 ? '#ffb8df' : '#9ffdf4'), size: .01 + rand() * .03 };
  }), []);
  return three('points', { geometry }, h(Material));
}

function Ring({ rx, ry, color, rot = [0, 0, 0], opacity = .2 }: { rx: number; ry: number; color: string; rot?: [number, number, number]; opacity?: number }) {
  const geometry = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 280; i++) {
      const t = i / 280 * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(t) * rx, Math.sin(t) * ry, Math.sin(t * 2) * .16));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [rx, ry]);
  return three('line', { geometry, rotation: rot }, three('lineBasicMaterial', { color, transparent: true, opacity, blending: THREE.AdditiveBlending }));
}

function Ritual({ active, focusKey }: { active: OrbitNode; focusKey: number }) {
  const ref = useRef<THREE.Group>(null);
  const progress = useRef(0);
  useEffect(() => { progress.current = 0; }, [focusKey]);
  const geometry = useMemo(() => {
    const seed = active.id.split('').reduce((a, c) => a + c.charCodeAt(0), 19);
    const base = new THREE.Color(active.color);
    const count = active.id === 'rose' ? 1550 : active.id === 'aurora' ? 1250 : 980;
    return cloud(count, seed, (i, rand) => {
      const u = i / count * Math.PI * 2;
      const layer = Math.pow(rand(), .55);
      let x = 0, y = 0, z = 0;
      if (active.id === 'rose') { const petal = 1 + .45 * Math.sin(5 * u); x = Math.cos(u) * (0.24 + layer) * petal; y = Math.sin(u) * (.18 + layer * .62) * petal; z = (rand() - .5) * .52; }
      else if (active.id === 'moon') { x = ((i % 34) / 34 - .5) * 1.6; y = (Math.floor(i / 34) % 30 - 15) * .028 + Math.sin(u) * .16; z = (rand() - .5) * .42; }
      else if (active.id === 'aurora') { x = (rand() - .5) * 1.85; y = Math.sin(x * 4.4 + u) * .45 + (rand() - .5) * .16; z = Math.cos(x * 3.1 + u) * .45; }
      else if (active.id === 'future') { x = Math.cos(u) * (.32 + layer * .92); y = Math.sin(u) * (.18 + (i % 4) * .12 + layer * .25); z = Math.sin(u + i % 4) * .54; }
      else { const s = Math.pow(i / count, .72); x = -.75 + s * 1.5 + (rand() - .5) * .16; y = Math.sin(s * Math.PI * 2) * .28 + (rand() - .5) * .15; z = (rand() - .5) * (.64 - s * .25); }
      const c = base.clone().lerp(new THREE.Color(active.id === 'moon' || active.id === 'future' ? '#fff1bd' : active.id === 'aurora' ? '#90fff0' : '#fff7fb'), .25 + rand() * .3);
      return { p: new THREE.Vector3(x, y, z), c, size: .018 + Math.pow(rand(), 1.8) * .075 };
    });
  }, [active.id, active.color]);
  useFrame((_s, d) => {
    const g = ref.current;
    if (!g) return;
    progress.current = Math.min(1, progress.current + d * .82);
    const e = ease(progress.current);
    g.scale.setScalar(.05 + e * 1.05);
  });
  return three('group', { ref, position: active.pos },
    h(Ring, { rx: 1.28, ry: .66, color: active.color, opacity: .34, rot: [.35, .18, .12] }),
    h(Ring, { rx: .78, ry: 1.02, color: active.id === 'moon' ? '#fff1bd' : '#91fff0', opacity: .18, rot: [-.6, .14, -.38] }),
    three('points', { geometry }, h(Material))
  );
}

function NodeMesh({ node, active, select }: { node: OrbitNode; active: boolean; select: (node: OrbitNode) => void }) {
  return three('group', { position: node.pos },
    three('mesh', { onClick: (e: any) => { e.stopPropagation(); select(node); } },
      three('sphereGeometry', { args: [active ? .14 : .078, 32, 32] }),
      three('meshBasicMaterial', { color: node.color, transparent: true, opacity: active ? 1 : .9 })
    ),
    three('mesh', { scale: active ? 3.15 : 1.95 },
      three('sphereGeometry', { args: [active ? .14 : .078, 32, 32] }),
      three('meshBasicMaterial', { color: node.color, transparent: true, opacity: active ? .19 : .07, depthWrite: false, blending: THREE.AdditiveBlending })
    ),
    active ? h(Html, { className: 'node-label', distanceFactor: 8, position: [0, .33, 0], center: true }, h('span', null, node.title)) : null
  );
}

function CameraFly({ active, focusKey, controlsRef }: { active: OrbitNode; focusKey: number; controlsRef: any }) {
  const { camera } = useThree();
  const flight = useRef<any>(null);
  useEffect(() => {
    const target = worldPos(active);
    const dir = target.clone().normalize().multiplyScalar(.85);
    const endTarget = target.clone();
    const endPos = target.clone().add(new THREE.Vector3(.35, .28, 2.65)).add(dir);
    const startTarget = controlsRef.current?.target?.clone?.() ?? new THREE.Vector3(0, 0, 0);
    const startPos = camera.position.clone();
    const mid = startPos.clone().lerp(endPos, .5).add(new THREE.Vector3(0, .75, .95));
    flight.current = { t: 0, startPos, mid, endPos, startTarget, endTarget };
  }, [focusKey]);
  useFrame((_s, delta) => {
    const f = flight.current;
    const controls = controlsRef.current;
    if (!f || !controls) return;
    f.t = Math.min(1, f.t + delta / 1.35);
    const e = ease(f.t);
    camera.position.copy(bezier(f.startPos, f.mid, f.endPos, e));
    controls.target.copy(lerpVec(f.startTarget, f.endTarget, e));
    camera.lookAt(controls.target);
    controls.update();
    if (f.t >= 1) flight.current = null;
  });
  return null;
}

function Scene({ nodes, active, select, focusKey }: { nodes: OrbitNode[]; active: OrbitNode; select: (node: OrbitNode) => void; focusKey: number }) {
  const controlsRef = useRef<any>(null);
  return h(Canvas, { camera: { position: [0, .15, 6.9], fov: 38 }, dpr: [1, 1.6] },
    three('color', { attach: 'background', args: ['#05000d'] }),
    three('ambientLight', { intensity: .58 }),
    three('pointLight', { position: [2.5, 2.4, 3.4], intensity: .9, color: '#ffaddd' }),
    three('pointLight', { position: [-2.2, -1.8, 2.1], intensity: .46, color: '#91fff0' }),
    h(CameraFly, { active, focusKey, controlsRef }),
    h(DeepStars),
    three('group', { rotation: [-.05, -.16, 0] },
      three('mesh', { scale: [1.05, .72, .56] }, three('sphereGeometry', { args: [1, 64, 64] }), three('meshBasicMaterial', { color: '#ffaad8', transparent: true, opacity: .055, depthWrite: false, blending: THREE.AdditiveBlending })),
      h(StarBody),
      h(Ring, { rx: 3.05, ry: 1.94, color: '#ff83c8', opacity: .34, rot: [.18, 0, .08] }),
      h(Ring, { rx: 3.42, ry: 2.22, color: '#91fff0', opacity: .16, rot: [-.58, .04, -.13] }),
      h(Ring, { rx: 2.3, ry: 1.42, color: '#fff0b8', opacity: .15, rot: [.82, .14, .4] }),
      h(Ritual, { active, focusKey, key: `${active.id}-${focusKey}` }),
      ...nodes.map(n => h(NodeMesh, { key: n.id, node: n, active: active.id === n.id, select }))
    ),
    h(OrbitControls, { ref: controlsRef, enablePan: false, enableDamping: true, dampingFactor: .07, rotateSpeed: .58, minDistance: 2.25, maxDistance: 9.5 })
  );
}

export function RomanceOrbitApp() {
  const nodes = useMemo(makeNodes, []);
  const [active, setActive] = useState(nodes[0]);
  const [focusKey, setFocusKey] = useState(0);
  const [query, setQuery] = useState('');
  const list = (query ? nodes.filter(n => `${n.title}${n.subtitle}${n.note}`.includes(query)) : nodes).slice(0, 5);
  const info = detail[active.id] ?? detail.first;
  const selectNode = (node: OrbitNode) => { setActive(node); setFocusKey(k => k + 1); };
  return h('main', { className: 'romance-shell', style: { '--accent': active.color } as CSSProperties },
    h(Scene, { nodes, active, select: selectNode, focusKey }),
    h('div', { className: 'romance-vignette' }),
    h('section', { className: 'brand-float' }, h('span', null, 'ROMANCE ORBIT'), h('h1', null, '极光玫瑰宇宙'), h('p', null, '点击光点，镜头会靠近那里，再停成一张可以旋转的浪漫 3D 场景。')),
    h('section', { className: 'search-float' }, h('input', { value: query, onChange: (e: any) => setQuery(e.target.value), placeholder: '搜索：玫瑰 / 月光 / 极光 / 未来' }), h('div', { className: 'memory-list' }, ...list.map(n => h('button', { key: n.id, onClick: () => selectNode(n), className: active.id === n.id ? 'is-active' : '' }, h('b', null, n.title), h('span', null, n.subtitle))))),
    h('section', { className: 'detail-float' }, h('span', { className: 'detail-kicker' }, info.k), h('h2', null, active.title), h('p', null, active.subtitle), h('div', { className: 'ritual-card' }, h('b', null, info.t), h('span', null, info.s)), h('div', { className: 'ritual-lines' }, ...info.m.map(m => h('em', { key: m }, m))), h('div', { className: 'tag-row' }, ...themeItems.map(item => h('button', { key: item.id, style: { '--c': item.color } as CSSProperties }, item.title))))),
    h('section', { className: 'hint-float' }, '点击光点：镜头靠近 · 过场展开 · 停住成静态浪漫场景 · 之后可自由旋转')
  );
}
