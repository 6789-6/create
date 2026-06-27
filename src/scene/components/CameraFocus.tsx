import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { RoseNode } from '../../data/roseNebulaData';
import { getNodePosition } from '../utils/positions';
import { smoothStep } from '../utils/random';

export function CameraFocus({ active }: { active: RoseNode | null }) {
  const { camera } = useThree();
  const start = useRef(new THREE.Vector3());
  const end = useRef(new THREE.Vector3());
  const control = useRef(new THREE.Vector3());
  const time = useRef(1);
  const last = useRef('');

  useEffect(() => {
    if (!active || last.current === active.id) return;
    last.current = active.id;
    const target = getNodePosition(active);
    start.current.copy(camera.position);
    end.current.copy(target.clone().normalize().multiplyScalar(2.78).add(target.clone().multiplyScalar(0.48)));
    control.current.copy(start.current.clone().lerp(end.current, 0.45).add(new THREE.Vector3(0, 0.9, 0.55)));
    time.current = 0;
  }, [active, camera]);

  useFrame((_state, delta) => {
    if (!active || time.current >= 1) return;
    time.current = Math.min(1, time.current + delta * 0.55);
    const t = smoothStep(time.current);
    const a = start.current.clone().lerp(control.current, t);
    const b = control.current.clone().lerp(end.current, t);
    camera.position.copy(a.lerp(b, t));
    camera.lookAt(getNodePosition(active));
  });

  return null;
}
