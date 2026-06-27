import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RoundPointMaterial } from '../materials/RoundPointMaterial';
import { ROSE_SCENE } from '../roseSceneConfig';
import { createPointGeometry } from '../utils/geometry';
import { GLOBE_TILT } from '../utils/positions';

export function PetalField() {
  const ref = useRef<THREE.Points>(null);
  const geometry = useMemo(() => createPointGeometry(ROSE_SCENE.particles.petalField, 2239, (_index, random) => {
    const angle = random() * Math.PI * 2;
    const radius = 1.6 + Math.pow(random(), 0.65) * 2.3;
    const y = (random() - 0.5) * 2.8;
    const position = new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius * 0.74).applyEuler(GLOBE_TILT);
    const color = new THREE.Color(random() > 0.42 ? '#ff5f9d' : '#ffc2d8').lerp(new THREE.Color('#ffe7f0'), random() * 0.15);
    return { position, color };
  }), []);

  useFrame((_state, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.018;
  });

  return <points ref={ref} geometry={geometry}><RoundPointMaterial size={12} opacity={0.36} /></points>;
}
