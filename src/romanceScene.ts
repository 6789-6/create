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
    float perspective = 300.0 / max(1.0, -mvPosition.z);
    gl_PointSize = clamp(size * perspective, 1.0, 18.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const pointFragment = `
  varying vec3 vColor;
  void main() {
    vec2 p = gl_PointCoord - vec2(0.5);
    float d = length(p);
    float core = smoothstep(0.5, 0.0, d);
    float halo = smoothstep(0.5, 0.13, d) * 0.5;
    float alpha = core * 0.94 + halo;
    if (alpha < 0.025) discard;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

const romanceDetails: Record<string, { kicker: string; title: string; story: string; promise: string; moments: string[] }> = {
  first: {
    kicker: 'SCENE 01 · 星光初见',
    title: '一束光先替我靠近你',
    story: '点亮后，中心会展开一条微小的彗星轨迹，像第一次在人群里看见你，世界还很吵，但光只往一个方向偏移。',
    promise: '仪式：初见星束会在主星旁形成短暂心跳轨迹。',
    moments: ['视线落点', '心跳延迟', '第一束星光']
  },
  rose: {
    kicker: 'SCENE 02 · 玫瑰星云',
    title: '不是一朵花，是一片夜空盛开',
    story: '玫瑰节点会打开五瓣粉色星尘，花瓣不是贴图，而是一圈圈发光粒子，在你旋转时呈现不同层次。',
    promise: '仪式：玫瑰花瓣轨道围绕节点展开。',
    moments: ['粉色星尘', '花瓣轨道', '柔光核心']
  },
  moon: {
    kicker: 'SCENE 03 · 月光来信',
    title: '月亮把没说出口的话写成金色轨道',
    story: '月光节点会生成一组漂浮信笺线，像夜里被折起来的信，绕着星体慢慢显出温柔的金色。',
    promise: '仪式：金色信笺线从节点附近展开。',
    moments: ['金色轨道', '未寄出的信', '月下回声']
  },
  aurora: {
    kicker: 'SCENE 04 · 极光慢舞',
    title: '安静也可以有颜色',
    story: '极光节点会拉出青绿色波纹光带，像一场不用说话的慢舞，旋转时会看到它在空间里有真实厚度。',
    promise: '仪式：极光波纹在节点周围垂落。',
    moments: ['青绿色光带', '慢舞波纹', '夜空呼吸']
  },
  future: {
    kicker: 'SCENE 05 · 未来光环',
    title: '把愿望折成一圈一圈靠近的轨道',
    story: '未来节点会出现多层戒环与小星门，像把“以后”变成可旋转、可抵达的地方。',
    promise: '仪式：未来戒环围绕节点形成。',
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

function SoftParticles({ count = 14500 }: { count?: number }) {
  const geometry = useMemo(() => {
    const rand = seeded(20260620);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const palette = ['#ff7abf', '#ffc1df', '#bca5ff', '#87fff2', '#fff0b8'].map((c) => new THREE.Color(c));

    for (let i = 0; i < count; i++) {
      const t = rand() * Math.PI * 2;
      const band = Math.pow(rand(), 0.52);
      const layer = 0.32 + band * 1.08;
      const p = heart(t, 0.19 * layer);
      const arm = Math.sin(t * 5 + band * 5.2);
      const haze = 0.12 + 0.5 * Math.pow(rand(), 2.0);
      p.x += (rand() - 0.5) * haze + arm * 0.075 * (1 - band);
      p.y += (rand() - 0.5) * haze * 0.78;
      p.z = Math.sin(t * 2.2) * 0.52 * layer + (rand() - 0.5) * (1.2 - band * 0.45);

      positions[i * 3] = p.x;
      positions[i * 3 + 1] = p.y;
      positions[i * 3 + 2] = p.z;

      const c = palette[Math.floor(rand() * palette.length)].clone();
      if (band < 0.32) c.lerp(new THREE.Color('#fff7fb'), 0.34);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
      sizes[i] = 0.022 + Math.pow(rand(), 2.6) * 0.055;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, [count]);

  return three('points', { geometry },
    three('shaderMaterial', {
      vertexShader: pointVertex,
      fragmentShader: pointFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  );
}

function DeepStars() {
  const geometry = useMemo(() => {
    const rand = seeded(93011);
    const count = 1800;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const palette = ['#ffffff', '#ffb4df', '#9dfcf4', '#b6c7ff'].map((c) => new THREE.Color(c));
    for (let i = 0; i < count; i++) {
      const r = 15 + rand() * 24;
      const a = rand() * Math.PI * 2;
      const y = (rand() - 0.5) * 16;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(a) * r;
      const c = palette[Math.floor(rand() * palette.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
      sizes[i] = 0.01 + rand() * 0.028;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, []);

  return three('points', { geometry },
    three('shaderMaterial', {
      vertexShader: pointVertex,
      fragmentShader: pointFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  );
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

function MemoryRitual({ active }: { active: OrbitNode }) {
  const groupRef = useRef<THREE.Group>(null);
  const geometry = useMemo(() => {
    const rand = seeded(active.id.split('').reduce((a, c) => a + c.charCodeAt(0), 17));
    const count = active.id === 'rose' ? 950 : active.id === 'aurora' ? 820 : 680;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const base = new THREE.Color(active.color);
    const white = new THREE.Color('#fff7fb');
    const cyan = new THREE.Color('#90fff0');
    const gold = new THREE.Color('#fff0b8');

    for (let i = 0; i < count; i++) {
      const u = (i / count) * Math.PI * 2;
      const layer = Math.pow(rand(), 0.55);
      const ring = 0.2 + layer * 0.82;
      let x = 0;
      let y = 0;
      let z = 0;

      if (active.id === 'rose') {
        const petal = 1 + 0.32 * Math.sin(5 * u);
        x = Math.cos(u) * ring * petal;
        y = Math.sin(u) * ring * 0.62 * petal;
        z = (rand() - 0.5) * 0.48 + Math.sin(u * 3) * 0.08;
      } else if (active.id === 'moon') {
        const row = (i % 24) / 24;
        x = (row - 0.5) * 1.18 + Math.sin(u * 2) * 0.06;
        y = (Math.floor(i / 24) % 28 - 14) * 0.025 + Math.sin(u) * 0.16;
        z = (rand() - 0.5) * 0.38 + Math.cos(u * 1.7) * 0.16;
      } else if (active.id === 'aurora') {
        x = (rand() - 0.5) * 1.55;
        y = Math.sin(x * 4.2 + u * 1.2) * 0.34 + (rand() - 0.5) * 0.18;
        z = Math.cos(x * 3.4 + u) * 0.34 + (rand() - 0.5) * 0.46;
      } else if (active.id === 'future') {
        const tilt = i % 3;
        x = Math.cos(u) * (0.36 + layer * 0.72);
        y = Math.sin(u) * (0.18 + tilt * 0.12 + layer * 0.22);
        z = Math.sin(u + tilt) * 0.42 + (rand() - 0.5) * 0.18;
      } else {
        const comet = Math.pow(i / count, 0.74);
        x = -0.58 + comet * 1.2 + (rand() - 0.5) * 0.18;
        y = Math.sin(comet * Math.PI * 2.0) * 0.24 + (rand() - 0.5) * 0.16;
        z = (rand() - 0.5) * (0.55 - comet * 0.22);
      }

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const c = base.clone();
      if (active.id === 'aurora') c.lerp(cyan, 0.45 + rand() * 0.35);
      if (active.id === 'moon' || active.id === 'future') c.lerp(gold, 0.38 + rand() * 0.32);
      c.lerp(white, rand() * 0.28);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
      sizes[i] = 0.018 + Math.pow(rand(), 2.0) * 0.07;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, [active.id, active.color]);

  useFrame(({ clock }) => {
    const g = groupRef.current;
    if (!g) return;
    const t = clock.getElapsedTime();
    g.rotation.z = Math.sin(t * 0.24) * 0.08;
    g.rotation.y = t * 0.055;
    const s = 1 + Math.sin(t * 1.1) * 0.025;
    g.scale.setScalar(s);
  });

  return three('group', { ref: groupRef, position: active.pos },
    h(Ribbon, { rx: 0.88, ry: 0.46, color: active.color, opacity: 0.42, rot: [0.35, 0.2, 0.12] }),
    h(Ribbon, { rx: 0.56, ry: 0.9, color: active.id === 'moon' ? '#fff0b8' : '#91fff0', opacity: 0.18, rot: [-0.65, 0.15, -0.4] }),
    three('points', { geometry },
      three('shaderMaterial', {
        vertexShader: pointVertex,
        fragmentShader: pointFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    )
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

function Scene({ nodes, active, select }: { nodes: OrbitNode[]; active: OrbitNode; select: (node: OrbitNode) => void }) {
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
      h(MemoryRitual, { active, key: active.id }),
      ...nodes.map((node) => h(NodeMesh, { key: node.id, node, active: active.id === node.id, select }))
    ),
    h(OrbitControls, { enablePan: false, enableDamping: true, dampingFactor: 0.07, rotateSpeed: 0.58, minDistance: 3.8, maxDistance: 9.5 })
  );
}

export function RomanceOrbitApp() {
  const nodes = useMemo(makeNodes, []);
  const [active, setActive] = useState(nodes[0]);
  const [query, setQuery] = useState('');
  const list = (query ? nodes.filter((n) => `${n.title}${n.subtitle}${n.note}`.includes(query)) : nodes).slice(0, 5);
  const detail = romanceDetails[active.id] ?? romanceDetails.first;

  return h('main', { className: 'romance-shell', style: { '--accent': active.color } as CSSProperties },
    h(Scene, { nodes, active, select: setActive }),
    h('div', { className: 'romance-vignette' }),
    h('section', { className: 'brand-float' },
      h('span', null, 'ROMANCE ORBIT'),
      h('h1', null, '极光玫瑰宇宙'),
      h('p', null, '点击一颗光点，不是读一段文字，而是打开一个专属的浪漫仪式。')
    ),
    h('section', { className: 'search-float' },
      h('input', { value: query, onChange: (e: any) => setQuery(e.target.value), placeholder: '搜索：玫瑰 / 月光 / 极光 / 未来' }),
      h('div', { className: 'memory-list' }, ...list.map((n) => h('button', { key: n.id, onClick: () => setActive(n), className: active.id === n.id ? 'is-active' : '' }, h('b', null, n.title), h('span', null, n.subtitle))))
    ),
    h('section', { className: 'detail-float' },
      h('span', { className: 'detail-kicker' }, detail.kicker),
      h('h2', null, active.title),
      h('p', null, active.subtitle),
      h('div', { className: 'ritual-card' },
        h('b', null, detail.title),
        h('span', null, detail.story)
      ),
      h('div', { className: 'ritual-lines' }, ...detail.moments.map((m) => h('em', { key: m }, m))),
      h('small', null, detail.promise),
      h('div', { className: 'tag-row' }, ...themeItems.map((item) => h('button', { key: item.id, style: { '--c': item.color } as CSSProperties }, item.title)))
    ),
    h('section', { className: 'hint-float' }, '拖动旋转 · 滚轮缩放 · 点击光点打开视觉仪式')
  );
}
