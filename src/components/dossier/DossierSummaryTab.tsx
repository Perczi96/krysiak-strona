import { CheckCircle2, HelpCircle, Search } from 'lucide-react';
import { MarkdownRenderer } from '@/components/content/MarkdownRenderer';
import type { DossierData } from '@/types/dossier';

export function DossierSummaryTab({ dossier, bodyMarkdown }: { dossier: DossierData; bodyMarkdown?: string | null }) {
  const { summary } = dossier;
  const hasAny = summary.about || summary.findings.length > 0 || summary.unknowns.length > 0 || (summary.keyEntities && summary.keyEntities.length > 0) || bodyMarkdown;

  if (!hasAny) {
    return <div className="rounded-xl border border-[#D5CBB7] bg-[#F6F1E6] p-6 text-sm text-[#3A3D45]">Skrót teczki jest w przygotowaniu.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <section className="rounded-xl border border-[#D5CBB7] bg-[#F6F1E6] p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-2"><Search className="h-5 w-5 text-[#575A63]" /><h3 className="font-display font-bold text-[#17191E]">O co chodzi</h3></div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#272A30]">{summary.about || 'Uzupełnij skrót sprawy w panelu admina.'}</p>
        </section>

        <section className="rounded-xl border border-[#B5CBB8] bg-[#E3EBE4] p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-[#1F6A3A]" /><h3 className="font-display font-bold text-[#143A1D]">Co ustaliliśmy</h3></div>
          {summary.findings.length > 0 ? (
            <ul className="space-y-2 text-sm text-[#1E2420]">{summary.findings.map((f, i) => <li key={i} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1F6A3A]" /><span>{f}</span></li>)}</ul>
          ) : <p className="text-sm text-[#3A3D45]">Brak wpisanych ustaleń.</p>}
        </section>

        <section className="rounded-xl border border-[#D7BE86] bg-[#F4E9CE] p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-2"><HelpCircle className="h-5 w-5 text-[#8A5A00]" /><h3 className="font-display font-bold text-[#4D3309]">Czego jeszcze nie wiemy</h3></div>
          {summary.unknowns.length > 0 ? (
            <ul className="space-y-2 text-sm text-[#2A2418]">{summary.unknowns.map((u, i) => <li key={i} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#8A5A00]" /><span>{u}</span></li>)}</ul>
          ) : <p className="text-sm text-[#575A63]">Brak otwartych pytań.</p>}
        </section>
      </div>

      {summary.keyEntities && summary.keyEntities.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {summary.keyEntities.map((e, i) => <span key={i} className="rounded-full border border-[#C5B99F] bg-[#E3DAC6] px-3 py-1 font-mono text-xs text-[#2A2824]">{e}</span>)}
        </div>
      )}

      {bodyMarkdown && (
        <section className="rounded-xl border border-[#D5CBB7] bg-[#F6F1E6] p-5 sm:p-6 md:p-8">
          <div className="prose max-w-none">
            <MarkdownRenderer content={bodyMarkdown} />
          </div>
        </section>
      )}
    </div>
  );
}
