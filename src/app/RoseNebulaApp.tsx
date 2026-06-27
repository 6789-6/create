import { Canvas } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import { getRoseZone, roseNodes, roseZones, type RoseNode, type RoseZone } from '../data/roseNebulaData';
import { RoseNebulaScene } from '../scene/RoseNebulaScene';
import { BottomHint } from '../ui/BottomHint';
import { DetailCard } from '../ui/DetailCard';
import { RoseTitle } from '../ui/RoseTitle';
import { TopStats } from '../ui/TopStats';

function IconRail({ activeZoneId, onSelectZone }: { activeZoneId?: string; onSelectZone: (zone: RoseZone) => void }) {
  return (
    <nav className="rose-rail" aria-label="Rose Nebula navigation">
      {roseZones.map((zone) => (
        <button key={zone.id} className={activeZoneId === zone.id ? 'active' : ''} onClick={() => onSelectZone(zone)} title={zone.title}>
          <b>{zone.icon}</b>
          <span>{zone.title}</span>
        </button>
      ))}
    </nav>
  );
}

export default function RoseNebulaApp() {
  const [active, setActive] = useState<RoseNode | null>(roseNodes.find((node) => node.id === 'first-date-0') ?? null);
  const activeZone = active ? getRoseZone(active.zoneId) : null;
  const coreCount = roseNodes.filter((node) => node.importance === 'core').length;

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActive(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const selectZone = (zone: RoseZone) => {
    const node = roseNodes.find((item) => item.zoneId === zone.id && item.importance === 'core') ?? roseNodes.find((item) => item.zoneId === zone.id);
    if (node) setActive(node);
  };

  return (
    <main className="rose-nebula-shell">
      <Canvas
        className="rose-canvas"
        camera={{ position: [0, 0.35, 5.2], fov: 45 }}
        dpr={[1, 1.65]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <RoseNebulaScene active={active} onSelectNode={setActive} />
      </Canvas>

      <RoseTitle />
      <IconRail activeZoneId={activeZone?.id} onSelectZone={selectZone} />
      <TopStats memories={roseNodes.length} core={coreCount} />
      <DetailCard active={active} onRelive={() => active && setActive(active)} />
      <BottomHint />
    </main>
  );
}
