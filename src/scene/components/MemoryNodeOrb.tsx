import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { getRoseZone, type RoseNode } from '../../data/roseNebulaData';
import { getNodePosition } from '../utils/positions';

export function MemoryNodeOrb(props: { node: RoseNode; active: boolean; onSelect: () => void }) {
  const { node, active, onSelect } = props;
  const position = getNodePosition(node);
  const zone = getRoseZone(node.zoneId);
  const size = node.importance === 'core' ? 0.052 : node.importance === 'major' ? 0.038 : 0.025;

  return (
    <group position={position} onClick={(event) => { event.stopPropagation(); onSelect(); }}>
      <mesh>
        <sphereGeometry args={[active ? size * 3.1 : size * 1.5, 24, 24]} />
        <meshBasicMaterial color={zone.accent} transparent opacity={active ? 0.22 : 0.055} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[size, 24, 24]} />
        <meshStandardMaterial color={zone.color} emissive={zone.accent} emissiveIntensity={active ? 1.35 : 0.55} roughness={0.36} metalness={0.04} />
      </mesh>
      {active ? <Html center distanceFactor={8.2} position={[0.12, 0.08, 0]}><span className="node-label">{node.title}</span></Html> : null}
    </group>
  );
}
