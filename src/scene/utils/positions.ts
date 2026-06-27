import * as THREE from 'three';
import { getRoseZone, type RoseNode } from '../../data/roseNebulaData';

export const GLOBE_TILT = new THREE.Euler(-0.16, 0.28, 0.04);

export function getNodePosition(node: RoseNode) {
  const zone = getRoseZone(node.zoneId);
  const y = zone.band + node.bandOffset;
  const flat = Math.sqrt(Math.max(0.2, 1 - y * y));
  const radius = zone.radius + node.radiusOffset;

  return new THREE.Vector3(
    Math.cos(node.theta) * radius * flat,
    y,
    Math.sin(node.theta) * radius * 0.72 * flat
  ).applyEuler(GLOBE_TILT);
}
