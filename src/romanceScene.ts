import { CSSProperties, createElement, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { themeItems } from './themeData';
import { nodeSeeds, OrbitNode } from './romanceCore';

const h = createElement;
const three = (tag: string, props?: any, ...children: any[]) => h(tag as any, props, ...children);

const pointVertex = `
  attribute float size;
  attribute vec3 color;
  varying vec3 vColor;
  void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    float perspective = 320.0 / max(1.0, -mvPosition.z);
    gl_PointSize = clamp(size * perspective, 1.0, 20.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const pointFragment = `
  varying vec3 vColor;
  void main() {
    vec2 p = gl_PointCoord - vec2(0.5);
    float d = length(p);
    float core = smoothstep(0.5, 0.0, d);
    float halo = smoothstep(0.5, 0.12, d) * 0.55;
    float alpha = core * 0.92 + halo;
    if (alpha < 0.025) discard;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

const romanceDetails: Record<string, { kicker: string; title: string; story: string; promise: string; moments: string[] }> = {
  first: {
    kicker: 'SCENE 01 · 星光初见',
    title: '一束光先替我靠近你',
    story: '点击后，星体会先打开一扇微光之门，随后停成一条安静的心跳彗尾，像第一次在人群里看见你。',
    promise: '过场：光门扩张 1 秒；结束：初见星束静止成像。',
    moments: ['视线落点', '心跳延迟', '第一束星光']
  },
  rose: {
    kicker: 'SCENE 02 · 玫瑰星云',
    title: '不是一朵花，是一片夜空盛开',
    story: '玫瑰节点会先从一点向外开场，过场结束后固定成五瓣玫瑰星云，像一张可以旋转的玫瑰天体照片。',
    promise: '过场：花瓣展开；结束：玫瑰星云保持静态。',
    moments: ['粉色星尘', '花瓣轨道', '柔光核心']
  },
  moon: {
    kicker: 'SCENE 03 · 月光来信',
    title: '月亮把没说出口的话写成金色轨道',
    story: '月光节点会展开一组金色信笺线，像夜里被折好的信。动画结束后，信笺会悬停在空间中。',
    promise: '过场：信笺线浮现；结束：月光来信静止展示。',
    moments: ['金色轨道', '未寄出的信', '月下回声']
  },
  aurora: {
    kicker: 'SCENE 04 · 极光慢舞',
    title: '安静也可以有颜色',
    story: '极光节点打开青绿色幕帘，像一次短暂的光幕升起。升起之后，极光固定成一片立体光带。',
    promise: '过场：极光幕帘升起；结束：极光场景静态保留。',
    moments: ['青绿色光带', '慢舞波纹', '夜空呼吸']
  },
  future: {
    kicker: 'SCENE 05 · 未来光环',
    title: '把愿望折成一圈一圈靠近的轨道',
    story: '未来节点会展开多层戒环和星门。动画之后，它会像一个静态愿望坐标悬浮在星体旁。',
    promise: '过场：戒环合拢；结束：未来星门静态成型。',
    moments: ['远环', '愿望星门', '一起抵达']
  }
};

function seeded(seed: number) {
  let t = seed + 0x6d2b79f5;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function easeOutCubic(x: number) {
  return 1 - Math.pow(1 - x, 3);
}

function heart(t: number, scale = 0.16) {
  const x = 16 * Math.pow(Math.sin(t), 3) * scale;
  const y = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * scale - 0.18;
  return new THREE.Vector3(x, y, 0);
}

function makeNodes(): OrbitNode[] {
  return nodeSeeds.map(([id, title, subtitle, color, note], i) => {
    const t = (i / nodeSeeds.length) * Math.PI * 2 + 0.38;
    const p = heart(t, 0.19 + (i % 2) * 0.018);
    p.z = Math.sin(t * 2.0) * 0.82;
    return { id, title, subtitle, color, note, pos: [p.x, p.y, p.z] };
  });
}

function makePointCloud(count: number, seed: number, maker: (i: number, r: () => number) => { p: THREE.Vector3; c: THREE.Color; size: number }) {
  const rand = seeded(seed);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const { p, c, size } = maker(i, rand);
    positions[i * 3] = p.x;
    positions[i * 3 + 1] = p.y;
    positions[i * 3 + 2] = p.z;
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
    sizes[i] = size;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  return geo;
}

function ParticleMaterial() {
  return three('shaderMaterial', {
    vertexShader: pointVertex,
    fragmentShader: pointFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
}

function SoftParticles({ count = 14500 }: { count?: number }) {
  const geometry = useMemo(() => {
    const palette = ['#ff7abf', '#ffc1df', '#bca5ff', '#87fff2', '#fff0b8'].map((c) => new THREE.Color(c));
    return makePointCloud(count, 20260620, (_i, rand) => {
      const t = rand() * Math.PI * 2;
      const band = Math.pow(rand(), 0.52);
      const layer = 0.32 + band * 1.08;
      const p = heart(t, 0.19 * layer);
      const arm = Math.sin(t * 5 + band * 5.2);
      const haze = 0.12 + 0.5 * Math.pow(rand(), 2.0);
      p.x += (rand() - 0.5) * haze + arm * 0.075 * (1 - band);
      p.y += (rand() - 0.5) * haze * 0.78;
      p.z = Math.sin(t * 2.2) * 0.52 * layer + (rand() - 0.5) * (1.2 - band * 0.45);
      const c = palette[Math.floor(rand() * palette.length)].clone();
      if (band < 0.32) c.lerp(new THREE.Color('#fff7fb'), 0.34);
      return { p, c, size: 0.022 + Math.pow(rand(), 2.6) * 0.055 };
    });
  }, [count]);
  return three('points', { geometry }, h(ParticleMaterial));
}

function DeepStars() {
  const geometry = useMemo(() => {
    const palette = ['#ffffff', '#ffb4df', '#9dfcf4', '#b6c7ff'].map((c) => new THREE.Color(c));
    return makePointCloud(1800, 93011, (_i, rand) => {
      const r = 15 + rand() * 24;
      const a = rand() * Math.PI * 2;
      const p = new THREE.Vector3(Math.cos(a) * r, (rand() - 0.5) * 16, Math.sin(a) * r);
      return { p, c: palette[Math.floor(rand() * palette.length)], size: 0.01 + rand() * 0.028 };
    });
  }, []);
  return three('points', { geometry }, h(ParticleMaterial));
}

function Ribbon({ rx, ry, color, rot = [0, 0, 0], opacity = 0.25 }: { rx: number; ry: number; color: string; rot?: [number, number, number]; opacity?: number }) {
  const geometry = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 360; i++) {
      const t = (i / 360) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(t) * rx, Math.sin(t) * ry, Math.sin(t * 2.0) * 0.18));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [rx, ry]);
  return three('line', { geometry, rotation: rot },
    three('lineBasicMaterial', { color, transparent: true, opacity, blending: THREE.AdditiveBlending })
  );
}

function CoreGlow() {
  return three('group', null,
    three('mesh', { scale: [1.05, 0.72, 0.56] },
      three('sphereGeometry', { args: [1, 64, 64] }),
      three('meshBasicMaterial', { color: '#ffaad8', transparent: true, opacity: 0.055, depthWrite: false, blending: THREE.AdditiveBlending })
    ),
    three('mesh', { scale: [0.34, 0.24, 0.2] },
      three('sphereGeometry', { args: [1, 48, 48] }),
      three('meshBasicMaterial', { color: '#fff7fb', transparent: true, opacity: 0.18, depthWrite: false, blending: THREE.AdditiveBlending })
    )
  );
}

function RitualGate({ active }: { active: OrbitNode }) {
  const ringColor = active.id === 'moon' ? '#fff0b8' : active.id === 'aurora' ? '#91fff0' : active.color;
  return three('group', null,
    h(Ribbon, { rx: 1.25, ry: 0.62, color: ringColor, opacity: 0.36, rot: [0.35, 0.2, 0.12] }),
    h(Ribbon, { rx: 0.72, ry: 1.05, color: active.id === 'future' ? '#fff0b8' : '#91fff0', opacity: 0.19, rot: [-0.65, 0.15, -0.4] }),
    h(Ribbon, { rx: 1.58, ry: 0.94, color: '#fff7fb', opacity: 0.1, rot: [0.1, -0.52, 0.56] })
  );
}

function MemoryRitual({ active }: { active: OrbitNode }) {
  const groupRef = useRef<THREE.Group>(null);
  const progressRef = useRef(0);
  const geometry = useMemo(() => {
    const seed = active.id.split('').reduce((a, c) => a + c.charCodeAt(0), 17);
    const base = new THREE.Color(active.color);
    const white = new THREE.Color('#fff7fb');
    const cyan = new THREE.Color('#90fff0');
    const gold = new THREE.Color('#fff0b8');
    const count = active.id === 'rose' ? 1450 : active.id === 'aurora' ? 1180 : active.id === 'future' ? 1100 : 940;
    return makePointCloud(count, seed, (i, rand) => {
      const u = (i / count) * Math.PI * 2;
      const layer = Math.pow(rand(), 0.54);
      const ring = 0.18 + layer * 1.05;
      let x = 0; let y = 0; let z = 0;
      if (active.id === 'rose') {
        const petal = 1 + 0.42 * Math.sin(5 * u);
        x = Math.cos(u) * ring * petal;
        y = Math.sin(u) * ring * 0.62 * petal;
        z = (rand() - 0.5) * 0.52 + Math.sin(u * 3) * 0.1;
      } else if (active.id === 'moon') {
        const row = (i % 30) / 30;
        x = (row - 0.5) * 1.38 + Math.sin(u * 2) * 0.08;
        y = (Math.floor(i / 30) % 32 - 16) * 0.025 + Math.sin(u) * 0.18;
        z = (rand() - 0.5) * 0.42 + Math.cos(u * 1.7) * 0.18;
      } else if (active.id === 'aurora') {
        x = (rand() - 0.5) * 1.78;
        y = Math.sin(x * 4.2 + u * 1.2) * 0.42 + (rand() - 0.5) * 0.18;
        z = Math.cos(x * 3.4 + u) * 0.42 + (rand() - 0.5) * 0.5;
      } else if (active.id === 'future') {
        const tilt = i % 4;
        x = Math.cos(u) * (0.32 + layer * 0.9);
        y = Math.sin(u) * (0.16 + tilt * 0.12 + layer * 0.26);
        z = Math.sin(u + tilt) * 0.5 + (rand() - 0.5) * 0.2;
      } else {
        const comet = Math.pow(i / count, 0.74);
        x = -0.72 + comet * 1.48 + (rand() - 0.5) * 0.16;
        y = Math.sin(comet * Math.PI * 2.0) * 0.28 + (rand() - 0.5) * 0.16;
        z = (rand() - 0.5) * (0.62 - comet * 0.24);
      }
      const p = new THREE.Vector3(x, y, z);
      const c = base.clone();
      if (active.id === 'aurora') c.lerp(cyan, 0.45 + rand() * 0.35);
      if (active.id === 'moon' || active.id === 'future') c.lerp(gold, 0.38 + rand() * 0.32);
      c.lerp(white, rand() * 0.32);
      return { p, c, size: 0.018 + Math.pow(rand(), 1.9) * 0.075 };
    });
  }, [active.id, active.color]);

  useFrame((_state, delta) => {
    const g = groupRef.current;
    if (!g) return;
    if (progressRef.current < 1) progressRef.current = Math.min(1, progressRef.current + delta * 0.78);
    const e = easeOutCubic(progressRef.current);
    g.scale.setScalar(0.08 + e * 1.08);
    g.rotation.set(
      active.id === 'moon' ? -0.18 : active.id === 'aurora' ? 0.34 : 0.1,
      active.id === 'future' ? 0.7 : -0.18,
      active.id === 'rose' ? 0.28 : active.id === 'first' ? -0.16 : 0.04
    );
  });

  return three('group', { ref: groupRef, position: active.pos },
    h(RitualGate, { active }),
    three('points', { geometry }, h(ParticleMaterial))
  );
}

function NodeMesh({ node, active, select }: { node: OrbitNode; active: boolean; select: (node: OrbitNode) => void }) {
  return three('group', { position: node.pos },
    three('mesh', { onClick: (event: any) => { event.stopPropagation(); select(node); } },
      three('sphereGeometry', { args: [active ? 0.14 : 0.075, 32, 32] }),
      three('meshBasicMaterial', { color: node.color, transparent: true, opacity: active ? 1 : 0.88 })
    ),
    three('mesh', { scale: active ? 3.1 : 1.95 },
      three('sphereGeometry', { args: [active ? 0.14 : 0.075, 32, 32] }),
      three('meshBasicMaterial', { color: node.color, transparent: true, opacity: active ? 0.18 : 0.07, depthWrite: false, blending: THREE.AdditiveBlending })
    ),
    active ? h(Html, { className: 'node-label', distanceFactor: 8, position: [0, 0.32, 0], center: true }, h('span', null, node.title)) : null
  );
}

function Scene({ nodes, active, select, ritualKey }: { nodes: OrbitNode[]; active: OrbitNode; select: (node: OrbitNode) => void; ritualKey: number }) {
  return h(Canvas, { camera: { position: [0, 0.15, 6.9], fov: 38 }, dpr: [1, 1.6] },
    three('color', { attach: 'background', args: ['#05000d'] }),
    three('ambientLight', { intensity: 0.55 }),
    three('pointLight', { position: [2.5, 2.4, 3.4], intensity: 0.9, color: '#ffaddd' }),
    three('pointLight', { position: [-2.2, -1.8, 2.1], intensity: 0.46, color: '#91fff0' }),
    h(DeepStars),
    three('group', { rotation: [-0.05, -0.16, 0] },
      h(CoreGlow),
      h(SoftParticles),
      h(Ribbon, { rx: 3.05, ry: 1.94, color: '#ff83c8', opacity: 0.36, rot: [0.18, 0, 0.08] }),
      h(Ribbon, { rx: 3.42, ry: 2.22, color: '#91fff0', opacity: 0.16, rot: [-0.58, 0.04, -0.13] }),
      h(Ribbon, { rx: 2.3, ry: 1.42, color: '#fff0b8', opacity: 0.16, rot: [0.82, 0.14, 0.4] }),
      h(Ribbon, { rx: 3.9, ry: 2.58, color: '#c8a7ff', opacity: 0.09, rot: [0.25, 0.34, -0.36] }),
      h(MemoryRitual, { active, key: `${active.id}-${ritualKey}` }),
      ...nodes.map((node) => h(NodeMesh, { key: node.id, node, active: active.id === node.id, select }))
    ),
    h(OrbitControls, { enablePan: false, enableDamping: true, dampingFactor: 0.07, rotateSpeed: 0.58, minDistance: 3.8, maxDistance: 9.5 })
  );
}

export function RomanceOrbitApp() {
  const nodes = useMemo(makeNodes, []);
  const [active, setActive] = useState(nodes[0]);
  const [ritualKey, setRitualKey] = useState(0);
  const [query, setQuery] = useState('');
  const list = (query ? nodes.filter((n) => `${n.title}${n.subtitle}${n.note}`.includes(query)) : nodes).slice(0, 5);
  const detail = romanceDetails[active.id] ?? romanceDetails.first;
  const selectNode = (node: OrbitNode) => {
    setActive(node);
    setRitualKey((k) => k + 1);
  };

  return h('main', { className: 'romance-shell', style: { '--accent': active.color } as CSSProperties },
    h(Scene, { nodes, active, select: selectNode, ritualKey }),
    h('div', { className: 'romance-vignette' }),
    h('section', { className: 'brand-float' },
      h('span', null, 'ROMANCE ORBIT'),
      h('h1', null, '极光玫瑰宇宙'),
      h('p', null, '点击光点，先进入短暂过场，再停成一张可以旋转的浪漫 3D 场景。')
    ),
    h('section', { className: 'search-float' },
      h('input', { value: query, onChange: (e: any) => setQuery(e.target.value), placeholder: '搜索：玫瑰 / 月光 / 极光 / 未来' }),
      h('div', { className: 'memory-list' }, ...list.map((n) => h('button', { key: n.id, onClick: () => selectNode(n), className: active.id === n.id ? 'is-active' : '' }, h('b', null, n.title), h('span', null, n.subtitle))))
    ),
    h('section', { className: 'detail-float' },
      h('span', { className: 'detail-kicker' }, detail.kicker),
      h('h2', null, active.title),
      h('p', null, active.subtitle),
      h('div', { className: 'ritual-card' }, h('b', null, detail.title), h('span', null, detail.story)),
      h('div', { className: 'ritual-lines' }, ...detail.moments.map((m) => h('em', { key: m }, m))),
      h('small', null, detail.promise),
      h('div', { className: 'tag-row' }, ...themeItems.map((item) => h('button', { key: item.id, style: { '--c': item.color } as CSSProperties }, item.title)))
    ),
    h('section', { className: 'hint-float' }, '拖动旋转 · 滚轮缩放 · 点击光点触发一次性过场 · 过场后保持静态')
  );
}
