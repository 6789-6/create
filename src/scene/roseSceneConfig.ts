export const ROSE_SCENE = {
  camera: {
    position: [0, 0.35, 5.2] as [number, number, number],
    fov: 45,
    dpr: [1, 1.65] as [number, number]
  },
  particles: {
    backgroundDust: 2400,
    nebulaCloud: 26000,
    petalField: 850,
    localMemoryField: 3200
  },
  controls: {
    minDistance: 1.45,
    maxDistance: 7.8,
    dampingFactor: 0.08,
    focusLerp: 0.08
  },
  colors: {
    rose: '#ff6da8',
    roseSoft: '#ffd1e5',
    roseDeep: '#ff5f9d',
    violet: '#b779ff',
    shell: '#ffb4d0'
  }
};
