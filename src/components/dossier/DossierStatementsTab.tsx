import { ExternalLink, ShieldAlert } from 'lucide-react';
import { STATEMENT_STATUS_LABELS, type DossierStatement } from '@/types/dossier';

function statusClasses(status: DossierStatement['status']) {
  if (status === 'odpowiedz') return 'border-[#3E6B4A]/35 bg-[#E3EBE4] text-[#1F5A33]';
  if (status === 'odmowa') return 'border-[#B91C1C]/35 bg-[#F8EAEA] text-[#991B1B]';
  if (status === 'brak-odpowiedzi') return 'border-[#B7791F]/35 bg-[#F4E9CE] text-[#8A5A00]';
  return 'border-[#35527A]/35 bg-[#E4ECF5] text-[#24466E]';
}

export function DossierStatementsTab({ statements }: { statements: DossierStatement[] }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#C6BBA2] bg-[#E5DEC9] p-4 text-sm text-[#2D2A24]">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#7A5A12]" />
          <p>Stanowiska instytucji, pełnomocników i osób wymienionych w publikacjach są zawsze dostępne publicznie — bez ograniczeń dostępu.</p>
        </div>
      </div>

      {statements.length === 0 ? (
        <div className="rounded-xl border border-[#D5CBB7] bg-[#F6F1E6] p-6 text-sm text-[#3A3D45]">Brak opublikowanych stanowisk lub odpowiedzi w tej sprawie.</div>
      ) : (
        statements.map((s) => (
          <article key={s.id} className="rounded-xl border border-[#D5CBB7] bg-[#F6F1E6] p-5 md:p-6">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={`rounded border px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide ${statusClasses(s.status)}`}>{STATEMENT_STATUS_LABELS[s.status]}</span>
              {s.date && <span className="font-mono tabular-nums text-[#635E54]">{s.date}</span>}
            </div>
            <h3 className="mt-3 text-base font-display font-bold text-[#181A1F]">{s.who}</h3>
            {s.role && <p className="text-sm text-[#575A63]">{s.role}</p>}
            <blockquote className="mt-4 border-l-2 border-[#B8AE99] pl-4 text-sm leading-relaxed text-[#3A3D45] whitespace-pre-wrap">{s.body}</blockquote>
            {s.url && (
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#991B1B] hover:text-[#7F1D1D]">
                Zobacz pełne pismo <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </article>
        ))
      )}
    </div>
  );
}
