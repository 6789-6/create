import { useMemo } from 'react';
import * as THREE from 'three';

type CrystalPetal = {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  opacity: number;
};

function createCrystalPetals(): CrystalPetal[] {
  const petals: CrystalPetal[] = [];
  const palette = ['#ff8fbd', '#ffc3da', '#f7a5c8', '#d985ae'];
  const layers = [
    { count: 8, radius: 0.12, scale: [0.12, 0.28, 0.08] as [number, number, number], tilt: 0.72, y: 0.025, opacity: 0.78 },
    { count: 12, radius: 0.22, scale: [0.14, 0.34, 0.09] as [number, number, number], tilt: 0.92, y: 0.005, opacity: 0.62 },
    { count: 16, radius: 0.32, scale: [0.16, 0.42, 0.1] as [number, number, number], tilt: 1.08, y: -0.02, opacity: 0.46 }
  ];

  layers.forEach((layer, layerIndex) => {
    for (let index = 0; index < layer.count; index += 1) {
      const angle = (index / layer.count) * Math.PI * 2 + layerIndex * 0.22;
      petals.push({
        id: `${layerIndex}-${index}`,
        position: [Math.cos(angle) * layer.radius, layer.y, Math.sin(angle) * layer.radius * 0.78],
        rotation: [layer.tilt, angle, -0.2 + Math.sin(angle) * 0.18],
        scale: layer.scale,
        color: palette[(index + layerIndex) % palette.length],
        opacity: layer.opacity
      });
    }
  });

  return petals;
}

export function RoseCore() {
  const petals = useMemo(createCrystalPetals, []);

  return (
    <group position={[0, 0, 0]} rotation={[-0.1, 0.18, 0.05]}>
      <mesh>
        <sphereGeometry args={[0.82, 48, 48]} />
        <meshPhysicalMaterial
          color="#f8c2d7"
          roughness={0.06}
          metalness={0.02}
          transmission={0.88}
          thickness={0.45}
          transparent
          opacity={0.1}
          depthWrite={false}
        />
      </mesh>

      <mesh scale={[0.88, 0.88, 0.88]}>
        <icosahedronGeometry args={[0.72, 2]} />
        <meshPhysicalMaterial
          color="#ffdce8"
          roughness={0.18}
          metalness={0.04}
          transmission={0.42}
          thickness={0.2}
          transparent
          opacity={0.08}
          depthWrite={false}
        />
      </mesh>

      {petals.map((petal) => (
        <mesh key={petal.id} position={petal.position} rotation={petal.rotation} scale={petal.scale}>
          <sphereGeometry args={[1, 18, 18]} />
          <meshPhysicalMaterial
            color={petal.color}
            roughness={0.18}
            metalness={0.06}
            clearcoat={1}
            clearcoatRoughness={0.18}
            transmission={0.18}
            thickness={0.12}
            transparent
            opacity={petal.opacity}
          />
        </mesh>
      ))}

      <mesh>
        <sphereGeometry args={[0.23, 32, 32]} />
        <meshPhysicalMaterial
          color="#ff6da8"
          emissive="#ff4d93"
          emissiveIntensity={0.72}
          roughness={0.12}
          metalness={0.08}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>

      <mesh scale={[1, 0.74, 1]} rotation={[0.42, 0.14, -0.28]}>
        <torusGeometry args={[0.38, 0.012, 12, 100]} />
        <meshBasicMaterial color="#ffd6e4" transparent opacity={0.22} />
      </mesh>

      <pointLight color="#ff79ad" intensity={0.9} distance={2.8} />
    </group>
  );
}
