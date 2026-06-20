import { createElement, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { nodeSeeds, OrbitNode } from './romanceCore';

const h = createElement;
const el = (tag: string, props?: any, ...children: any[]) => h(tag as any, props, ...children);
const sceneRot = new THREE.Euler(-0.08, -0.2, 0.03);

type Detail = { kicker: string; title: string; text: string; tags: string[]; accent: string; ring: string };
const details: Record<string, Detail> = {
  first: { kicker: 'SCENE 01 · 初见微光', title: '花瓣从第一束光里散开', text: '光点不是玫瑰本身。它只是入口：靠近后碎成花粉，暗场里浮起花瓣与一圈安静的光。', tags: ['初见', '花瓣', '静止'], accent: '#ffd2ea', ring: '#ff8dc8' },
  rose: { kicker: 'SCENE 02 · 玫瑰星云', title: '黑场花瓣雨', text: '不是塑料玫瑰模型，而是一场更克制的浪漫装置：暗色空间、悬浮花瓣、霓虹圆环和一朵粒子玫瑰轮廓。', tags: ['玫瑰', '黑场', '花瓣雨'], accent: '#ff6fa8', ring: '#ff4f97' },
  moon: { kicker: 'SCENE 03 · 月光来信', title: '月光穿过花瓣边缘', text: '花瓣停在空中，圆环像信纸边缘的金线。画面保持静止，只在点击时完成一次过场。', tags: ['月光', '信笺', '静态'], accent: '#ffe5b8', ring: '#ffd48d' },
  aurora: { kicker: 'SCENE 04 · 极光慢舞', title: '极光凝成一圈安静的门', text: '青绿色光环在花瓣背后停住，像远处极光冻结成一枚温柔的入口。', tags: ['极光', '青绿', '夜色'], accent: '#a8fff0', ring: '#6fffe3' },
  future: { kicker: 'SCENE 05 · 未来光环', title: '未来被收进一枚戒环', text: '多层细环把花瓣和玫瑰轮廓收在中央，像未来某个安静的承诺。', tags: ['未来', '戒环', '承诺'], accent: '#ffd49c', ring: '#ffa84f' }
};

function random(seed: number) {
  let s = seed;
  return () => {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function ease(t: number) { return t * t * (3 - 2 * t); }
function easeOut(t: number) { return 1 - Math.pow(1 - t, 3); }
function mixVec(a: THREE.Vector3, b: THREE.Vector3, t: number) { return a.clone().lerp(b, t); }
function bezier(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, t: number) { return mixVec(mixVec(a, b, t), mixVec(b, c, t), t); }
function heart(t: number, scale: number) {
  const x = 16 * Math.pow(Math.sin(t), 3) * scale;
  const y = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * scale - 0.2;
  return new THREE.Vector3(x, y, 0);
}
function makeNodes(): OrbitNode[] {
  return nodeSeeds.map(([id, title, subtitle, color, note], i) => {
    const t = i / nodeSeeds.length * Math.PI * 2 + 0.42;
    const p = heart(t, 0.2 + (i % 2) * 0.018);
    p.z = Math.sin(t * 2) * 0.82;
    return { id, title, subtitle, color, note, pos: [p.x, p.y, p.z] };
  });
}
function worldPosition(node: OrbitNode) { return new THREE.Vector3(...node.pos).applyEuler(sceneRot); }

const starVertex = `
attribute float size;
attribute vec3 color;
varying vec3 vColor;
void main(){
  vColor=color;
  vec4 mv=modelViewMatrix*vec4(position,1.0);
  gl_PointSize=clamp(size*(330.0/max(1.0,-mv.z)),0.8,8.0);
  gl_Position=projectionMatrix*mv;
}`;
const starFragment = `
varying vec3 vColor;
void main(){
  vec2 p=gl_PointCoord-vec2(0.5);
  float d=length(p);
  float a=smoothstep(0.5,0.04,d);
  if(a<0.03) discard;
  gl_FragColor=vec4(vColor,a*0.72);
}`;
function StarMaterial({ opacity = 1 }: { opacity?: number }) {
  const fragment = starFragment.replace('a*0.72', `a*${(0.72 * opacity).toFixed(3)}`);
  return el('shaderMaterial', { vertexShader: starVertex, fragmentShader: fragment, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
}
function pointGeometry(count: number, seed: number, make: (i: number, rand: () => number) => { p: THREE.Vector3; c: THREE.Color; s: number }) {
  const rand = random(seed);
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const size = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const item = make(i, rand);
    pos.set([item.p.x, item.p.y, item.p.z], i * 3);
    col.set([item.c.r, item.c.g, item.c.b], i * 3);
    size[i] = item.s;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setAttribute('size', new THREE.BufferAttribute(size, 1));
  return g;
}
function DeepStars() {
  const g = useMemo(() => pointGeometry(2400, 81723, (_i, rand) => {
    const r = 16 + rand() * 28;
    const a = rand() * Math.PI * 2;
    const p = new THREE.Vector3(Math.cos(a) * r, (rand() - 0.5) * 15, Math.sin(a) * r);
    const c = new THREE.Color(rand() > 0.62 ? '#6d4d67' : '#50656c');
    return { p, c, s: 0.014 + rand() * 0.026 };
  }), []);
  return el('points', { geometry: g }, h(StarMaterial, { opacity: 0.62 }));
}
function StarHeart() {
  const g = useMemo(() => {
    const pal = ['#ca6195', '#f0b6cf', '#6d526f', '#74a9a7', '#d0b98c'].map(c => new THREE.Color(c));
    return pointGeometry(11000, 74019, (_i, rand) => {
      const t = rand() * Math.PI * 2;
      const layer = Math.pow(rand(), 0.58);
      const p = heart(t, 0.08 + layer * 0.22);
      p.x += (rand() - 0.5) * (0.11 + layer * 0.38);
      p.y += (rand() - 0.5) * (0.09 + layer * 0.24);
      p.z = Math.sin(t * 2.15) * (0.12 + layer * 0.52) + (rand() - 0.5) * 0.4;
      const c = pal[Math.floor(rand() * pal.length)].clone();
      return { p, c, s: 0.015 + Math.pow(rand(), 2.1) * 0.045 };
    });
  }, []);
  return el('points', { geometry: g }, h(StarMaterial, { opacity: 0.75 }));
}
function Ring({ rx, ry, color, opacity, rot }: { rx: number; ry: number; color: string; opacity: number; rot: [number, number, number] }) {
  const g = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 220; i++) {
      const t = i / 220 * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(t) * rx, Math.sin(t) * ry, Math.sin(t * 2) * 0.08));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [rx, ry]);
  return el('line', { geometry: g, rotation: rot }, el('lineBasicMaterial', { color, transparent: true, opacity, blending: THREE.AdditiveBlending }));
}
function NodeOrb({ node, active, onClick }: { node: OrbitNode; active: boolean; onClick: () => void }) {
  return el('group', { position: node.pos, onClick: (e: any) => { e.stopPropagation(); onClick(); } }, [
    el('mesh', { key: 'halo', scale: active ? 1.5 : 1 }, el('sphereGeometry', { args: [active ? 0.12 : 0.085, 24, 24] }), el('meshBasicMaterial', { color: node.color, transparent: true, opacity: active ? 0.24 : 0.11, blending: THREE.AdditiveBlending })),
    el('mesh', { key: 'core' }, el('sphereGeometry', { args: [active ? 0.045 : 0.032, 24, 24] }), el('meshStandardMaterial', { color: node.color, emissive: node.color, emissiveIntensity: active ? 1.4 : 0.65, roughness: 0.32 }))
  ]);
}
function PetalShape() {
  return useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, -0.18);
    s.bezierCurveTo(-0.25, -0.04, -0.22, 0.38, 0, 0.55);
    s.bezierCurveTo(0.22, 0.38, 0.25, -0.04, 0, -0.18);
    const g = new THREE.ShapeGeometry(s, 26);
    g.scale(0.55, 0.82, 1);
    return g;
  }, []);
}
function Petal({ target, color, progress, delay, scale }: { target: THREE.Vector3; color: string; progress: number; delay: number; scale: number }) {
  const geo = PetalShape();
  const p = Math.max(0, Math.min(1, (progress - delay) / (1 - delay)));
  const e = easeOut(p);
  const pos = target.clone().multiplyScalar(e);
  pos.y += Math.sin(e * Math.PI) * 0.12;
  return el('mesh', { geometry: geo, position: [pos.x, pos.y, pos.z], rotation: [target.y * 0.35, target.x * 0.8, target.z], scale: [scale * (0.1 + e * 0.9), scale * (0.1 + e * 0.9), scale] },
    el('meshStandardMaterial', { color, transparent: true, opacity: 0.0 + e * 0.74, roughness: 0.72, metalness: 0.02, side: THREE.DoubleSide })
  );
}
function PetalRain({ theme, progress }: { theme: Detail; progress: number }) {
  const petals = useMemo(() => {
    const rand = random(9913);
    const items: { target: THREE.Vector3; color: string; delay: number; scale: number }[] = [];
    const palette = ['#5f1229', '#8f2444', '#ba3e68', '#e1779f', theme.accent];
    for (let i = 0; i < 88; i++) {
      const band = i / 88;
      const x = (rand() - 0.5) * 3.8;
      const y = (rand() - 0.5) * 2.0 + Math.sin(band * Math.PI * 2) * 0.35;
      const z = -0.45 + rand() * 1.1;
      items.push({ target: new THREE.Vector3(x, y, z), color: palette[Math.floor(rand() * palette.length)], delay: rand() * 0.36, scale: 0.5 + rand() * 0.9 });
    }
    return items;
  }, [theme]);
  return el('group', null, petals.map((p, i) => h(Petal, { key: i, ...p, progress })));
}
function NeonPortal({ theme, progress }: { theme: Detail; progress: number }) {
  const e = easeOut(Math.max(0, progress - 0.18) / 0.82);
  return el('group', { scale: [e, e, e] }, [
    el('mesh', { key: 'r1', rotation: [Math.PI / 2, 0, 0] }, el('torusGeometry', { args: [1.15, 0.008, 12, 180] }), el('meshBasicMaterial', { color: theme.ring, transparent: true, opacity: 0.42, blending: THREE.AdditiveBlending })),
    el('mesh', { key: 'r2', rotation: [Math.PI / 2, 0.16, 0.08] }, el('torusGeometry', { args: [0.86, 0.006, 12, 160] }), el('meshBasicMaterial', { color: theme.accent, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending })),
    el('mesh', { key: 'r3', rotation: [Math.PI / 2, -0.13, -0.04] }, el('torusGeometry', { args: [1.42, 0.004, 12, 180] }), el('meshBasicMaterial', { color: '#ffffff', transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending }))
  ]);
}
function RoseOutline({ theme, progress }: { theme: Detail; progress: number }) {
  const g = useMemo(() => pointGeometry(2200, 1919, (i, rand) => {
    const t = i / 2200 * Math.PI * 2 * 5.0;
    const petal = 0.55 + 0.42 * Math.cos(5 * t);
    const radius = 0.055 + Math.abs(petal) * (0.28 + rand() * 0.12);
    const p = new THREE.Vector3(Math.cos(t) * radius, Math.sin(t) * radius, (rand() - 0.5) * 0.22);
    const c = new THREE.Color(theme.accent).lerp(new THREE.Color('#ffffff'), rand() * 0.25);
    return { p, c, s: 0.022 + rand() * 0.035 };
  }), [theme]);
  const e = easeOut(Math.max(0, progress - 0.28) / 0.72);
  return el('group', { position: [0, 0.02, 0.16], scale: [e * 2.15, e * 2.15, e * 2.15] }, el('points', { geometry: g }, h(StarMaterial, { opacity: 0.45 })));
}
function RitualScene({ active, focusKey }: { active: OrbitNode; focusKey: number }) {
  const group = useRef<THREE.Group>(null);
  const age = useRef(0);
  useEffect(() => { age.current = 0; }, [focusKey]);
  useFrame((_s, d) => {
    age.current = Math.min(1, age.current + d * 0.82);
    if (group.current) {
      const e = ease(age.current);
      group.current.scale.setScalar(0.18 + e * 0.95);
    }
  });
  const p = ease(age.current);
  const theme = details[active.id] || details.rose;
  return el('group', { ref: group, position: active.pos, rotation: [0.05, 0.16, -0.03] }, [
    h(PetalRain, { key: 'petals', theme, progress: p }),
    h(NeonPortal, { key: 'portal', theme, progress: p }),
    h(RoseOutline, { key: 'outline', theme, progress: p })
  ]);
}
function FocusCamera({ active }: { active: OrbitNode | null }) {
  const { camera } = useThree();
  const start = useRef(new THREE.Vector3());
  const end = useRef(new THREE.Vector3());
  const ctrl = useRef(new THREE.Vector3());
  const time = useRef(1);
  const last = useRef<string | null>(null);
  useEffect(() => {
    if (!active || last.current === active.id) return;
    last.current = active.id;
    start.current.copy(camera.position);
    const target = worldPosition(active);
    end.current.copy(target.clone().normalize().multiplyScalar(3.0).add(target.clone().multiplyScalar(0.82)));
    ctrl.current.copy(start.current.clone().lerp(end.current, 0.48).add(new THREE.Vector3(0, 1.1, 0.5)));
    time.current = 0;
  }, [active, camera]);
  useFrame((_s, d) => {
    if (!active || time.current >= 1) return;
    time.current = Math.min(1, time.current + d * 0.55);
    const t = ease(time.current);
    camera.position.copy(bezier(start.current, ctrl.current, end.current, t));
    camera.lookAt(worldPosition(active));
  });
  return null;
}
function Scene({ nodes, active, setActive }: { nodes: OrbitNode[]; active: OrbitNode | null; setActive: (n: OrbitNode) => void }) {
  const [focusKey, setFocusKey] = useState(0);
  useEffect(() => { if (active) setFocusKey(k => k + 1); }, [active]);
  return el('group', null, [
    el('ambientLight', { key: 'amb', intensity: 0.42 }),
    el('pointLight', { key: 'p1', position: [2.5, 2.5, 3.5], intensity: 1.2, color: '#ffd0e8' }),
    el('pointLight', { key: 'p2', position: [-3, -1, -2], intensity: 0.45, color: '#70ffe3' }),
    h(DeepStars, { key: 'deep' }),
    h(FocusCamera, { key: 'cam', active }),
    el('group', { key: 'world', rotation: sceneRot }, [
      h(StarHeart, { key: 'heart' }),
      h(Ring, { key: 'r1', rx: 2.6, ry: 0.74, color: '#ff8fc2', opacity: 0.13, rot: [0.2, 0.1, -0.22] }),
      h(Ring, { key: 'r2', rx: 1.7, ry: 2.45, color: '#7effe9', opacity: 0.1, rot: [0.72, 0.05, 0.4] }),
      ...nodes.map(n => h(NodeOrb, { key: n.id, node: n, active: active?.id === n.id, onClick: () => setActive(n) })),
      active ? h(RitualScene, { key: active.id, active, focusKey }) : null
    ]),
    el(OrbitControls as any, { key: 'controls', enableDamping: true, dampingFactor: 0.08, minDistance: 2.0, maxDistance: 8, enablePan: false })
  ]);
}
function Interface({ nodes, active, setActive }: { nodes: OrbitNode[]; active: OrbitNode | null; setActive: (n: OrbitNode) => void }) {
  const theme = active ? (details[active.id] || details.rose) : null;
  return el('div', { className: 'romance-ui' }, [
    el('section', { key: 'hero', className: 'hero-copy' }, [
      el('p', { key: 'eyebrow' }, 'ROMANCE ORBIT · PETAL RING EDITION'),
      el('h1', { key: 'h1' }, active ? theme?.title : '黑场花瓣雨'),
      el('p', { key: 'text' }, active ? theme?.text : '点击任意大光点，镜头靠近后，光点消散成花瓣；暗场中出现霓虹圆环和粒子玫瑰轮廓，最后静止成一张浪漫 3D 照片。')
    ]),
    el('aside', { key: 'panel', className: 'detail-card' }, [
      el('p', { key: 'k' }, active ? theme?.kicker : 'SELECT A LIGHT'),
      el('h2', { key: 't' }, active ? active.title : '选择一个浪漫入口'),
      el('p', { key: 'd' }, active ? active.note : '每个光点都会进入同一套高级暗场风格，但有不同的色彩与主题气质。'),
      el('div', { key: 'tags', className: 'tag-row' }, (active ? theme?.tags : ['黑场', '花瓣雨', '霓虹圆环'])?.map(x => el('span', { key: x }, x))),
      el('div', { key: 'buttons', className: 'node-buttons' }, nodes.map(n => el('button', { key: n.id, className: active?.id === n.id ? 'active' : '', onClick: () => setActive(n) }, n.title)))
    ]),
    el('div', { key: 'hint', className: 'corner-hint' }, 'DRAG 旋转 · WHEEL 缩放 · CLICK 光点靠近')
  ]);
}
export function RomanceOrbitApp() {
  const nodes = useMemo(makeNodes, []);
  const [active, setActive] = useState<OrbitNode | null>(null);
  return el('div', { className: 'romance-stage' }, [
    el('div', { key: 'canvas', className: 'romance-canvas' }, h(Canvas, { camera: { position: [0, 0.4, 5.2], fov: 44 }, dpr: [1, 1.8], gl: { antialias: true, alpha: true } }, h(Scene, { nodes, active, setActive }))),
    h(Interface, { key: 'ui', nodes, active, setActive })
  ]);
}
