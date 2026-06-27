import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createPointGeometry } from '../utils/geometry';
import { GLOBE_TILT } from '../utils/positions';

export function PetalField() {
  const ref = useRef<THREE.Points>(null);
  const geometry = useMemo(() => createPointGeometry(850, 2239, (_index, random) => {
    const angle = random() * Math.PI * 2;
    const radius = 1.6 + Math.pow(random(), 0.65) * 2.3;
    const y = (random() - 0.5) * 2.8;
    const position = new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius * 0.74).applyEuler(GLOBE_TILT);
    const color = new THREE.Color(random() > 0.42 ? '#ff5f9d' : '#ffc2d8');
    return { position, color };
  }), []);

  useFrame((_state, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.018;
  });

  return <points ref={ref} geometry={geometry}><pointsMaterial size={0.07} transparent opacity={0.58} vertexColors depthWrite={false} blending={THREE.AdditiveBlending} /></points>;
}
