import { ExternalLink } from 'lucide-react';
import type { DossierUpdate } from '@/types/dossier';

export function DossierUpdatesTab({ updates }: { updates: DossierUpdate[] }) {
  if (updates.length === 0) {
    return <div className="rounded-xl border border-[#D5CBB7] bg-[#F6F1E6] p-6 text-sm text-[#3A3D45]">Brak opublikowanych aktualizacji w tej teczce.</div>;
  }
  const sorted = [...updates].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  return (
    <div className="space-y-4">
      {sorted.map((u) => (
        <article key={u.id} className="rounded-xl border border-[#D5CBB7] bg-[#F6F1E6] p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="font-mono tabular-nums text-[#635E54]">{u.date || '—'}</span>
            {u.tag && <span className="rounded border border-[#B91C1C]/40 bg-[#F8EAEA] px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wide text-[#991B1B]">{u.tag}</span>}
          </div>
          <h3 className="mt-3 text-lg font-display font-bold text-[#181A1F]">{u.title}</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#3A3D45]">{u.body}</p>
          {u.linkUrl && (
            <a href={u.linkUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#991B1B] hover:text-[#7F1D1D]">
              {u.linkLabel || 'Zobacz materiał'} <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </article>
      ))}
    </div>
  );
}
