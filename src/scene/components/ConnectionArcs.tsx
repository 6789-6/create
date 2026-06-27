import { useMemo } from 'react';
import * as THREE from 'three';
import { roseNodes, type RoseNode } from '../../data/roseNebulaData';
import { getNodePosition } from '../utils/positions';

export function ConnectionArcs({ active }: { active: RoseNode | null }) {
  const activeNode = active ?? roseNodes.find((node) => node.importance === 'core') ?? null;

  const geometry = useMemo(() => {
    if (!activeNode) return new THREE.BufferGeometry();
    const start = getNodePosition(activeNode);
    const targets = roseNodes
      .filter((node) => node.id !== activeNode.id && (node.zoneId === activeNode.zoneId || node.importance !== 'normal'))
      .slice(0, 10);
    const points: THREE.Vector3[] = [];

    targets.forEach((target) => {
      const end = getNodePosition(target);
      const mid = start.clone().lerp(end, 0.5).normalize().multiplyScalar(2.18);
      for (let index = 0; index <= 34; index += 1) {
        const t = index / 34;
        const a = start.clone().lerp(mid, t);
        const b = mid.clone().lerp(end, t);
        points.push(a.lerp(b, t));
      }
    });

    return new THREE.BufferGeometry().setFromPoints(points);
  }, [activeNode?.id]);

  return <lineSegments geometry={geometry}><lineBasicMaterial color={active ? '#ffc2d8' : '#ff8bbd'} transparent opacity={active ? 0.36 : 0.18} blending={THREE.AdditiveBlending} /></lineSegments>;
}
