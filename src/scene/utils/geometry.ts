import * as THREE from 'three';
import { seededRandom } from './random';

export type PointFactoryResult = {
  position: THREE.Vector3;
  color: THREE.Color;
};

export function createPointGeometry(
  count: number,
  seed: number,
  maker: (index: number, random: () => number) => PointFactoryResult
) {
  const random = seededRandom(seed);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const point = maker(index, random);
    positions.set([point.position.x, point.position.y, point.position.z], index * 3);
    colors.set([point.color.r, point.color.g, point.color.b], index * 3);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geometry;
}
