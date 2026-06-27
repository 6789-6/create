export function TopStats({ memories, core }: { memories: number; core: number }) {
  return (
    <section className="rose-stats">
      <article><span>Memories</span><b>{memories}</b></article>
      <article><span>Core</span><b>{core}</b></article>
      <article><span>Stardust</span><b>4,820</b></article>
    </section>
  );
}
