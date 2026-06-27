import { useMemo } from 'react';
import * as THREE from 'three';
import { RoundPointMaterial } from '../materials/RoundPointMaterial';
import { ROSE_SCENE } from '../roseSceneConfig';
import { createPointGeometry } from '../utils/geometry';

export function BackgroundDust() {
  const geometry = useMemo(() => createPointGeometry(ROSE_SCENE.particles.backgroundDust, 4402, (_index, random) => {
    const angle = random() * Math.PI * 2;
    const distance = 18 + random() * 36;
    const y = (random() - 0.5) * 22;
    return {
      position: new THREE.Vector3(Math.cos(angle) * distance, y, Math.sin(angle) * distance),
      color: new THREE.Color(random() > 0.55 ? '#ffd7ec' : '#b67cff').lerp(new THREE.Color('#ffffff'), random() * 0.18)
    };
  }), []);

  return <points geometry={geometry}><RoundPointMaterial size={7.5} opacity={0.34} /></points>;
}
