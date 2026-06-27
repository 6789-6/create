import { useMemo } from 'react';
import * as THREE from 'three';
import { roseZones, type RoseZone } from '../../data/roseNebulaData';
import { GLOBE_TILT } from '../utils/positions';

function ZoneRing({ zone }: { zone: RoseZone }) {
  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let index = 0; index <= 280; index += 1) {
      const t = (index / 280) * Math.PI * 2;
      const y = zone.band;
      const flat = Math.sqrt(Math.max(0.22, 1 - y * y));
      points.push(new THREE.Vector3(Math.cos(t) * zone.radius * flat, y, Math.sin(t) * zone.radius * 0.72 * flat).applyEuler(GLOBE_TILT));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [zone]);

  return <line geometry={geometry}><lineBasicMaterial color={zone.accent} transparent opacity={0.24} blending={THREE.AdditiveBlending} /></line>;
}

export function NebulaShell() {
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
