import { ExternalLink, FileText } from 'lucide-react';
import { DOC_TYPE_LABELS, type DossierDocument } from '@/types/dossier';

export function DossierDocumentsTab({ documents }: { documents: DossierDocument[] }) {
  if (documents.length === 0) {
    return <div className="rounded-lg border border-[#2a313d] bg-[#10141a]/45 p-6 text-sm text-muted">Brak przypiętych dokumentów i źródeł.</div>;
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {documents.map((doc) => (
        <article key={doc.id} className="rounded-lg border border-[#2a313d] bg-[#10141a]/45 p-5">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full border border-gold/30 bg-gold-dim px-2.5 py-0.5 font-mono text-[11px] font-semibold tracking-wide text-gold">{DOC_TYPE_LABELS[doc.docType]}</span>
            {doc.date && <span className="font-mono tabular-nums text-muted">{doc.date}</span>}
          </div>
          <h3 className="mt-3 text-base font-display font-bold text-ink">{doc.title}</h3>
          {doc.source && <p className="mt-1 text-xs text-muted">Źródło: {doc.source}</p>}
          {doc.note && <div className="mt-3 rounded-md border border-[#2a313d] bg-[#0d1015]/50 p-3 text-sm text-muted"><span className="font-semibold text-ink">Co wynika z dokumentu: </span>{doc.note}</div>}
          <div className="mt-4">
            {doc.url ? (
              <a href={doc.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:text-gold-light">
                Otwórz źródło <ExternalLink className="h-4 w-4" />
              </a>
            ) : (
              <span className="inline-flex items-center gap-2 text-xs text-muted"><FileText className="h-4 w-4" /> W archiwum redakcji</span>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
