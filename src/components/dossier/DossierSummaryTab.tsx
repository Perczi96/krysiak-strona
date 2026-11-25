import { CheckCircle2, HelpCircle, Search } from 'lucide-react';
import { MarkdownRenderer } from '@/components/content/MarkdownRenderer';
import type { DossierData } from '@/types/dossier';

const docCard = 'rounded-lg border border-[#2a313d] bg-[#10141a]/45 p-5';

export function DossierSummaryTab({ dossier, bodyMarkdown }: { dossier: DossierData; bodyMarkdown?: string | null }) {
  const { summary } = dossier;
  const hasAny = summary.about || summary.findings.length > 0 || summary.unknowns.length > 0 || (summary.keyEntities && summary.keyEntities.length > 0) || bodyMarkdown;

  if (!hasAny) {
    return <div className={`${docCard} text-sm text-muted`}>Skrót teczki jest w przygotowaniu.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className={docCard}>
          <div className="mb-3 flex items-center gap-2 text-ink"><Search className="h-5 w-5 text-[#9aa3b2]" /><h3 className="font-display font-bold">O co chodzi</h3></div>
          <p className="text-sm leading-relaxed text-muted whitespace-pre-wrap">{summary.about || 'Uzupełnij skrót sprawy w panelu admina.'}</p>
        </div>
        <div className={`${docCard} border-emerald-500/20 bg-emerald-500/[0.04]`}>
          <div className="mb-3 flex items-center gap-2 text-ink"><CheckCircle2 className="h-5 w-5 text-emerald-400" /><h3 className="font-display font-bold">Co ustaliliśmy</h3></div>
          {summary.findings.length > 0 ? (
            <ul className="space-y-2 text-sm text-muted">{summary.findings.map((f, i) => <li key={i} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" /><span>{f}</span></li>)}</ul>
          ) : <p className="text-sm text-muted">Brak wpisanych ustaleń.</p>}
        </div>
        <div className={`${docCard} border-amber-500/20 bg-amber-500/[0.04]`}>
          <div className="mb-3 flex items-center gap-2 text-ink"><HelpCircle className="h-5 w-5 text-amber-400" /><h3 className="font-display font-bold">Czego jeszcze nie wiemy</h3></div>
          {summary.unknowns.length > 0 ? (
            <ul className="space-y-2 text-sm text-muted">{summary.unknowns.map((u, i) => <li key={i} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" /><span>{u}</span></li>)}</ul>
          ) : <p className="text-sm text-muted">Brak otwartych pytań.</p>}
        </div>
      </div>

      {summary.keyEntities && summary.keyEntities.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {summary.keyEntities.map((e, i) => <span key={i} className="rounded-full border border-[#2a313d] bg-[#10141a]/60 px-3 py-1 font-mono text-[11px] tracking-wide text-muted">{e}</span>)}
        </div>
      )}

      {bodyMarkdown && (
        <div className={`${docCard} p-6 md:p-8`}>
          <MarkdownRenderer content={bodyMarkdown} />
        </div>
      )}
    </div>
  );
}
