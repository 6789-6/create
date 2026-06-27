import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getRoseZone, type RoseNode } from '../../data/roseNebulaData';
import { RoundPointMaterial } from '../materials/RoundPointMaterial';
import { ROSE_SCENE } from '../roseSceneConfig';
import { createPointGeometry } from '../utils/geometry';
import { getNodePosition } from '../utils/positions';
import { smoothStep } from '../utils/random';

export function LocalMemoryField({ node }: { node: RoseNode }) {
  const zone = getRoseZone(node.zoneId);
  const ref = useRef<THREE.Group>(null);
  const age = useRef(0);

  useEffect(() => { age.current = 0; }, [node.id]);

  useFrame((_state, delta) => {
    age.current = Math.min(1, age.current + delta * 0.72);
    if (!ref.current) return;
    ref.current.scale.setScalar(0.12 + smoothStep(age.current) * 1.05);
    ref.current.rotation.y += delta * 0.08;
  });

  const geometry = useMemo(() => createPointGeometry(ROSE_SCENE.particles.localMemoryField, node.id.length * 1009, (_index, random) => {
    const angle = random() * Math.PI * 2;
    const radius = Math.pow(random(), 0.55) * 0.9;
    const position = new THREE.Vector3(Math.cos(angle) * radius, (random() - 0.5) * 0.46, Math.sin(angle) * radius * 0.7);
    const color = new THREE.Color(zone.color).lerp(new THREE.Color(zone.accent), random() * 0.75).lerp(new THREE.Color('#ffe7f0'), random() * 0.1);
    return { position, color };
  }), [node.id, zone.color, zone.accent]);

  return (
    <group ref={ref} position={getNodePosition(node)} rotation={[0.08, -0.25, 0.04]}>
      <points geometry={geometry}><RoundPointMaterial size={6.5} opacity={0.62} /></points>
      <mesh rotation={[0.4, 0.16, 0.22]}><torusGeometry args={[0.9, 0.008, 12, 160]} /><meshBasicMaterial color={zone.accent} transparent opacity={0.52} blending={THREE.AdditiveBlending} /></mesh>
      <pointLight color={zone.accent} intensity={1.8} distance={3} />
    </group>
  );
}
