import { useMemo } from 'react';
import * as THREE from 'three';
import { roseZones } from '../../data/roseNebulaData';
import { createPointGeometry } from '../utils/geometry';
import { GLOBE_TILT } from '../utils/positions';

export function RoseNebulaCloud() {
  const geometry = useMemo(() => createPointGeometry(26000, 9101, (_index, random) => {
    const zone = roseZones[Math.floor(random() * roseZones.length)];
    const theta = random() * Math.PI * 2;
    const shell = Math.pow(random(), 0.44);
    const y = zone.band + (random() - 0.5) * 0.2;
    const wave = Math.sin(theta * 5 + shell * 4.2) * 0.11;
    const radius = 0.18 + shell * (zone.radius + 0.52) + wave;
    const flat = Math.sqrt(Math.max(0.22, 1 - y * y));
    const position = new THREE.Vector3(Math.cos(theta) * radius * flat, y, Math.sin(theta) * radius * 0.72 * flat).applyEuler(GLOBE_TILT);
    const color = new THREE.Color(zone.color).lerp(new THREE.Color(zone.accent), random() * 0.42).lerp(new THREE.Color('#ffffff'), random() * 0.1);
    return { position, color };
  }), []);

  return <points geometry={geometry}><pointsMaterial size={0.028} transparent opacity={0.64} vertexColors depthWrite={false} blending={THREE.AdditiveBlending} /></points>;
}
