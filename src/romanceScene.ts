import { CSSProperties, createElement, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { themeItems } from './themeData';
import { nodeSeeds, OrbitNode } from './romanceCore';

const h = createElement;
const three = (tag: string, props?: any, ...children: any[]) => h(tag as any, props, ...children);

function heart(t: number, scale = 0.16) {
  const x = 16 * Math.pow(Math.sin(t), 3) * scale;
  const y = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * scale - 0.25;
  return new THREE.Vector3(x, y, 0);
}

function makeNodes(): OrbitNode[] {
  return nodeSeeds.map(([id, title, subtitle, color, note], i) => {
    const t = i / nodeSeeds.length * Math.PI * 2 + 0.25;
    const p = heart(t, 0.18 + (i % 3) * 0.012);
    p.z = Math.sin(t * 2.2) * 0.72;
    return { id, title, subtitle, color, note, pos: [p.x, p.y, p.z] };
  });
}

function PointsCloud() {
  const positions = useMemo(() => {
    const count = 6800;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = Math.random() * Math.PI * 2;
      const layer = 0.42 + Math.pow(Math.random(), 0.64) * 0.9;
      const p = heart(t, 0.15 * layer);
      p.x += (Math.random() - 0.5) * 0.42;
      p.y += (Math.random() - 0.5) * 0.34;
      p.z = Math.sin(t * 3.2) * 0.28 + (Math.random() - 0.5) * 1.35;
      arr[i * 3] = p.x;
      arr[i * 3 + 1] = p.y;
      arr[i * 3 + 2] = p.z;
    }
    return arr;
  }, []);
  return three('points', null,
    three('bufferGeometry', null, three('bufferAttribute', { attach: 'attributes-position', args: [positions, 3] })),
    three('pointsMaterial', { size: 0.018, color: '#ff9ed6', transparent: true, opacity: 0.62, depthWrite: false, blending: THREE.AdditiveBlending })
  );
}

function DeepStars() {
  const positions = useMemo(() => {
    const arr = new Float32Array(1100 * 3);
    for (let i = 0; i < 1100; i++) {
      const r = 12 + Math.random() * 21;
      const a = Math.random() * Math.PI * 2;
      const b = Math.acos(Math.random() * 2 - 1);
      arr[i * 3] = Math.sin(b) * Math.cos(a) * r;
      arr[i * 3 + 1] = Math.cos(b) * r;
      arr[i * 3 + 2] = Math.sin(b) * Math.sin(a) * r;
    }
    return arr;
  }, []);
  return three('points', null,
    three('bufferGeometry', null, three('bufferAttribute', { attach: 'attributes-position', args: [positions, 3] })),
    three('pointsMaterial', { size: 0.024, color: '#fff2dd', transparent: true, opacity: 0.38, depthWrite: false })
  );
}

function Ring({ rx, ry, color, rot = [0, 0, 0], opacity = 0.25 }: { rx: number; ry: number; color: string; rot?: [number, number, number]; opacity?: number }) {
  const geometry = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 220; i++) {
      const t = i / 220 * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(t) * rx, Math.sin(t) * ry, Math.sin(t * 2) * 0.08));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [rx, ry]);
  return three('line', { geometry, rotation: rot }, three('lineBasicMaterial', { color, transparent: true, opacity, blending: THREE.AdditiveBlending }));
}

function NodeMesh({ node, active, select }: { node: OrbitNode; active: boolean; select: (node: OrbitNode) => void }) {
  return three('group', { position: node.pos },
    three('mesh', { onClick: (event: any) => { event.stopPropagation(); select(node); } },
      three('sphereGeometry', { args: [active ? 0.16 : 0.105, 32, 32] }),
      three('meshBasicMaterial', { color: node.color, transparent: true, opacity: active ? 1 : 0.86 })
    ),
    three('mesh', { scale: active ? 2.3 : 1.55 },
      three('sphereGeometry', { args: [active ? 0.16 : 0.105, 32, 32] }),
      three('meshBasicMaterial', { color: node.color, transparent: true, opacity: active ? 0.22 : 0.09, depthWrite: false, blending: THREE.AdditiveBlending })
    ),
    active ? h(Html, { className: 'node-label', distanceFactor: 8, position: [0, 0.34, 0], center: true }, h('span', null, node.title)) : null
  );
}

function Scene({ nodes, active, select }: { nodes: OrbitNode[]; active: OrbitNode; select: (node: OrbitNode) => void }) {
  return h(Canvas, { camera: { position: [0, 0.35, 7.4], fov: 42 }, dpr: [1, 1.7] },
    three('color', { attach: 'background', args: ['#05010e'] }),
    three('ambientLight', { intensity: 0.95 }),
    h(DeepStars),
    three('group', { rotation: [-0.08, -0.2, 0] },
      h(PointsCloud),
      h(Ring, { rx: 3.05, ry: 2.0, color: '#ff8aca', opacity: 0.32, rot: [0.15, 0, 0.1] }),
      h(Ring, { rx: 3.45, ry: 2.26, color: '#91fff0', opacity: 0.14, rot: [-0.55, 0, -0.12] }),
      h(Ring, { rx: 2.35, ry: 1.46, color: '#fff0b8', opacity: 0.18, rot: [0.85, 0.15, 0.4] }),
      ...nodes.map((node) => h(NodeMesh, { key: node.id, node, active: active.id === node.id, select }))
    ),
    h(OrbitControls, { enablePan: false, enableDamping: true, dampingFactor: 0.06, rotateSpeed: 0.62, minDistance: 4.2, maxDistance: 10.5 })
  );
}

export function RomanceOrbitApp() {
  const nodes = useMemo(makeNodes, []);
  const [active, setActive] = useState(nodes[0]);
  const [query, setQuery] = useState('');
  const list = (query ? nodes.filter((n) => `${n.title}${n.subtitle}`.includes(query)) : nodes).slice(0, 6);
  return h('main', { className: 'romance-shell', style: { '--accent': active.color } as CSSProperties },
    h(Scene, { nodes, active, select: setActive }),
    h('div', { className: 'aurora-bg' }),
    h('section', { className: 'floating-title' }, h('span', null, 'ROMANCE ORBIT'), h('h1', null, '极光玫瑰宇宙'), h('p', null, '稳定旋转的 3D 浪漫星体，点开光点进入细节层。')),
    h('section', { className: 'floating-search' }, h('input', { value: query, onChange: (e: any) => setQuery(e.target.value), placeholder: '搜索：玫瑰 / 月光 / 极光 / 未来' }), h('div', null, ...list.map((n) => h('button', { key: n.id, onClick: () => setActive(n) }, h('b', null, n.title), h('span', null, n.subtitle))))),
    h('section', { className: 'memory-card' }, h('span', { className: 'card-kicker' }, active.id.toUpperCase()), h('h2', null, active.title), h('p', null, active.subtitle), h('small', null, active.note)),
    h('section', { className: 'romance-dock' }, ...themeItems.map((item) => h('button', { key: item.id, style: { '--c': item.color } as CSSProperties }, item.title)))
  );
}
