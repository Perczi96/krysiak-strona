import { ExternalLink, FileText } from 'lucide-react';
import { DOC_TYPE_LABELS, type DossierDocument } from '@/types/dossier';

export function DossierDocumentsTab({ documents }: { documents: DossierDocument[] }) {
  if (documents.length === 0) {
    return <div className="rounded-xl border border-[#D5CBB7] bg-[#F6F1E6] p-6 text-sm text-[#3A3D45]">Brak przypiętych dokumentów i źródeł.</div>;
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {documents.map((doc) => (
        <article key={doc.id} className="rounded-xl border border-[#D5CBB7] bg-[#F6F1E6] p-5">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded border border-[#B8AE99] bg-[#EAE1CE] px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-[#2A2824]">{DOC_TYPE_LABELS[doc.docType]}</span>
            {doc.date && <span className="font-mono tabular-nums text-[#635E54]">{doc.date}</span>}
          </div>
          <h3 className="mt-3 text-base font-display font-bold text-[#181A1F]">{doc.title}</h3>
          {doc.source && <p className="mt-1 text-xs text-[#575A63]">Źródło: {doc.source}</p>}
          {doc.note && <div className="mt-3 rounded-md border border-[#CFC5B0] border-l-4 border-l-[#A89E89] bg-[#EAE1CE] p-3 text-sm text-[#3A3D45]"><span className="font-semibold text-[#181A1F]">Co wynika z dokumentu: </span>{doc.note}</div>}
          <div className="mt-4">
            {doc.url ? (
              <a href={doc.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md border border-[#B91C1C]/30 px-3 py-2 text-sm font-semibold text-[#991B1B] hover:bg-[#F8EAEA]">
                Otwórz źródło <ExternalLink className="h-4 w-4" />
              </a>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-md border border-[#CFC5B0] bg-[#EAE1CE] px-3 py-2 font-mono text-[11px] uppercase tracking-wide text-[#575A63]"><FileText className="h-4 w-4" /> W archiwum redakcji</span>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
