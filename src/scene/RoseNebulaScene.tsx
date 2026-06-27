import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { roseNodes, type RoseNode } from '../data/roseNebulaData';
import { ROSE_SCENE } from './roseSceneConfig';
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
  const { controls } = ROSE_SCENE;

  useFrame(() => {
    if (ref.current && active) {
      ref.current.target.lerp(getNodePosition(active), controls.focusLerp);
      ref.current.update();
    }
  });

  return (
    <OrbitControls
      ref={ref}
      enableDamping
      dampingFactor={controls.dampingFactor}
      enablePan={false}
      minDistance={controls.minDistance}
      maxDistance={controls.maxDistance}
    />
  );
}

export function RoseNebulaScene({ active, onSelectNode }: { active: RoseNode | null; onSelectNode: (node: RoseNode) => void }) {
  return (
    <group>
      <ambientLight intensity={0.48} />
      <pointLight position={[3, 2.2, 4]} intensity={1.3} color={ROSE_SCENE.colors.roseSoft} />
      <pointLight position={[-4, -1, -2]} intensity={0.8} color={ROSE_SCENE.colors.violet} />
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
