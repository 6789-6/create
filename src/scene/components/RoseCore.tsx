import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type Petal = {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  opacity: number;
};

function createPetalGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, -0.28);
  shape.bezierCurveTo(-0.2, -0.12, -0.28, 0.14, 0, 0.34);
  shape.bezierCurveTo(0.28, 0.14, 0.2, -0.12, 0, -0.28);
  return new THREE.ShapeGeometry(shape, 24);
}

function createPetals(): Petal[] {
  const petals: Petal[] = [];
  const colors = ['#ff6da8', '#ff8bbd', '#ffb4d0', '#c95d92'];

  for (let layer = 0; layer < 4; layer += 1) {
    const count = 6 + layer * 3;
    const radius = 0.04 + layer * 0.085;
    const lift = layer * 0.006;

    for (let index = 0; index < count; index += 1) {
      const angle = (index / count) * Math.PI * 2 + layer * 0.42;
      const curl = 0.35 + layer * 0.08;
      petals.push({
        id: `${layer}-${index}`,
        position: [Math.cos(angle) * radius, lift, Math.sin(angle) * radius * 0.62],
        rotation: [1.08 + layer * 0.09, -0.18 + Math.sin(angle) * 0.16, angle + curl],
        scale: [0.12 + layer * 0.028, 0.2 + layer * 0.045, 1],
        color: colors[(layer + index) % colors.length],
        opacity: 0.3 - layer * 0.026
      });
    }
  }

  return petals;
}

export function RoseCore() {
  const ref = useRef<THREE.Group>(null);
  const petalGeometry = useMemo(createPetalGeometry, []);
  const petals = useMemo(createPetals, []);

  useFrame((state) => {
    if (!ref.current) return;
    const breath = 0.78 + Math.sin(state.clock.elapsedTime * 0.75) * 0.012;
    ref.current.scale.setScalar(breath);
    ref.current.rotation.y += 0.0012;
  });

  return (
    <group ref={ref} rotation={[-0.12, 0.22, 0.06]}>
      <mesh>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshBasicMaterial color="#ff5f9d" transparent opacity={0.14} blending={THREE.NormalBlending} />
      </mesh>

      {petals.map((petal) => (
        <mesh key={petal.id} geometry={petalGeometry} position={petal.position} rotation={petal.rotation} scale={petal.scale}>
          <meshBasicMaterial color={petal.color} transparent opacity={petal.opacity} side={THREE.DoubleSide} depthWrite={false} blending={THREE.NormalBlending} />
        </mesh>
      ))}

      <mesh rotation={[0.85, 0.2, 0.05]}>
        <torusGeometry args={[0.42, 0.006, 10, 150]} />
        <meshBasicMaterial color="#ffd1e5" transparent opacity={0.18} blending={THREE.AdditiveBlending} />
      </mesh>
      <pointLight color="#ff6da8" intensity={0.72} distance={2.5} />
    </group>
  );
}
