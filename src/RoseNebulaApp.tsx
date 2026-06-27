import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { getRoseZone, roseNodes, roseZones, type RoseNode, type RoseZone } from './roseNebulaData';

const globeTilt = new THREE.Euler(-0.16, 0.28, 0.04);

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value += 0x6d2b79f5;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function smooth(t: number) {
  return t * t * (3 - 2 * t);
}

function nodePosition(node: RoseNode) {
  const zone = getRoseZone(node.zoneId);
  const y = zone.band + node.bandOffset;
  const flat = Math.sqrt(Math.max(0.2, 1 - y * y));
  const radius = zone.radius + node.radiusOffset;
  return new THREE.Vector3(
    Math.cos(node.theta) * radius * flat,
    y,
    Math.sin(node.theta) * radius * 0.72 * flat
  ).applyEuler(globeTilt);
}

function createPointGeometry(
  count: number,
  seed: number,
  maker: (index: number, random: () => number) => { position: THREE.Vector3; color: THREE.Color }
) {
  const random = seededRandom(seed);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    const point = maker(index, random);
    positions.set([point.position.x, point.position.y, point.position.z], index * 3);
    colors.set([point.color.r, point.color.g, point.color.b], index * 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geometry;
}

function BackgroundDust() {
  const geometry = useMemo(
    () => createPointGeometry(3200, 4402, (_index, random) => {
      const angle = random() * Math.PI * 2;
      const radius = 16 + random() * 42;
      const height = (random() - 0.5) * 24;
      const color = new THREE.Color(random() > 0.55 ? '#ffd7ec' : '#b67cff').lerp(new THREE.Color('#ffffff'), random() * 0.2);
      return { position: new THREE.Vector3(Math.cos(angle) * radius, height, Math.sin(angle) * radius), color };
    }),
    []
  );
  return (
    <points geometry={geometry}>
      <pointsMaterial size={0.035} transparent opacity={0.45} vertexColors depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

function RoseNebulaCloud() {
  const geometry = useMemo(
    () => createPointGeometry(26000, 9101, (_index, random) => {
      const zone = roseZones[Math.floor(random() * roseZones.length)];
      const theta = random() * Math.PI * 2;
      const shell = Math.pow(random(), 0.44);
      const y = zone.band + (random() - 0.5) * 0.2;
      const petalWave = Math.sin(theta * 5 + shell * 4.2) * 0.11;
      const radius = 0.18 + shell * (zone.radius + 0.52) + petalWave;
      const flat = Math.sqrt(Math.max(0.22, 1 - y * y));
      const position = new THREE.Vector3(
        Math.cos(theta) * radius * flat,
        y,
        Math.sin(theta) * radius * 0.72 * flat
      ).applyEuler(globeTilt);
      const color = new THREE.Color(zone.color).lerp(new THREE.Color(zone.accent), random() * 0.42).lerp(new THREE.Color('#ffffff'), random() * 0.1);
      return { position, color };
    }),
    []
  );
  return (
    <points geometry={geometry}>
      <pointsMaterial size={0.028} transparent opacity={0.64} vertexColors depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

function PetalDust() {
  const geometry = useMemo(
    () => createPointGeometry(850, 2239, (_index, random) => {
      const angle = random() * Math.PI * 2;
      const radius = 1.6 + Math.pow(random(), 0.65) * 2.3;
      const y = (random() - 0.5) * 2.8;
      const position = new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius * 0.74).applyEuler(globeTilt);
      const color = new THREE.Color(random() > 0.42 ? '#ff5f9d' : '#ffc2d8').lerp(new THREE.Color('#ffffff'), random() * 0.18);
      return { position, color };
    }),
    []
  );
  const ref = useRef<THREE.Points>(null);
  useFrame((_state, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.018;
  });
  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial size={0.07} transparent opacity={0.58} vertexColors depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

function RoseCore() {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const breath = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.025;
    ref.current.scale.setScalar(breath);
  });
  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[0.5, 56, 56]} />
        <meshBasicMaterial color="#ff6da8" transparent opacity={0.32} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh rotation={[0.7, 0.25, 0.1]}>
        <torusGeometry args={[0.52, 0.045, 20, 160]} />
        <meshBasicMaterial color="#ffd1e5" transparent opacity={0.34} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh rotation={[1.2, -0.38, 0.4]}>
        <torusGeometry args={[0.34, 0.035, 20, 140]} />
        <meshBasicMaterial color="#ff8bbd" transparent opacity={0.42} blending={THREE.AdditiveBlending} />
      </mesh>
      <pointLight color="#ff6da8" intensity={2.1} distance={4.8} />
    </group>
  );
}

function ZoneRing({ zone }: { zone: RoseZone }) {
  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let index = 0; index <= 280; index += 1) {
      const t = (index / 280) * Math.PI * 2;
      const y = zone.band;
      const flat = Math.sqrt(Math.max(0.22, 1 - y * y));
      points.push(new THREE.Vector3(Math.cos(t) * zone.radius * flat, y, Math.sin(t) * zone.radius * 0.72 * flat).applyEuler(globeTilt));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [zone]);
  return (
    <line geometry={geometry}>
      <lineBasicMaterial color={zone.accent} transparent opacity={0.24} blending={THREE.AdditiveBlending} />
    </line>
  );
}

function NebulaShell() {
  return (
    <group>
      <mesh rotation={[0.1, 0.1, 0]}>
        <sphereGeometry args={[1.85, 64, 64]} />
        <meshBasicMaterial color="#ffb4d0" transparent opacity={0.035} wireframe blending={THREE.AdditiveBlending} />
      </mesh>
      {roseZones.map((zone) => <ZoneRing key={zone.id} zone={zone} />)}
    </group>
  );
}

function ConnectionArcs({ active }: { active: RoseNode | null }) {
  const activeNode = active ?? roseNodes.find((node) => node.importance === 'core') ?? null;
  const geometry = useMemo(() => {
    if (!activeNode) return new THREE.BufferGeometry();
    const start = nodePosition(activeNode);
    const targets = roseNodes.filter((node) => node.id !== activeNode.id && (node.zoneId === activeNode.zoneId || node.importance !== 'normal')).slice(0, 10);
    const points: THREE.Vector3[] = [];
    targets.forEach((target) => {
      const end = nodePosition(target);
      const mid = start.clone().lerp(end, 0.5).normalize().multiplyScalar(2.18);
      for (let index = 0; index <= 34; index += 1) {
        const t = index / 34;
        const a = start.clone().lerp(mid, t);
        const b = mid.clone().lerp(end, t);
        points.push(a.lerp(b, t));
      }
    });
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [activeNode?.id]);
  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={active ? '#ffc2d8' : '#ff8bbd'} transparent opacity={active ? 0.36 : 0.18} blending={THREE.AdditiveBlending} />
    </lineSegments>
  );
}

function NodeOrb({ node, active, onClick }: { node: RoseNode; active: boolean; onClick: () => void }) {
  const position = nodePosition(node);
  const zone = getRoseZone(node.zoneId);
  const size = node.importance === 'core' ? 0.08 : node.importance === 'major' ? 0.056 : 0.034;
  const haloSize = active ? size * 3.6 : size * 2.0;
  return (
    <group position={position} onClick={(event) => { event.stopPropagation(); onClick(); }}>
      <mesh>
        <sphereGeometry args={[haloSize, 32, 32]} />
        <meshBasicMaterial color={zone.accent} transparent opacity={active ? 0.32 : 0.13} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial color={zone.color} emissive={zone.accent} emissiveIntensity={active ? 2.4 : node.importance === 'core' ? 1.6 : 0.9} roughness={0.24} metalness={0.08} />
      </mesh>
      {active && (
        <Html center distanceFactor={6.5} position={[0.16, 0.11, 0]}>
          <span className="node-label">{node.title}</span>
        </Html>
      )}
    </group>
  );
}

function LocalMemoryField({ node }: { node: RoseNode }) {
  const zone = getRoseZone(node.zoneId);
  const position = nodePosition(node);
  const ref = useRef<THREE.Group>(null);
  const age = useRef(0);
  useEffect(() => { age.current = 0; }, [node.id]);
  useFrame((_state, delta) => {
    age.current = Math.min(1, age.current + delta * 0.72);
    if (ref.current) {
      const scale = 0.12 + smooth(age.current) * 1.05;
      ref.current.scale.setScalar(scale);
      ref.current.rotation.y += delta * 0.08;
    }
  });
  const geometry = useMemo(
    () => createPointGeometry(3200, node.id.length * 1009, (_index, random) => {
      const angle = random() * Math.PI * 2;
      const radius = Math.pow(random(), 0.55) * 0.9;
      const point = new THREE.Vector3(Math.cos(angle) * radius, (random() - 0.5) * 0.46, Math.sin(angle) * radius * 0.7);
      const color = new THREE.Color(zone.color).lerp(new THREE.Color(zone.accent), random() * 0.75);
      return { position: point, color };
    }),
    [node.id, zone.color, zone.accent]
  );
  return (
    <group ref={ref} position={position} rotation={[0.08, -0.25, 0.04]}>
      <points geometry={geometry}>
        <pointsMaterial size={0.038} transparent opacity={0.84} vertexColors depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      <mesh rotation={[0.4, 0.16, 0.22]}>
        <torusGeometry args={[0.9, 0.008, 12, 160]} />
        <meshBasicMaterial color={zone.accent} transparent opacity={0.52} blending={THREE.AdditiveBlending} />
      </mesh>
      <pointLight color={zone.accent} intensity={1.8} distance={3} />
    </group>
  );
}

function CameraFocus({ active }: { active: RoseNode | null }) {
  const { camera } = useThree();
  const start = useRef(new THREE.Vector3());
  const end = useRef(new THREE.Vector3());
  const control = useRef(new THREE.Vector3());
  const time = useRef(1);
  const last = useRef('');
  useEffect(() => {
    if (!active || last.current === active.id) return;
    last.current = active.id;
    const target = nodePosition(active);
    start.current.copy(camera.position);
    end.current.copy(target.clone().normalize().multiplyScalar(2.78).add(target.clone().multiplyScalar(0.48)));
    control.current.copy(start.current.clone().lerp(end.current, 0.45).add(new THREE.Vector3(0, 0.9, 0.55)));
    time.current = 0;
  }, [active, camera]);
  useFrame((_state, delta) => {
    if (!active || time.current >= 1) return;
    time.current = Math.min(1, time.current + delta * 0.55);
    const t = smooth(time.current);
    const a = start.current.clone().lerp(control.current, t);
    const b = control.current.clone().lerp(end.current, t);
    camera.position.copy(a.lerp(b, t));
    camera.lookAt(nodePosition(active));
  });
  return null;
}

function Controls({ active }: { active: RoseNode | null }) {
  const ref = useRef<any>(null);
  useFrame(() => {
    if (ref.current && active) {
      ref.current.target.lerp(nodePosition(active), 0.08);
      ref.current.update();
    }
  });
  return <OrbitControls ref={ref} enableDamping dampingFactor={0.08} enablePan={false} minDistance={1.45} maxDistance={7.8} />;
}

function RoseScene({ active, setActive }: { active: RoseNode | null; setActive: (node: RoseNode) => void }) {
  return (
    <group>
      <ambientLight intensity={0.48} />
      <pointLight position={[3, 2.2, 4]} intensity={1.3} color="#ffd1e5" />
      <pointLight position={[-4, -1, -2]} intensity={0.8} color="#b779ff" />
      <BackgroundDust />
      <RoseNebulaCloud />
      <PetalDust />
      <RoseCore />
      <NebulaShell />
      <ConnectionArcs active={active} />
      {roseNodes.map((node) => (
        <NodeOrb key={node.id} node={node} active={active?.id === node.id} onClick={() => setActive(node)} />
      ))}
      {active && <LocalMemoryField node={active} />}
      <CameraFocus active={active} />
      <Controls active={active} />
    </group>
  );
}

function IconRail({ activeZone, onSelectZone }: { activeZone?: string; onSelectZone: (zone: RoseZone) => void }) {
  return (
    <nav className="rose-rail" aria-label="Rose Nebula navigation">
      {roseZones.map((zone) => (
        <button key={zone.id} className={activeZone === zone.id ? 'active' : ''} onClick={() => onSelectZone(zone)} title={zone.title}>
          <b>{zone.icon}</b>
          <span>{zone.title}</span>
        </button>
      ))}
    </nav>
  );
}

function DetailCard({ active, onRelive }: { active: RoseNode | null; onRelive: () => void }) {
  const zone = active ? getRoseZone(active.zoneId) : null;
  return (
    <aside className="rose-detail-card">
      <div className="detail-glow" />
      <header>
        <p>{active ? zone?.subtitle : 'SELECT A NODE'}</p>
        <h2>{active ? active.title : 'Rose Nebula'}</h2>
        <span>{active ? `${active.date} · ${active.location}` : 'an interactive memory universe'}</span>
      </header>
      <div className="detail-preview">
        <i />
        <strong>{active ? active.type.toUpperCase() : 'UNIVERSE'}</strong>
      </div>
      <p className="detail-text">
        {active
          ? active.description
          : '拖动旋转玫瑰星云，滚轮缩放，点击任意发光节点进入一段具体的浪漫记忆。'}
      </p>
      <div className="rose-tags">
        {(active ? active.tags : ['Rose', 'Memory', 'Orbit']).map((tag) => <span key={tag}>{tag}</span>)}
      </div>
      <button className="relive-button" onClick={onRelive}>{active ? 'Relive This Moment' : 'Start Exploring'}</button>
    </aside>
  );
}

export default function RoseNebulaApp() {
  const [active, setActive] = useState<RoseNode | null>(roseNodes.find((node) => node.id === 'first-date-0') ?? null);
  const activeZone = active ? getRoseZone(active.zoneId) : null;
  const coreCount = roseNodes.filter((node) => node.importance === 'core').length;

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActive(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const selectZone = (zone: RoseZone) => {
    const node = roseNodes.find((item) => item.zoneId === zone.id && item.importance === 'core') ?? roseNodes.find((item) => item.zoneId === zone.id);
    if (node) setActive(node);
  };

  return (
    <main className="rose-nebula-shell">
      <Canvas
        className="rose-canvas"
        camera={{ position: [0, 0.35, 5.2], fov: 45 }}
        dpr={[1, 1.65]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <RoseScene active={active} setActive={setActive} />
      </Canvas>

      <section className="rose-title">
        <div className="rose-logo">✿</div>
        <div>
          <p>ROSE NEBULA</p>
          <h1>玫瑰星云</h1>
          <span>an interactive memory universe</span>
        </div>
      </section>

      <IconRail activeZone={activeZone?.id} onSelectZone={selectZone} />

      <section className="rose-stats">
        <article><span>Memories</span><b>{roseNodes.length}</b></article>
        <article><span>Core</span><b>{coreCount}</b></article>
        <article><span>Stardust</span><b>4,820</b></article>
      </section>

      <DetailCard active={active} onRelive={() => active && setActive(active)} />

      <section className="rose-bottom-hint">
        <span>Drag to Rotate</span>
        <span>Scroll to Zoom</span>
        <span>Click a Node to Explore</span>
        <span>Esc to Overview</span>
      </section>
    </main>
  );
}
