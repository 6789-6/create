import { CSSProperties, createElement, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { nodeSeeds, OrbitNode } from './romanceCore';

const h = createElement;
const el = (tag: string, props?: any, ...children: any[]) => h(tag as any, props, ...children);
const sceneRot = new THREE.Euler(-0.08, -0.2, 0.03);

type Detail = { kicker: string; title: string; text: string; tags: string[]; rose: string; accent: string };
const detail: Record<string, Detail> = {
  first: { kicker: 'SCENE 01 · 初见微光', title: '第一枝玫瑰', text: '点击光点后，镜头靠近它；光点只安静散成花粉，一枝完整玫瑰在原地生长并停住。', tags: ['花粉', '初见', '静止'], rose: '#d94a83', accent: '#ffd8eb' },
  rose: { kicker: 'SCENE 02 · 玫瑰星云', title: '一枝玫瑰在星光里停住', text: '大光点不是玫瑰本体。它会淡出，随后花茎、叶子、花托和层叠花瓣在同一位置生成。', tags: ['一枝玫瑰', '花瓣', '静态'], rose: '#cf2f6f', accent: '#ffc0db' },
  moon: { kicker: 'SCENE 03 · 月光来信', title: '月光落在玫瑰边缘', text: '玫瑰保持安静，月白细环像信纸边缘的金线，只作为陪衬，不抢主体。', tags: ['月光', '信笺', '克制'], rose: '#e05f92', accent: '#ffe9b7' },
  aurora: { kicker: 'SCENE 04 · 极光慢舞', title: '极光在玫瑰背后凝固', text: '青绿色光带停在远处，玫瑰本体仍然是画面的中心。浪漫不是晃眼，而是有呼吸感的静止。', tags: ['极光', '夜色', '静止'], rose: '#d84f8e', accent: '#98fff0' },
  future: { kicker: 'SCENE 05 · 未来光环', title: '把玫瑰收藏进未来', text: '细戒环围住玫瑰，不再做巨大光门。它像一枚轻轻悬浮的承诺。', tags: ['戒环', '未来', '承诺'], rose: '#d94b7a', accent: '#ffd28f' }
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
function easeInOut(t: number) { return t * t * (3 - 2 * t); }
function easeOut(t: number) { return 1 - Math.pow(1 - t, 3); }
function mixVec(a: THREE.Vector3, b: THREE.Vector3, t: number) { return a.clone().lerp(b, t); }
function bezier(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, t: number) { return mixVec(mixVec(a, b, t), mixVec(b, c, t), t); }
function heart(t: number, scale: number) {
  const x = 16 * Math.pow(Math.sin(t), 3) * scale;
  const y = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * scale - 0.18;
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
  gl_PointSize=clamp(size*(330.0/max(1.0,-mv.z)),0.8,9.0);
  gl_Position=projectionMatrix*mv;
}`;
const starFragment = `
varying vec3 vColor;
void main(){
  vec2 p=gl_PointCoord-vec2(0.5);
  float d=length(p);
  float a=smoothstep(0.5,0.05,d);
  if(a<0.03) discard;
  gl_FragColor=vec4(vColor,a*0.68);
}`;
function StarMaterial() {
  return el('shaderMaterial', { vertexShader: starVertex, fragmentShader: starFragment, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
}
function pointGeometry(count: number, seed: number, make: (i: number, rand: () => number) => { p: THREE.Vector3; c: THREE.Color; s: number }) {
  const rand = random(seed);
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const size = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const it = make(i, rand);
    pos.set([it.p.x, it.p.y, it.p.z], i * 3);
    col.set([it.c.r, it.c.g, it.c.b], i * 3);
    size[i] = it.s;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setAttribute('size', new THREE.BufferAttribute(size, 1));
  return g;
}
function DeepStars() {
  const g = useMemo(() => pointGeometry(2300, 81723, (_i, rand) => {
    const r = 15 + rand() * 25;
    const a = rand() * Math.PI * 2;
    const p = new THREE.Vector3(Math.cos(a) * r, (rand() - 0.5) * 15, Math.sin(a) * r);
    const c = new THREE.Color(rand() > 0.58 ? '#72556d' : '#607176');
    return { p, c, s: 0.014 + rand() * 0.028 };
  }), []);
  return el('points', { geometry: g }, h(StarMaterial));
}
function StarHeart() {
  const g = useMemo(() => {
    const pal = ['#d36a9e', '#e7b2cb', '#8e719b', '#87b9b6', '#d9c69a'].map(c => new THREE.Color(c));
    return pointGeometry(10500, 74019, (_i, rand) => {
      const t = rand() * Math.PI * 2;
      const layer = Math.pow(rand(), 0.58);
      const p = heart(t, 0.09 + layer * 0.22);
      p.x += (rand() - 0.5) * (0.12 + layer * 0.42);
      p.y += (rand() - 0.5) * (0.1 + layer * 0.26);
      p.z = Math.sin(t * 2.15) * (0.14 + layer * 0.6) + (rand() - 0.5) * 0.46;
      const c = pal[Math.floor(rand() * pal.length)].clone().lerp(new THREE.Color('#fff0f7'), layer < 0.18 ? 0.25 : rand() * 0.08);
      return { p, c, s: 0.015 + Math.pow(rand(), 2.1) * 0.048 };
    });
  }, []);
  return el('points', { geometry: g }, h(StarMaterial));
}
function Ring({ rx, ry, color, opacity, rot }: { rx: number; ry: number; color: string; opacity: number; rot: [number, number, number] }) {
  const g = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 240; i++) {
      const t = i / 240 * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(t) * rx, Math.sin(t) * ry, Math.sin(t * 2) * 0.08));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [rx, ry]);
  return el('line', { geometry: g, rotation: rot }, el('lineBasicMaterial', { color, transparent: true, opacity, blending: THREE.AdditiveBlending }));
}

function leafGeometry() {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(-0.24, 0.12, -0.38, 0.42, 0, 0.78);
  s.bezierCurveTo(0.38, 0.42, 0.24, 0.12, 0, 0);
  const g = new THREE.ShapeGeometry(s, 28);
  g.translate(0, -0.1, 0);
  return g;
}
function petalGeometry() {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(-0.16, 0.1, -0.34, 0.46, -0.1, 0.78);
  s.bezierCurveTo(-0.04, 0.92, 0.04, 0.92, 0.1, 0.78);
  s.bezierCurveTo(0.34, 0.46, 0.16, 0.1, 0, 0);
  const g = new THREE.ShapeGeometry(s, 36);
  g.translate(0, -0.03, 0);
  return g;
}
function ElegantPetal({ color, angle, layer, progress }: { color: string; angle: number; layer: number; progress: number }) {
  const geo = useMemo(petalGeometry, []);
  const e = easeOut(Math.max(0, progress - layer * 0.08) / Math.max(0.001, 1 - layer * 0.08));
  const base = 0.22 + layer * 0.11;
  const scale = 0.12 + e * base;
  const tilt = -0.38 - layer * 0.18;
  const y = 0.26 + layer * 0.035;
  const z = Math.sin(angle) * (0.04 + layer * 0.018);
  return el('mesh', { geometry: geo, position: [Math.cos(angle) * 0.035 * layer, y, z], rotation: [tilt, angle, 0], scale: [scale, scale * (0.98 + layer * 0.06), scale] },
    el('meshStandardMaterial', { color, transparent: true, opacity: 0.18 + e * 0.55, roughness: 0.62, metalness: 0.02, side: THREE.DoubleSide })
  );
}
function SingleRose({ active, focusKey }: { active: OrbitNode; focusKey: number }) {
  const group = useRef<THREE.Group>(null);
  const age = useRef(0);
  useEffect(() => { age.current = 0; }, [focusKey]);
  useFrame((_s, d) => {
    age.current = Math.min(1, age.current + d * 0.75);
    const e = easeInOut(age.current);
    if (group.current) {
      group.current.scale.setScalar(0.08 + e * 0.96);
      group.current.rotation.y = (1 - e) * -0.55;
      group.current.position.y = -0.12 + e * 0.12;
    }
  });
  const progress = easeInOut(age.current);
  const theme = detail[active.id] || detail.rose;
  const roseColor = theme.rose;
  const accent = theme.accent;
  const petalColor = new THREE.Color(roseColor).lerp(new THREE.Color('#f4bfd4'), 0.18).getStyle();
  const petals: any[] = [];
  for (let layer = 0; layer < 4; layer++) {
    const total = layer === 0 ? 5 : layer === 1 ? 8 : layer === 2 ? 11 : 15;
    for (let i = 0; i < total; i++) {
      const a = i / total * Math.PI * 2 + layer * 0.24;
      petals.push(h(ElegantPetal, { key: `petal-${layer}-${i}`, color: layer < 2 ? roseColor : petalColor, angle: a, layer, progress }));
    }
  }
  const leafGeo = useMemo(leafGeometry, []);
  return el('group', { ref: group, position: active.pos, rotation: [0.1, 0.15, -0.08] }, [
    el('mesh', { key: 'stem', position: [0, -0.48, 0], rotation: [0.08, 0, -0.05] }, el('cylinderGeometry', { args: [0.018, 0.028, 1.22, 16] }), el('meshStandardMaterial', { color: '#244735', roughness: 0.86, metalness: 0.04 })),
    el('mesh', { key: 'leaf-l', geometry: leafGeo, position: [-0.12, -0.36, 0.02], rotation: [0.1, 0.7, 0.82], scale: [0.42, 0.42, 0.42] }, el('meshStandardMaterial', { color: '#315d45', roughness: 0.8, side: THREE.DoubleSide })),
    el('mesh', { key: 'leaf-r', geometry: leafGeo, position: [0.13, -0.18, -0.01], rotation: [0.18, -0.72, -0.84], scale: [0.34, 0.34, 0.34] }, el('meshStandardMaterial', { color: '#284c39', roughness: 0.84, side: THREE.DoubleSide })),
    el('mesh', { key: 'calyx', position: [0, 0.16, 0], scale: [1, 0.55, 1] }, el('sphereGeometry', { args: [0.12, 24, 16] }), el('meshStandardMaterial', { color: '#294737', roughness: 0.82 })),
    el('mesh', { key: 'bud', position: [0, 0.32, 0], scale: [1, 0.78, 1] }, el('sphereGeometry', { args: [0.13, 32, 16] }), el('meshStandardMaterial', { color: roseColor, roughness: 0.68, transparent: true, opacity: 0.82 })),
    ...petals,
    h(Ring, { key: 'small-ring', rx: 0.82, ry: 0.45, color: accent, opacity: progress * 0.12, rot: [0.42, 0.12, 0.05] })
  ]);
}
function Pollen({ active, focusKey }: { active: OrbitNode; focusKey: number }) {
  const mat = useRef<any>(null);
  const age = useRef(0);
  useEffect(() => { age.current = 0; }, [focusKey]);
  const g = useMemo(() => pointGeometry(520, 1137 + active.id.length * 97, (_i, rand) => {
    const r = Math.pow(rand(), 0.4) * 0.85;
    const a = rand() * Math.PI * 2;
    const p = new THREE.Vector3(Math.cos(a) * r, (rand() - 0.35) * 0.55, Math.sin(a) * r * 0.62);
    const c = new THREE.Color(active.color).lerp(new THREE.Color('#fff4e2'), 0.35 + rand() * 0.3);
    return { p, c, s: 0.018 + rand() * 0.038 };
  }), [active.id, active.color]);
  useFrame((_s, d) => { age.current = Math.min(1, age.current + d * 0.85); if (mat.current?.uniforms?.uOpacity) mat.current.uniforms.uOpacity.value = Math.max(0, 0.46 * (1 - easeInOut(age.current))); });
  const pollenFrag = `varying vec3 vColor; uniform float uOpacity; void main(){ vec2 p=gl_PointCoord-vec2(0.5); float d=length(p); float a=smoothstep(0.5,0.05,d)*uOpacity; if(a<0.02) discard; gl_FragColor=vec4(vColor,a); }`;
  return el('points', { geometry: g, position: active.pos }, el('shaderMaterial', { ref: mat, vertexShader: starVertex, fragmentShader: pollenFrag, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uOpacity: { value: 0.46 } } }));
}
function NodeMesh({ node, active, select }: { node: OrbitNode; active: boolean; select: (node: OrbitNode) => void }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => { if (ref.current) ref.current.scale.setScalar(active ? 1.28 : 1); });
  return el('group', { ref, position: node.pos, onClick: (e: any) => { e.stopPropagation(); select(node); } }, [
    el('mesh', { key: 'core' }, el('sphereGeometry', { args: [active ? 0.085 : 0.058, 32, 32] }), el('meshStandardMaterial', { color: node.color, roughness: 0.52, metalness: 0.04, emissive: node.color, emissiveIntensity: active ? 0.28 : 0.1 })),
    el('mesh', { key: 'halo' }, el('sphereGeometry', { args: [active ? 0.19 : 0.13, 32, 32] }), el('meshBasicMaterial', { color: node.color, transparent: true, opacity: active ? 0.16 : 0.07, blending: THREE.AdditiveBlending, depthWrite: false }))
  ]);
}
function CameraRig({ active, focusKey }: { active: OrbitNode; focusKey: number }) {
  const { camera } = useThree();
  const controls = useRef<any>(null);
  const flight = useRef({ from: new THREE.Vector3(0, 0.2, 5.8), to: new THREE.Vector3(0, 0.2, 5.8), target: new THREE.Vector3(), t: 1 });
  useEffect(() => {
    if (focusKey === 0) return;
    const target = worldPosition(active);
    const dir = target.clone().normalize();
    const to = target.clone().add(dir.multiplyScalar(2.05)).add(new THREE.Vector3(0, 0.35, 0.55));
    flight.current = { from: camera.position.clone(), to, target, t: 0 };
  }, [active.id, focusKey]);
  useFrame((_s, d) => {
    if (flight.current.t < 1) {
      flight.current.t = Math.min(1, flight.current.t + d * 0.72);
      const e = easeInOut(flight.current.t);
      const mid = flight.current.from.clone().lerp(flight.current.to, 0.5).add(new THREE.Vector3(0, 0.55, 0.8));
      camera.position.copy(bezier(flight.current.from, mid, flight.current.to, e));
      camera.lookAt(flight.current.target);
      if (controls.current) controls.current.target.copy(flight.current.target);
    }
  });
  return h(OrbitControls, { ref: controls, enableDamping: true, dampingFactor: 0.08, minDistance: 1.3, maxDistance: 9, rotateSpeed: 0.55, zoomSpeed: 0.55 });
}
function Scene({ nodes, active, setActive, focusKey }: { nodes: OrbitNode[]; active: OrbitNode; setActive: (n: OrbitNode) => void; focusKey: number }) {
  return h(Canvas, { camera: { position: [0, 0.2, 5.8], fov: 45 }, gl: { antialias: true, alpha: false }, dpr: [1, 1.7] }, [
    el('color', { key: 'bg', attach: 'background', args: ['#05020a'] }),
    el('ambientLight', { key: 'ambient', intensity: 0.65 }),
    el('directionalLight', { key: 'key', position: [2.6, 3.2, 4.4], intensity: 1.6, color: '#ffe2ef' }),
    el('pointLight', { key: 'rim', position: [-3, 1.5, 2.5], intensity: 1.2, color: '#8ffff0' }),
    h(CameraRig, { key: 'cam', active, focusKey }),
    h(DeepStars, { key: 'stars' }),
    el('group', { key: 'heart', rotation: sceneRot }, [
      h(StarHeart, { key: 'starheart' }),
      h(Ring, { key: 'ring1', rx: 2.6, ry: 1.35, color: '#ff93c9', opacity: 0.14, rot: [0.7, 0.1, -0.3] }),
      h(Ring, { key: 'ring2', rx: 1.8, ry: 2.4, color: '#9bfff0', opacity: 0.09, rot: [-0.8, 0.18, 0.45] }),
      ...nodes.map(n => h(NodeMesh, { key: n.id, node: n, active: focusKey > 0 && n.id === active.id, select: setActive })),
      focusKey > 0 ? h(Pollen, { key: `pollen-${focusKey}`, active, focusKey }) : null,
      focusKey > 0 ? h(SingleRose, { key: `rose-${focusKey}`, active, focusKey }) : null
    ])
  ]);
}

const shell: CSSProperties = { position: 'relative', minHeight: '100vh', overflow: 'hidden', background: 'radial-gradient(circle at 50% 35%, #1b0715 0%, #07020a 46%, #020105 100%)', color: '#fff7fb', fontFamily: 'Inter, system-ui, sans-serif' };
const overlay: CSSProperties = { position: 'absolute', inset: 0, pointerEvents: 'none' };
const titleStyle: CSSProperties = { position: 'absolute', left: 34, top: 28, maxWidth: 430, letterSpacing: '.08em', textShadow: '0 12px 32px rgba(0,0,0,.65)' };
const panelStyle: CSSProperties = { position: 'absolute', right: 32, bottom: 30, width: 360, padding: 22, border: '1px solid rgba(255,210,232,.22)', borderRadius: 28, background: 'linear-gradient(145deg, rgba(24,8,20,.72), rgba(8,3,13,.48))', boxShadow: '0 28px 80px rgba(0,0,0,.48)', backdropFilter: 'blur(14px)', pointerEvents: 'auto' };
const buttonStyle: CSSProperties = { border: '1px solid rgba(255,210,232,.28)', borderRadius: 999, background: 'rgba(255,255,255,.06)', color: '#fff4fa', padding: '7px 12px', margin: '4px 5px 0 0', cursor: 'pointer' };

export function RomanceOrbitApp() {
  const nodes = useMemo(makeNodes, []);
  const [active, setActive] = useState<OrbitNode>(nodes[1]);
  const [focusKey, setFocusKey] = useState(0);
  const choose = (n: OrbitNode) => { setActive(n); setFocusKey(k => k + 1); };
  const info = detail[active.id] || detail.rose;
  return el('div', { style: shell }, [
    h(Scene, { key: 'scene', nodes, active, setActive: choose, focusKey }),
    el('div', { key: 'overlay', style: overlay }, [
      el('div', { key: 'title', style: titleStyle }, [
        el('div', { style: { fontSize: 12, opacity: .65, fontWeight: 700 } }, 'ROMANCE ORBIT · SINGLE ROSE EDITION'),
        el('div', { style: { fontSize: 52, fontWeight: 900, lineHeight: 1.02 } }, '一枝玫瑰'),
        el('p', { style: { maxWidth: 400, color: 'rgba(255,238,248,.72)', lineHeight: 1.75 } }, focusKey === 0 ? '拖动旋转这片浪漫星体。点击任意大光点，镜头会靠近它，光点在同一位置安静消散，然后生成一枝玫瑰。' : '玫瑰和被点击的大光点现在使用同一个 3D 坐标系，它会从光点原地生长，而不是跑到画面外。')
      ]),
      el('div', { key: 'panel', style: panelStyle }, [
        el('div', { style: { fontSize: 11, color: 'rgba(255,230,245,.62)', letterSpacing: '.16em', fontWeight: 800 } }, focusKey === 0 ? 'CHOOSE A LIGHT NODE' : info.kicker),
        el('h2', { style: { margin: '8px 0 6px', fontSize: 28 } }, focusKey === 0 ? '点击一颗光点' : info.title),
        el('p', { style: { color: 'rgba(255,239,248,.75)', lineHeight: 1.75, marginTop: 0 } }, focusKey === 0 ? '不要看右下文字，先点击主体里的大光点。它会成为玫瑰生成的位置。' : info.text),
        el('div', { style: { marginTop: 12 } }, (focusKey === 0 ? ['镜头靠近', '原地生成', '静态玫瑰'] : info.tags).map(t => el('span', { key: t, style: { display: 'inline-block', border: '1px solid rgba(255,210,232,.2)', borderRadius: 999, padding: '5px 9px', marginRight: 7, color: 'rgba(255,240,248,.76)', fontSize: 12 } }, t))),
        el('div', { style: { marginTop: 18 } }, nodes.map(n => el('button', { key: n.id, onClick: () => choose(n), style: { ...buttonStyle, borderColor: focusKey > 0 && n.id === active.id ? n.color : 'rgba(255,210,232,.28)', background: focusKey > 0 && n.id === active.id ? 'rgba(255,160,210,.17)' : 'rgba(255,255,255,.06)' } }, n.title)))
      ]),
      el('div', { key: 'hint', style: { position: 'absolute', left: 34, bottom: 28, color: 'rgba(255,238,248,.48)', fontSize: 13, letterSpacing: '.08em' } }, 'DRAG 旋转 · WHEEL 缩放 · CLICK 光点靠近')
    ])
  ]);
}
