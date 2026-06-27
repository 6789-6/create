import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { roseNodes, type RoseNode } from '../data/roseNebulaData';
import { BackgroundDust } from './components/BackgroundDust';
import { CameraFocus } from './components/CameraFocus';
import { ConnectionArcs } from './components/ConnectionArcs';
import { LocalMemoryField } from './components/LocalMemoryField';
import { MemoryNodeOrb } from './components/MemoryNodeOrb';
import { NebulaShell } from './components/NebulaShell';
import { PetalField } from './components/PetalField';
import { RoseCore } from './components/RoseCore';
import { RoseNebulaCloud } from './components/RoseNebulaCloud';
import { getNodePosition } from './utils/positions';

function Controls({ active }: { active: RoseNode | null }) {
  const ref = useRef<any>(null);
  useFrame(() => {
    if (ref.current && active) {
      ref.current.target.lerp(getNodePosition(active), 0.08);
      ref.current.update();
    }
  });
  return <OrbitControls ref={ref} enableDamping dampingFactor={0.08} enablePan={false} minDistance={1.45} maxDistance={7.8} />;
}

export function RoseNebulaScene({ active, onSelectNode }: { active: RoseNode | null; onSelectNode: (node: RoseNode) => void }) {
  return (
    <group>
      <ambientLight intensity={0.48} />
      <pointLight position={[3, 2.2, 4]} intensity={1.3} color="#ffd1e5" />
      <pointLight position={[-4, -1, -2]} intensity={0.8} color="#b779ff" />
      <BackgroundDust />
      <RoseNebulaCloud />
      <PetalField />
      <RoseCore />
      <NebulaShell />
      <ConnectionArcs active={active} />
      {roseNodes.map((node) => (
        <MemoryNodeOrb key={node.id} node={node} active={active?.id === node.id} onSelect={() => onSelectNode(node)} />
      ))}
      {active ? <LocalMemoryField node={active} /> : null}
      <CameraFocus active={active} />
      <Controls active={active} />
    </group>
  );
}
