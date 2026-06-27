import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { getRoseZone, type RoseNode } from '../../data/roseNebulaData';
import { getNodePosition } from '../utils/positions';

export function MemoryNodeOrb(props: { node: RoseNode; active: boolean; onSelect: () => void }) {
  const { node, active, onSelect } = props;
  const position = getNodePosition(node);
  const zone = getRoseZone(node.zoneId);
  const size = node.importance === 'core' ? 0.08 : node.importance === 'major' ? 0.056 : 0.034;

  return (
    <group position={position} onClick={(event) => { event.stopPropagation(); onSelect(); }}>
      <mesh>
        <sphereGeometry args={[active ? size * 3.6 : size * 2, 32, 32]} />
        <meshBasicMaterial color={zone.accent} transparent opacity={active ? 0.32 : 0.13} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial color={zone.color} emissive={zone.accent} emissiveIntensity={active ? 2.4 : 1.1} roughness={0.24} metalness={0.08} />
      </mesh>
      {active ? <Html center distanceFactor={6.5} position={[0.16, 0.11, 0]}><span className="node-label">{node.title}</span></Html> : null}
    </group>
  );
}
