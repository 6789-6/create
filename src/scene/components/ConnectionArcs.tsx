import { createElement, useMemo } from 'react';
import * as THREE from 'three';
import { roseNodes, type RoseNode } from '../../data/roseNebulaData';
import { getNodePosition } from '../utils/positions';

const h = createElement;

export function ConnectionArcs({ active }: { active: RoseNode | null }) {
  const activeNode = active ?? null;

  const geometry = useMemo(() => {
    if (!activeNode) return new THREE.BufferGeometry();
    const start = getNodePosition(activeNode);
    const targets = roseNodes
      .filter((node) => node.id !== activeNode.id && node.zoneId === activeNode.zoneId)
      .slice(0, 5);
    const points: THREE.Vector3[] = [];

    targets.forEach((target) => {
      const end = getNodePosition(target);
      const mid = start.clone().lerp(end, 0.5).normalize().multiplyScalar(1.82);
      for (let index = 0; index <= 20; index += 1) {
        const t = index / 20;
        const a = start.clone().lerp(mid, t);
        const b = mid.clone().lerp(end, t);
        points.push(a.lerp(b, t));
      }
    });

    return new THREE.BufferGeometry().setFromPoints(points);
  }, [activeNode?.id]);

  return h('lineSegments', { geometry }, h('lineBasicMaterial', {
    color: '#ffc2d8',
    transparent: true,
    opacity: active ? 0.1 : 0,
    blending: THREE.AdditiveBlending
  }));
}
