import { ExternalLink } from 'lucide-react';
import type { DossierUpdate } from '@/types/dossier';

export function DossierUpdatesTab({ updates }: { updates: DossierUpdate[] }) {
  if (updates.length === 0) {
    return <div className="rounded-lg border border-[#2a313d] bg-[#10141a]/45 p-6 text-sm text-muted">Brak opublikowanych aktualizacji w tej teczce.</div>;
  }
  const sorted = [...updates].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  return (
    <div className="space-y-4">
      {sorted.map((u) => (
        <article key={u.id} className="rounded-lg border border-[#2a313d] bg-[#10141a]/45 p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
            <span className="font-mono tabular-nums text-gold">{u.date || '—'}</span>
            {u.tag && <span className="rounded-full border border-accent/30 bg-accent-dim px-2.5 py-0.5 font-mono text-[11px] font-semibold tracking-wide text-accent">{u.tag}</span>}
          </div>
          <h3 className="mt-3 text-lg font-display font-bold text-ink">{u.title}</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted">{u.body}</p>
          {u.linkUrl && (
            <a href={u.linkUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-gold hover:text-gold-light">
              {u.linkLabel || 'Zobacz materiał'} <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </article>
      ))}
    </div>
  );
}
