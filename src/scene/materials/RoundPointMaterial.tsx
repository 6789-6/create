import { useMemo } from 'react';
import * as THREE from 'three';

const vertexShader = `
  attribute vec3 color;
  varying vec3 vColor;
  uniform float uSize;

  void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    float perspective = 1.35 / max(1.25, -mvPosition.z);
    gl_PointSize = clamp(uSize * perspective, 1.0, uSize * 1.35);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  uniform float uOpacity;

  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float distanceToCenter = length(center);
    float alpha = (1.0 - smoothstep(0.18, 0.5, distanceToCenter)) * uOpacity;

    if (alpha < 0.02) discard;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

export function RoundPointMaterial({ size, opacity }: { size: number; opacity: number }) {
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uSize: { value: size },
      uOpacity: { value: opacity }
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.NormalBlending
  }), [size, opacity]);

  return <primitive attach="material" object={material} />;
}
