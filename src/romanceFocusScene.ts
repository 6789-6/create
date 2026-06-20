import { CSSProperties, createElement, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { nodeSeeds, OrbitNode } from './romanceCore';

const h = createElement;
const el = (tag: string, props?: any, ...children: any[]) => h(tag as any, props, ...children);

const sceneRot = new THREE.Euler(-0.06, -0.18, 0.02);

const vertexShader = `
attribute float size;
attribute vec3 color;
varying vec3 vColor;
void main(){
  vColor = color;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = clamp(size * (340.0 / max(1.0, -mv.z)), 1.0, 20.0);
  gl_Position = projectionMatrix * mv;
}
`;

const fragmentShader = `
varying vec3 vColor;
void main(){
  vec2 p = gl_PointCoord - vec2(0.5);
  float d = length(p);
  float a = smoothstep(0.5, 0.04, d);
  if(a < 0.035) discard;
  gl_FragColor = vec4(vColor, a);
}
`;

const detail: Record<string, { kicker: string; title: string; text: string; tags: string[] }> = {
  first: {
    kicker: 'SCENE 01 · 星光初见',
    title: '一束光先替我靠近你',
    text: '镜头会先飞到这一束微光旁边，然后展开一条静止的心跳彗尾。',
    tags: ['靠近', '心跳', '星束']
  },
  rose: {
    kicker: 'SCENE 02 · 玫瑰星云',
    title: '不是一朵花，是一片夜空盛开',
    text: '抵达玫瑰光点之后，五瓣玫瑰星云会在空间里停成一幅画。',
    tags: ['玫瑰', '花瓣', '柔光']
  },
  moon: {
    kicker: 'SCENE 03 · 月光来信',
    title: '月亮把没说出口的话写成金色轨道',
    text: '金色信笺线会在月光节点旁边展开，像一封漂浮在夜空里的信。',
    tags: ['月光', '信笺', '金色']
  },
  aurora: {
    kicker: 'SCENE 04 · 极光慢舞',
    title: '安静也可以有颜色',
    text: '青绿色光幕会在镜头靠近后固定下来，像一片温柔的极光背景。',
    tags: ['极光', '慢舞', '夜空']
  },
  future: {
    kicker: 'SCENE 05 · 未来光环',
    title: '把愿望折成一圈一圈靠近的轨道',
    text: '多层戒环星门会在未来光点旁边停住，像一个许愿坐标。',
    tags: ['星门', '戒环', '未来']
  }
};

function random(seed: number) {
  let state = seed;
  return () => {
    state += 0x6d2b79f5;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function mixVec(a: THREE.Vector3, b: THREE.Vector3, t: number) {
  return a.clone().lerp(b, t);
}

function curve(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, t: number) {
  return mixVec(mixVec(a, b, t), mixVec(b, c, t), t);
}

function heart(t: number, scale: number) {
  const x = 16 * Math.pow(Math.sin(t), 3) * scale;
  const y = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * scale - 0.18;
  return new THREE.Vector3(x, y, 0);
}

function makeNodes(): OrbitNode[] {
  return nodeSeeds.map(([id, title, subtitle, color, note], index) => {
    const t = (index / nodeSeeds.length) * Math.PI * 2 + 0.42;
    const p = heart(t, 0.2 + (index % 2) * 0.018);
    p.z = Math.sin(t * 2.0) * 0.82;
    return { id, title, subtitle, color, note, pos: [p.x, p.y, p.z] };
  });
}

function worldPosition(node: OrbitNode) {
  return new THREE.Vector3(...node.pos).applyEuler(sceneRot);
}

function pointGeometry(count: number, seed: number, make: (i: number, rand: () => number) => { p: THREE.Vector3; c: THREE.Color; s: number }) {
  const rand = random(seed);
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const size = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    const item = make(i, rand);
    pos.set([item.p.x, item.p.y, item.p.z], i * 3);
    col.set([item.c.r, item.c.g, item.c.b], i * 3);
    size[i] = item.s;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(size, 1));
  return geometry;
}

function GlowMaterial() {
  return el('shaderMaterial', {
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
}

function DeepStars() {
  const geometry = useMemo(() => pointGeometry(2200, 81723, (_i, rand) => {
    const r = 13 + rand() * 23;
    const a = rand() * Math.PI * 2;
    const p = new THREE.Vector3(Math.cos(a) * r, (rand() - 0.5) * 15, Math.sin(a) * r);
    const c = new THREE.Color(rand() > 0.55 ? '#ffb4df' : '#92fff2');
    return { p, c, s: 0.012 + rand() * 0.034 };
  }), []);
  return el('points', { geometry }, h(GlowMaterial));
}

function StarHeart() {
  const geometry = useMemo(() => {
    const palette = ['#ff7ac4', '#ffc8e5', '#bda4ff', '#8ffff1', '#fff0bc'].map(color => new THREE.Color(color));
    return pointGeometry(15500, 74019, (_i, rand) => {
      const t = rand() * Math.PI * 2;
      const layer = Math.pow(rand(), 0.54);
      const p = heart(t, 0.09 + layer * 0.22);
      p.x += (rand() - 0.5) * (0.16 + layer * 0.48);
      p.y += (rand() - 0.5) * (0.12 + layer * 0.34);
      p.z = Math.sin(t * 2.15) * (0.16 + layer * 0.74) + (rand() - 0.5) * 0.72;
      const c = palette[Math.floor(rand() * palette.length)].clone().lerp(new THREE.Color('#fff7fb'), layer < 0.24 ? 0.38 : rand() * 0.16);
      return { p, c, s: 0.018 + Math.pow(rand(), 2.1) * 0.062 };
    });
  }, []);
  return el('points', { geometry }, h(GlowMaterial));
}

function Ring({ rx, ry, color, opacity, rot }: { rx: number; ry: number; color: string; opacity: number; rot: [number, number, number] }) {
  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 300; i += 1) {
      const t = (i / 300) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(t) * rx, Math.sin(t) * ry, Math.sin(t * 2) * 0.16));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [rx, ry]);
  return el('line', { geometry, rotation: rot }, el('lineBasicMaterial', { color, transparent: true, opacity, blending: THREE.AdditiveBlending }));
}

function Ritual({ active, focusKey }: { active: OrbitNode; focusKey: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const progress = useRef(0);
  useEffect(() => { progress.current = 0; }, [focusKey]);

  const geometry = useMemo(() => {
    const seed = active.id.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 37);
    const base = new THREE.Color(active.color);
    const count = active.id === 'rose' ? 1600 : active.id === 'aurora' ? 1300 : 1050;
    return pointGeometry(count, seed, (i, rand) => {
      const u = (i / count) * Math.PI * 2;
      const layer = Math.pow(rand(), 0.58);
      let x = 0;
      let y = 0;
      let z = 0;
      if (active.id === 'rose') {
        const petal = 1 + 0.48 * Math.sin(5 * u);
        x = Math.cos(u) * (0.25 + layer * 0.96) * petal;
        y = Math.sin(u) * (0.18 + layer * 0.62) * petal;
        z = (rand() - 0.5) * 0.54;
      } else if (active.id === 'moon') {
        x = ((i % 36) / 36 - 0.5) * 1.65;
        y = (Math.floor(i / 36) % 30 - 15) * 0.028 + Math.sin(u) * 0.16;
        z = (rand() - 0.5) * 0.44;
      } else if (active.id === 'aurora') {
        x = (rand() - 0.5) * 1.9;
        y = Math.sin(x * 4.4 + u) * 0.45 + (rand() - 0.5) * 0.16;
        z = Math.cos(x * 3.1 + u) * 0.45;
      } else if (active.id === 'future') {
        x = Math.cos(u) * (0.32 + layer * 0.94);
        y = Math.sin(u) * (0.18 + (i % 4) * 0.12 + layer * 0.24);
        z = Math.sin(u + (i % 4)) * 0.54;
      } else {
        const s = Math.pow(i / count, 0.72);
        x = -0.78 + s * 1.56 + (rand() - 0.5) * 0.16;
        y = Math.sin(s * Math.PI * 2) * 0.28 + (rand() - 0.5) * 0.15;
        z = (rand() - 0.5) * (0.65 - s * 0.24);
      }
      const highlight = active.id === 'moon' || active.id === 'future' ? '#fff1bd' : active.id === 'aurora' ? '#90fff0' : '#fff7fb';
      const c = base.clone().lerp(new THREE.Color(highlight), 0.25 + rand() * 0.3);
      return { p: new THREE.Vector3(x, y, z), c, s: 0.018 + Math.pow(rand(), 1.8) * 0.078 };
    });
  }, [active.id, active.color]);

  useFrame((_state, delta) => {
    const group = groupRef.current;
    if (!group) return;
    progress.current = Math.min(1, progress.current + delta * 0.82);
    const e = easeOut(progress.current);
    group.scale.setScalar(0.05 + e * 1.05);
  });

  const children = [
    h(Ring, { key: 'r1', rx: 1.28, ry: 0.66, color: active.color, opacity: 0.34, rot: [0.35, 0.18, 0.12] }),
    h(Ring, { key: 'r2', rx: 0.78, ry: 1.02, color: active.id === 'moon' ? '#fff1bd' : '#91fff0', opacity: 0.18, rot: [-0.6, 0.14, -0.38] }),
    el('points', { key: 'pts', geometry }, h(GlowMaterial))
  ];
  return el('group', { ref: groupRef, position: active.pos }, children);
}

function NodeMesh({ node, active, select }: { node: OrbitNode; active: boolean; select: (node: OrbitNode) => void }) {
  const core = el('mesh', { key: 'core', onClick: (event: any) => { event.stopPropagation(); select(node); } },
    el('sphereGeometry', { args: [active ? 0.14 : 0.078, 32, 32] }),
    el('meshBasicMaterial', { color: node.color, transparent: true, opacity: active ? 1 : 0.9 })
  );
  const halo = el('mesh', { key: 'halo', scale: active ? 3.2 : 1.95 },
    el('sphereGeometry', { args: [active ? 0.14 : 0.078, 32, 32] }),
    el('meshBasicMaterial', { color: node.color, transparent: true, opacity: active ? 0.2 : 0.075, depthWrite: false, blending: THREE.AdditiveBlending })
  );
  return el('group', { position: node.pos }, [core, halo]);
}

function CameraFlight({ active, focusKey, controlsRef }: { active: OrbitNode; focusKey: number; controlsRef: any }) {
  const { camera } = useThree();
  const flight = useRef<{ t: number; startPos: THREE.Vector3; mid: THREE.Vector3; endPos: THREE.Vector3; startTarget: THREE.Vector3; endTarget: THREE.Vector3 } | null>(null);

  useEffect(() => {
    const target = worldPosition(active);
    const dir = target.clone().normalize().multiplyScalar(0.85);
    const endTarget = target.clone();
    const endPos = target.clone().add(new THREE.Vector3(0.35, 0.28, 2.65)).add(dir);
    const startTarget = controlsRef.current?.target?.clone?.() ?? new THREE.Vector3(0, 0, 0);
    const startPos = camera.position.clone();
    const mid = startPos.clone().lerp(endPos, 0.5).add(new THREE.Vector3(0, 0.75, 0.95));
    flight.current = { t: 0, startPos, mid, endPos, startTarget, endTarget };
  }, [focusKey, active, camera, controlsRef]);

  useFrame((_state, delta) => {
    const data = flight.current;
    const controls = controlsRef.current;
    if (!data || !controls) return;
    data.t = Math.min(1, data.t + delta / 1.35);
    const e = easeOut(data.t);
    camera.position.copy(curve(data.startPos, data.mid, data.endPos, e));
    controls.target.copy(mixVec(data.startTarget, data.endTarget, e));
    camera.lookAt(controls.target);
    controls.update();
    if (data.t >= 1) flight.current = null;
  });
  return null;
}

function Scene({ nodes, active, select, focusKey }: { nodes: OrbitNode[]; active: OrbitNode; select: (node: OrbitNode) => void; focusKey: number }) {
  const controlsRef = useRef<any>(null);
  const globeChildren = [
    el('mesh', { key: 'aura', scale: [1.05, 0.72, 0.56] },
      el('sphereGeometry', { args: [1, 64, 64] }),
      el('meshBasicMaterial', { color: '#ffaad8', transparent: true, opacity: 0.055, depthWrite: false, blending: THREE.AdditiveBlending })
    ),
    h(StarHeart, { key: 'heart' }),
    h(Ring, { key: 'ring1', rx: 3.05, ry: 1.94, color: '#ff83c8', opacity: 0.34, rot: [0.18, 0, 0.08] }),
    h(Ring, { key: 'ring2', rx: 3.42, ry: 2.22, color: '#91fff0', opacity: 0.16, rot: [-0.58, 0.04, -0.13] }),
    h(Ring, { key: 'ring3', rx: 2.3, ry: 1.42, color: '#fff0b8', opacity: 0.15, rot: [0.82, 0.14, 0.4] }),
    h(Ritual, { key: `${active.id}-${focusKey}`, active, focusKey }),
    ...nodes.map(node => h(NodeMesh, { key: node.id, node, active: active.id === node.id, select }))
  ];
  const canvasChildren = [
    el('color', { key: 'bg', attach: 'background', args: ['#05000d'] }),
    el('ambientLight', { key: 'ambient', intensity: 0.58 }),
    el('pointLight', { key: 'pinkLight', position: [2.5, 2.4, 3.4], intensity: 0.9, color: '#ffaddd' }),
    el('pointLight', { key: 'cyanLight', position: [-2.2, -1.8, 2.1], intensity: 0.46, color: '#91fff0' }),
    h(CameraFlight, { key: 'camera', active, focusKey, controlsRef }),
    h(DeepStars, { key: 'stars' }),
    el('group', { key: 'globe', rotation: [-0.05, -0.16, 0] }, globeChildren),
    h(OrbitControls, { key: 'controls', ref: controlsRef, enablePan: false, enableDamping: true, dampingFactor: 0.07, rotateSpeed: 0.58, minDistance: 2.25, maxDistance: 9.5 })
  ];
  return h(Canvas, { camera: { position: [0, 0.15, 6.9], fov: 38 }, dpr: [1, 1.6] }, canvasChildren);
}

export function RomanceOrbitApp() {
  const nodes = useMemo(makeNodes, []);
  const [active, setActive] = useState(nodes[0]);
  const [focusKey, setFocusKey] = useState(0);
  const [query, setQuery] = useState('');
  const visibleNodes = (query ? nodes.filter(node => `${node.title}${node.subtitle}${node.note}`.includes(query)) : nodes).slice(0, 5);
  const activeDetail = detail[active.id] ?? detail.first;
  const selectNode = (node: OrbitNode) => {
    setActive(node);
    setFocusKey(value => value + 1);
  };

  return h('main', { className: 'romance-shell', style: { '--accent': active.color } as CSSProperties },
    h(Scene, { nodes, active, select: selectNode, focusKey }),
    h('div', { className: 'romance-vignette' }),
    h('section', { className: 'brand-float' },
      h('span', null, 'ROMANCE ORBIT'),
      h('h1', null, '极光玫瑰宇宙'),
      h('p', null, '点击光点，镜头会靠近那里，再停成一张可以旋转的浪漫 3D 场景。')
    ),
    h('section', { className: 'search-float' },
      h('input', { value: query, onChange: (event: any) => setQuery(event.target.value), placeholder: '搜索：玫瑰 / 月光 / 极光 / 未来' }),
      h('div', { className: 'memory-list' },
        visibleNodes.map(node => h('button', { key: node.id, onClick: () => selectNode(node), className: active.id === node.id ? 'is-active' : '' },
          h('b', null, node.title),
          h('span', null, node.subtitle)
        ))
      )
    ),
    h('section', { className: 'detail-float' },
      h('span', { className: 'detail-kicker' }, activeDetail.kicker),
      h('h2', null, active.title),
      h('p', null, active.subtitle),
      h('div', { className: 'ritual-card' },
        h('b', null, activeDetail.title),
        h('span', null, activeDetail.text)
      ),
      h('div', { className: 'ritual-lines' }, activeDetail.tags.map(tag => h('em', { key: tag }, tag)))
    ),
    h('section', { className: 'hint-float' }, '点击光点：镜头靠近 · 过场展开 · 停住成静态浪漫场景 · 之后可自由旋转')
  );
}
