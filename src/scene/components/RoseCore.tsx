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
  shape.moveTo(0, -0.42);
  shape.bezierCurveTo(-0.28, -0.22, -0.42, 0.22, 0, 0.52);
  shape.bezierCurveTo(0.42, 0.22, 0.28, -0.22, 0, -0.42);
  return new THREE.ShapeGeometry(shape, 28);
}

function createPetals(): Petal[] {
  const petals: Petal[] = [];
  const colors = ['#ff6da8', '#ff8bbd', '#ffc2d8', '#c95d92'];

  for (let layer = 0; layer < 5; layer += 1) {
    const count = 7 + layer * 3;
    const radius = 0.1 + layer * 0.15;
    const lift = layer * 0.01;

    for (let index = 0; index < count; index += 1) {
      const angle = (index / count) * Math.PI * 2 + layer * 0.46;
      const curl = 0.58 + layer * 0.12;
      petals.push({
        id: `${layer}-${index}`,
        position: [Math.cos(angle) * radius, lift + Math.sin(layer) * 0.012, Math.sin(angle) * radius * 0.72],
        rotation: [1.15 + layer * 0.12, -0.34 + Math.sin(angle) * 0.28, angle + curl],
        scale: [0.18 + layer * 0.045, 0.3 + layer * 0.07, 1],
        color: colors[(layer + index) % colors.length],
        opacity: 0.34 - layer * 0.025
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
    const breath = 1 + Math.sin(state.clock.elapsedTime * 0.75) * 0.018;
    ref.current.scale.setScalar(breath);
    ref.current.rotation.y += 0.0016;
  });

  return (
    <group ref={ref} rotation={[-0.18, 0.28, 0.08]}>
      <mesh>
        <sphereGeometry args={[0.32, 36, 36]} />
        <meshBasicMaterial color="#ff5f9d" transparent opacity={0.18} blending={THREE.NormalBlending} />
      </mesh>

      {petals.map((petal) => (
        <mesh key={petal.id} geometry={petalGeometry} position={petal.position} rotation={petal.rotation} scale={petal.scale}>
          <meshBasicMaterial color={petal.color} transparent opacity={petal.opacity} side={THREE.DoubleSide} depthWrite={false} blending={THREE.NormalBlending} />
        </mesh>
      ))}

      <mesh rotation={[0.85, 0.2, 0.05]}>
        <torusGeometry args={[0.74, 0.01, 12, 180]} />
        <meshBasicMaterial color="#ffd1e5" transparent opacity={0.28} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh rotation={[1.2, -0.38, 0.4]}>
        <torusGeometry args={[0.48, 0.008, 12, 150]} />
        <meshBasicMaterial color="#ff8bbd" transparent opacity={0.22} blending={THREE.AdditiveBlending} />
      </mesh>
      <pointLight color="#ff6da8" intensity={1.05} distance={3.2} />
    </group>
  );
}
