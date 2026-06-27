import { useMemo } from 'react';
import * as THREE from 'three';
import { roseZones } from '../../data/roseNebulaData';
import { RoundPointMaterial } from '../materials/RoundPointMaterial';
import { ROSE_SCENE } from '../roseSceneConfig';
import { createPointGeometry } from '../utils/geometry';
import { GLOBE_TILT } from '../utils/positions';

export function RoseNebulaCloud() {
  const geometry = useMemo(() => createPointGeometry(ROSE_SCENE.particles.nebulaCloud, 9101, (_index, random) => {
    const zone = roseZones[Math.floor(random() * roseZones.length)];
    const theta = random() * Math.PI * 2;
    const shell = Math.pow(random(), 0.44);
    const y = zone.band + (random() - 0.5) * 0.2;
    const wave = Math.sin(theta * 5 + shell * 4.2) * 0.11;
    const radius = 0.18 + shell * (zone.radius + 0.52) + wave;
    const flat = Math.sqrt(Math.max(0.22, 1 - y * y));
    const position = new THREE.Vector3(Math.cos(theta) * radius * flat, y, Math.sin(theta) * radius * 0.72 * flat).applyEuler(GLOBE_TILT);
    const color = new THREE.Color(zone.color).lerp(new THREE.Color(zone.accent), random() * 0.55).lerp(new THREE.Color('#ffe7f0'), random() * 0.08);
    return { position, color };
  }), []);

  return <points geometry={geometry}><RoundPointMaterial size={5.2} opacity={0.52} /></points>;
}
