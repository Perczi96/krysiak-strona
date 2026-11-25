import { ExternalLink, ShieldAlert } from 'lucide-react';
import { STATEMENT_STATUS_LABELS, type DossierStatement } from '@/types/dossier';

function statusClasses(status: DossierStatement['status']) {
  if (status === 'odpowiedz') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400';
  if (status === 'odmowa') return 'border-amber-500/30 bg-amber-500/10 text-amber-400';
  if (status === 'brak-odpowiedzi') return 'border-accent/30 bg-accent-dim text-accent';
  return 'border-blue/30 bg-blue/10 text-blue';
}

export function DossierStatementsTab({ statements }: { statements: DossierStatement[] }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[#2a313d] bg-[#10141a]/60 p-4 text-sm text-muted">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
          <p>Stanowiska instytucji, pełnomocników i osób wymienionych w publikacjach są zawsze dostępne publicznie — bez ograniczeń dostępu.</p>
        </div>
      </div>

      {statements.length === 0 ? (
        <div className="rounded-lg border border-[#2a313d] bg-[#10141a]/45 p-6 text-sm text-muted">Brak opublikowanych stanowisk lub odpowiedzi w tej sprawie.</div>
      ) : (
        statements.map((s) => (
          <article key={s.id} className="rounded-lg border border-[#2a313d] bg-[#10141a]/45 p-5 md:p-6">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-semibold tracking-wide ${statusClasses(s.status)}`}>{STATEMENT_STATUS_LABELS[s.status]}</span>
              {s.date && <span className="font-mono tabular-nums text-muted">{s.date}</span>}
            </div>
            <h3 className="mt-3 text-base font-display font-bold text-ink">{s.who}</h3>
            {s.role && <p className="text-sm text-muted">{s.role}</p>}
            <blockquote className="mt-4 border-l-2 border-[#3a4352] pl-4 text-sm leading-relaxed text-muted whitespace-pre-wrap">{s.body}</blockquote>
            {s.url && (
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-gold hover:text-gold-light">
                Zobacz pełne pismo <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </article>
        ))
      )}
    </div>
  );
}
