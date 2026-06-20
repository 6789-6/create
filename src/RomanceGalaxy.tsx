import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { createElement, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

type Node = {
  id: string;
  title: string;
  subtitle: string;
  note: string;
  color: string;
  accent: string;
  theta: number;
  band: number;
  radius: number;
};

type SceneInfo = {
  title: string;
  line: string;
  tags: string[];
};

const h = createElement;
const nodes: Node[] = [
  { id: 'first-light', title: '初见微光', subtitle: 'FIRST LIGHT', note: '像第一颗靠近你的星，轻轻点亮整片夜空。', color: '#ffd8ef', accent: '#ff7dbb', theta: 0.22, band: 0.18, radius: 1.34 },
  { id: 'moon-letter', title: '月光来信', subtitle: 'MOON LETTER', note: '月光被折成信纸，停在一条安静的轨道上。', color: '#fff0bd', accent: '#ffd46e', theta: 1.48, band: -0.12, radius: 1.42 },
  { id: 'aurora-bay', title: '极光海湾', subtitle: 'AURORA BAY', note: '远处有蓝绿色的光，像海面把天空悄悄托住。', color: '#9bfff3', accent: '#57ffe5', theta: 2.72, band: 0.31, radius: 1.38 },
  { id: 'rain-window', title: '雨夜窗前', subtitle: 'RAIN WINDOW', note: '玻璃上有细小的雨点，屋内的灯很慢。', color: '#c9dcff', accent: '#8eb7ff', theta: 3.88, band: -0.26, radius: 1.28 },
  { id: 'star-harbor', title: '星港告白', subtitle: 'STAR HARBOR', note: '一艘光船停在远处，像一句还没说出口的话。', color: '#ffd1a3', accent: '#ffad62', theta: 5.1, band: 0.02, radius: 1.46 },
  { id: 'future-vow', title: '未来誓约', subtitle: 'FUTURE VOW', note: '所有轨道最终收束成一个安静的方向。', color: '#e7d7ff', accent: '#b899ff', theta: 5.92, band: -0.36, radius: 1.3 }
];

const sceneText: Record<string, SceneInfo> = {
  'first-light': { title: '第一束光停住', line: '从一颗微光进入局部星域，周围只留下细小的珍珠星尘。', tags: ['微光', '初见', '静止'] },
  'moon-letter': { title: '月光信纸展开', line: '金色轨道像信纸边缘，星点排列成一封没有落款的信。', tags: ['月光', '信纸', '金色'] },
  'aurora-bay': { title: '极光海湾凝固', line: '蓝绿色光带停在远处，像一片被夜色托住的海。', tags: ['极光', '海湾', '青绿'] },
  'rain-window': { title: '雨夜窗格发亮', line: '细线组成窗格，光点像雨滴停在玻璃上。', tags: ['雨夜', '窗前', '蓝白'] },
  'star-harbor': { title: '星港灯塔亮起', line: '金色航线绕开暗场，像一座只为你点亮的港口。', tags: ['星港', '灯塔', '暖光'] },
  'future-vow': { title: '未来轨道收束', line: '多条细线在前方汇合，像一个安静但确定的答案。', tags: ['未来', '誓约', '轨道'] }
};

function nodePosition(node: Node) {
  const y = node.band;
  const flat = Math.sqrt(Math.max(0.12, 1 - y * y));
  const x = Math.cos(node.theta) * node.radius * flat;
  const z = Math.sin(node.theta) * node.radius * flat;
  return new THREE.Vector3(x, y, z);
}

function mulberry(seed: number) {
  let s = seed;
  return () => {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ease(t: number) {
  return t * t * (3 - 2 * t);
}

function bezier(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, t: number) {
  const p = a.clone().lerp(b, t);
  const q = b.clone().lerp(c, t);
  return p.lerp(q, t);
}

function GlowPointMaterial({ opacity = 1 }: { opacity?: number }) {
  return h('shaderMaterial', {
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uOpacity: { value: opacity } },
    vertexShader: `
      attribute float aSize;
      attribute vec3 aColor;
      varying vec3 vColor;
      void main(){
        vColor = aColor;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = clamp(aSize * (280.0 / max(1.0, -mv.z)), 0.6, 7.0);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      uniform float uOpacity;
      varying vec3 vColor;
      void main(){
        vec2 p = gl_PointCoord - vec2(0.5);
        float d = length(p);
        float a = smoothstep(0.5, 0.05, d);
        if(a < 0.02) discard;
        gl_FragColor = vec4(vColor, a * uOpacity);
      }
    `
  });
}

function makePointGeometry(count: number, seed: number, maker: (i: number, r: () => number) => { p: THREE.Vector3; color: THREE.Color; size: number }) {
  const rand = mulberry(seed);
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const size = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const item = maker(i, rand);
    pos.set([item.p.x, item.p.y, item.p.z], i * 3);
    col.set([item.color.r, item.color.g, item.color.b], i * 3);
    size[i] = item.size;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
  g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  return g;
}

function BackgroundStars() {
  const geo = useMemo(() => makePointGeometry(1800, 1001, (_i, rand) => {
    const r = 18 + rand() * 28;
    const a = rand() * Math.PI * 2;
    const p = new THREE.Vector3(Math.cos(a) * r, (rand() - 0.5) * 18, Math.sin(a) * r);
    const color = new THREE.Color(rand() > 0.66 ? '#f5d6ff' : rand() > 0.38 ? '#c9fff6' : '#fff1c7');
    return { p, color, size: 0.018 + rand() * 0.028 };
  }), []);
  return h('points', { geometry: geo }, h(GlowPointMaterial, { opacity: 0.55 }));
}

function GalaxyBody() {
  const geo = useMemo(() => makePointGeometry(13000, 811, (_i, rand) => {
    const band = rand();
    const t = rand() * Math.PI * 2;
    const shell = Math.pow(rand(), 0.42);
    const y = (rand() - 0.5) * 0.82;
    const arm = Math.sin(t * 4.0 + shell * 3.2) * 0.16;
    const r = 0.34 + shell * 1.34 + arm;
    const p = new THREE.Vector3(Math.cos(t) * r, y, Math.sin(t) * r * 0.72);
    p.x += (rand() - 0.5) * 0.05;
    p.z += (rand() - 0.5) * 0.05;
    const palette = ['#ffd8ee', '#dcb8ff', '#a9fff3', '#fff0bc', '#88aaff'];
    const color = new THREE.Color(palette[Math.floor(band * palette.length)]);
    return { p, color, size: 0.012 + Math.pow(rand(), 2.2) * 0.05 };
  }), []);
  return h('group', { rotation: [-0.13, 0.28, 0.02] }, [
    h('points', { key: 'stars', geometry: geo }, h(GlowPointMaterial, { opacity: 0.78 })),
    h(OrbitRing, { key: 'r1', rx: 1.92, rz: 0.62, color: '#ffc6e9', opacity: 0.2, rotation: [0.08, 0.12, -0.26] }),
    h(OrbitRing, { key: 'r2', rx: 1.42, rz: 1.55, color: '#86fff3', opacity: 0.13, rotation: [0.65, -0.12, 0.36] }),
    h(OrbitRing, { key: 'r3', rx: 2.28, rz: 1.04, color: '#fff2c2', opacity: 0.11, rotation: [-0.34, 0.38, 0.12] })
  ]);
}

function OrbitRing({ rx, rz, color, opacity, rotation }: { rx: number; rz: number; color: string; opacity: number; rotation: [number, number, number] }) {
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 260; i++) {
      const t = i / 260 * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(t) * rx, Math.sin(t * 2.0) * 0.05, Math.sin(t) * rz));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [rx, rz]);
  return h('line', { geometry: geo, rotation }, h('lineBasicMaterial', { color, transparent: true, opacity, blending: THREE.AdditiveBlending }));
}

function NodeOrb({ node, active, onClick }: { node: Node; active: boolean; onClick: () => void }) {
  const p = nodePosition(node);
  return h('group', { position: [p.x, p.y, p.z], onClick: (e: any) => { e.stopPropagation(); onClick(); } }, [
    h('mesh', { key: 'halo', scale: active ? 1.6 : 1 }, h('sphereGeometry', { args: [active ? 0.11 : 0.078, 32, 32] }), h('meshBasicMaterial', { color: node.color, transparent: true, opacity: active ? 0.34 : 0.17, blending: THREE.AdditiveBlending })),
    h('mesh', { key: 'core' }, h('sphereGeometry', { args: [active ? 0.038 : 0.026, 32, 32] }), h('meshStandardMaterial', { color: node.color, emissive: node.color, emissiveIntensity: active ? 1.8 : 0.82, roughness: 0.3 })),
    h(Html, { key: 'label', center: true, distanceFactor: 8, position: [0.1, 0.04, 0] }, h('span', { className: active ? 'rg-label active' : 'rg-label' }, node.title))
  ]);
}

function LocalScene({ node, focusKey }: { node: Node; focusKey: number }) {
  const ref = useRef<THREE.Group>(null);
  const time = useRef(0);
  useEffect(() => { time.current = 0; }, [focusKey]);
  useFrame((_s, delta) => {
    time.current = Math.min(1, time.current + delta * 0.72);
    if (ref.current) {
      const e = ease(time.current);
      ref.current.scale.setScalar(0.2 + e * 0.92);
    }
  });
  const p = nodePosition(node);
  return h('group', { ref, position: [p.x, p.y, p.z], rotation: [0.1, -0.22, 0.06] }, [
    h(SceneDust, { key: 'dust', node }),
    h(LocalRings, { key: 'rings', node }),
    h(LocalArchitecture, { key: 'arch', node })
  ]);
}

function SceneDust({ node }: { node: Node }) {
  const geo = useMemo(() => makePointGeometry(1400, node.id.length * 333, (_i, rand) => {
    const t = rand() * Math.PI * 2;
    const r = Math.pow(rand(), 0.62) * 0.88;
    const p = new THREE.Vector3(Math.cos(t) * r, (rand() - 0.5) * 0.38, Math.sin(t) * r * 0.5);
    const color = new THREE.Color(rand() > 0.5 ? node.color : node.accent);
    return { p, color, size: 0.016 + rand() * 0.05 };
  }), [node]);
  return h('points', { geometry: geo }, h(GlowPointMaterial, { opacity: 0.86 }));
}

function LocalRings({ node }: { node: Node }) {
  return h('group', null, [
    h(OrbitRing, { key: 'a', rx: 0.78, rz: 0.42, color: node.accent, opacity: 0.38, rotation: [0.12, 0.08, -0.18] }),
    h(OrbitRing, { key: 'b', rx: 1.04, rz: 0.64, color: node.color, opacity: 0.2, rotation: [0.48, -0.2, 0.28] }),
    h(OrbitRing, { key: 'c', rx: 1.22, rz: 0.76, color: '#ffffff', opacity: 0.09, rotation: [-0.34, 0.25, 0.1] })
  ]);
}

function LocalArchitecture({ node }: { node: Node }) {
  if (node.id === 'moon-letter') {
    return h('group', null, [
      h('mesh', { rotation: [-0.1, 0.1, 0.02] }, h('boxGeometry', { args: [0.78, 0.46, 0.012] }), h('meshBasicMaterial', { color: '#fff2d7', transparent: true, opacity: 0.16 })),
      h('line', { geometry: new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.36, 0.12, 0.03), new THREE.Vector3(0, -0.08, 0.03), new THREE.Vector3(0.36, 0.12, 0.03)]) }, h('lineBasicMaterial', { color: node.accent, transparent: true, opacity: 0.5 }))
    ]);
  }
  if (node.id === 'rain-window') {
    const lines = [-0.32, 0, 0.32].flatMap((x, i) => [h('line', { key: 'v' + i, geometry: new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, -0.34, 0), new THREE.Vector3(x, 0.34, 0)]) }, h('lineBasicMaterial', { color: node.color, transparent: true, opacity: 0.36 }))]);
    return h('group', null, lines);
  }
  return h('mesh', null, h('sphereGeometry', { args: [0.18, 48, 48] }), h('meshBasicMaterial', { color: node.color, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending }));
}

function FocusCamera({ active }: { active: Node | null }) {
  const { camera } = useThree();
  const start = useRef(new THREE.Vector3());
  const end = useRef(new THREE.Vector3());
  const ctrl = useRef(new THREE.Vector3());
  const tRef = useRef(1);
  const last = useRef<string | null>(null);
  useEffect(() => {
    if (!active || last.current === active.id) return;
    last.current = active.id;
    start.current.copy(camera.position);
    const target = nodePosition(active);
    end.current.copy(target.clone().normalize().multiplyScalar(2.65).add(target.clone().multiplyScalar(0.72)));
    ctrl.current.copy(start.current.clone().lerp(end.current, 0.5).add(new THREE.Vector3(0, 0.82, 0.42)));
    tRef.current = 0;
  }, [active, camera]);
  useFrame((_s, d) => {
    if (!active || tRef.current >= 1) return;
    tRef.current = Math.min(1, tRef.current + d * 0.55);
    const t = ease(tRef.current);
    camera.position.copy(bezier(start.current, ctrl.current, end.current, t));
    camera.lookAt(nodePosition(active));
  });
  return null;
}

function Scene({ active, setActive }: { active: Node | null; setActive: (n: Node) => void }) {
  const [focusKey, setFocusKey] = useState(0);
  const controls = useRef<any>(null);
  useEffect(() => { if (active) setFocusKey(v => v + 1); }, [active]);
  useFrame(() => {
    if (controls.current) {
      const target = active ? nodePosition(active) : new THREE.Vector3(0, 0, 0);
      controls.current.target.lerp(target, 0.08);
      controls.current.update();
    }
  });
  return h('group', null, [
    h('ambientLight', { key: 'amb', intensity: 0.38 }),
    h('pointLight', { key: 'p1', position: [2.2, 2.4, 3.4], intensity: 1.1, color: '#ffd6ef' }),
    h('pointLight', { key: 'p2', position: [-2.8, -1.1, -2.2], intensity: 0.48, color: '#8cfff4' }),
    h(BackgroundStars, { key: 'bg' }),
    h(FocusCamera, { key: 'cam', active }),
    h(GalaxyBody, { key: 'galaxy' }),
    nodes.map(n => h(NodeOrb, { key: n.id, node: n, active: active?.id === n.id, onClick: () => setActive(n) })),
    active ? h(LocalScene, { key: active.id, node: active, focusKey }) : null,
    h(OrbitControls as any, { key: 'controls', ref: controls, enableDamping: true, dampingFactor: 0.08, minDistance: 1.35, maxDistance: 7.8, enablePan: false })
  ]);
}

function Overlay({ active, setActive }: { active: Node | null; setActive: (n: Node) => void }) {
  const info = active ? sceneText[active.id] : null;
  return h('div', { className: 'rg-ui' }, [
    h('div', { key: 'brand', className: 'rg-brand' }, [
      h('p', { key: 'k' }, 'ROMANCE GALAXY · INTERACTIVE MEMORY FIELD'),
      h('h1', { key: 't' }, active ? info?.title : '浪漫星系'),
      h('p', { key: 'd' }, active ? info?.line : '一个稳定、可旋转、可点击进入细节层的浪漫主题 3D 星系。')
    ]),
    h('div', { key: 'panel', className: 'rg-panel' }, [
      h('p', { key: 'small' }, active ? active.subtitle : 'SELECT A LIGHT'),
      h('h2', { key: 'title' }, active ? active.title : '选择一个光点'),
      h('p', { key: 'note' }, active ? active.note : '点击光点后，镜头会飞到对应节点，并打开同风格的局部浪漫场景。'),
      h('div', { key: 'tags', className: 'rg-tags' }, (active ? info?.tags : ['可旋转', '点击飞入', '悬浮 UI'])?.map(t => h('span', { key: t }, t))),
      h('div', { key: 'buttons', className: 'rg-buttons' }, nodes.map(n => h('button', { key: n.id, className: active?.id === n.id ? 'active' : '', onClick: () => setActive(n) }, n.title)))
    ]),
    h('div', { key: 'hint', className: 'rg-hint' }, 'DRAG 旋转 · WHEEL 缩放 · CLICK 光点进入 · ESC 返回')
  ]);
}

export default function RomanceGalaxy() {
  const [active, setActive] = useState<Node | null>(null);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') setActive(null); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);
  return h('div', { className: 'romance-galaxy' }, [
    h('div', { key: 'canvas', className: 'rg-canvas' }, h(Canvas, { camera: { position: [0, 0.35, 5.2], fov: 45 }, dpr: [1, 1.8], gl: { antialias: true, alpha: true } }, h(Scene, { active, setActive }))),
    h(Overlay, { key: 'ui', active, setActive })
  ]);
}
