import { useMemo } from 'react';
import * as THREE from 'three';

const vertexShader = `
  attribute vec3 color;
  varying vec3 vColor;
  uniform float uSize;
  uniform float uScale;

  void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * (uScale / max(0.8, -mvPosition.z));
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  uniform float uOpacity;

  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float distanceToCenter = length(center);
    float softCircle = 1.0 - smoothstep(0.18, 0.5, distanceToCenter);
    float core = 1.0 - smoothstep(0.0, 0.22, distanceToCenter);
    float alpha = (softCircle * 0.72 + core * 0.28) * uOpacity;

    if (alpha < 0.012) discard;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

export function RoundPointMaterial({ size, opacity }: { size: number; opacity: number }) {
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uSize: { value: size },
      uScale: { value: 360 },
      uOpacity: { value: opacity }
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  }), [size, opacity]);

  return <primitive attach="material" object={material} />;
}
