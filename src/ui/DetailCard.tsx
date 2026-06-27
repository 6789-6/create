import { getRoseZone, type RoseNode } from '../data/roseNebulaData';

export function DetailCard({ active, onRelive }: { active: RoseNode | null; onRelive: () => void }) {
  const zone = active ? getRoseZone(active.zoneId) : null;

  return (
    <aside className="rose-detail-card">
      <div className="detail-glow" />
      <header>
        <p>{active ? zone?.subtitle : 'SELECT A NODE'}</p>
        <h2>{active ? active.title : 'Rose Nebula'}</h2>
        <span>{active ? `${active.date} · ${active.location}` : 'an interactive memory universe'}</span>
      </header>
      <div className="detail-preview">
        <i />
        <strong>{active ? active.type.toUpperCase() : 'UNIVERSE'}</strong>
      </div>
      <p className="detail-text">
        {active ? active.description : '拖动旋转玫瑰星云，滚轮缩放，点击任意发光节点进入一段具体的浪漫记忆。'}
      </p>
      <div className="rose-tags">
        {(active ? active.tags : ['Rose', 'Memory', 'Orbit']).map((tag) => <span key={tag}>{tag}</span>)}
      </div>
      <button className="relive-button" onClick={onRelive}>{active ? 'Relive This Moment' : 'Start Exploring'}</button>
    </aside>
  );
}
