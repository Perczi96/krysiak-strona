import type { DossierTimelineEvent } from '@/types/dossier';

export function DossierTimelineTab({ timeline }: { timeline: DossierTimelineEvent[] }) {
  if (timeline.length === 0) {
    return <div className="rounded-xl border border-[#D5CBB7] bg-[#F6F1E6] p-6 text-sm text-[#3A3D45]">Oś czasu nie została jeszcze uzupełniona.</div>;
  }
  const sorted = [...timeline].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  return (
    <div className="relative ml-2 border-l-2 border-[#BFB49E] pl-6 sm:pl-8">
      {sorted.map((e, idx) => (
        <div key={e.id} className="relative pb-8 last:pb-0">
          <span className={`absolute -left-[32px] top-1.5 h-3.5 w-3.5 rounded-full border-2 ${idx === 0 ? 'border-[#B91C1C] bg-[#B91C1C] shadow-[0_0_0_4px_rgba(185,28,28,0.12)]' : 'border-[#7D786D] bg-[#EFE9DC]'}`} />
          <p className="font-mono text-xs tabular-nums tracking-wide text-[#635E54]">{e.date || '—'}</p>
          <div className="mt-2 rounded-lg border border-[#D5CBB7] bg-[#F6F1E6] p-4">
            <h3 className="text-base font-display font-bold text-[#181A1F]">{e.title}</h3>
            {e.description && <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#3A3D45]">{e.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
