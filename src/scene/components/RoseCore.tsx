import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function RoseCore() {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const scale = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.025;
    ref.current.scale.setScalar(scale);
  });

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[0.5, 56, 56]} />
        <meshBasicMaterial color="#ff6da8" transparent opacity={0.32} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh rotation={[0.7, 0.25, 0.1]}>
        <torusGeometry args={[0.52, 0.045, 20, 160]} />
        <meshBasicMaterial color="#ffd1e5" transparent opacity={0.34} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh rotation={[1.2, -0.38, 0.4]}>
        <torusGeometry args={[0.34, 0.035, 20, 140]} />
        <meshBasicMaterial color="#ff8bbd" transparent opacity={0.42} blending={THREE.AdditiveBlending} />
      </mesh>
      <pointLight color="#ff6da8" intensity={2.1} distance={4.8} />
    </group>
  );
}
