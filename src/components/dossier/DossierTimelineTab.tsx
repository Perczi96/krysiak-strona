import type { DossierTimelineEvent } from '@/types/dossier';

export function DossierTimelineTab({ timeline }: { timeline: DossierTimelineEvent[] }) {
  if (timeline.length === 0) {
    return <div className="rounded-lg border border-[#2a313d] bg-[#10141a]/45 p-6 text-sm text-muted">Oś czasu nie została jeszcze uzupełniona.</div>;
  }
  const sorted = [...timeline].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  return (
    <div className="relative ml-2 border-l border-[#3a4352] pl-6 sm:pl-8">
      {sorted.map((e, idx) => (
        <div key={e.id} className="relative pb-8 last:pb-0">
          <span className={`absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-2 ${idx === 0 ? 'border-accent bg-accent shadow-[0_0_0_4px_rgba(217,45,32,0.15)]' : 'border-[#3a4352] bg-[#14171D]'}`} />
          <p className="font-mono text-xs tabular-nums tracking-wide text-gold">{e.date || '—'}</p>
          <h3 className="mt-1 text-base font-display font-bold text-ink">{e.title}</h3>
          {e.description && <p className="mt-2 text-sm leading-relaxed text-muted whitespace-pre-wrap">{e.description}</p>}
        </div>
      ))}
    </div>
  );
}
