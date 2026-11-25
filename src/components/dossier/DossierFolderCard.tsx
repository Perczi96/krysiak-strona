import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import type { Content } from '@/lib/supabase';
import { DOSSIER_STATUS_LABELS, dossierCountLabel, parseDossierMeta } from '@/types/dossier';

export function DossierFolderCard({ content }: { content: Content }) {
  const d = parseDossierMeta(content.meta);
  const caseCode = (d.caseCode || 'AKTA SPRAWY').toUpperCase();
  const stampClass =
    d.caseStatus === 'w-sadzie' ? 'border-amber-400/70 text-amber-400' :
    d.caseStatus === 'zakonczona' ? 'border-emerald-500/60 text-emerald-400' :
    'border-accent/70 text-accent';

  return (
    <Link to="/c/$slug" params={{ slug: content.slug }} className="group block pt-7">
      <div className="relative">
        <div className="absolute left-5 top-0 z-20 -translate-y-1/2">
          <div className="rounded-t-md border border-[#c9b28c] bg-[#E5D3B3] px-3 py-1.5 shadow-[0_1px_0_rgba(255,255,255,0.35)_inset]">
            <p className="font-mono text-[10px] font-bold tracking-[0.22em] text-[#1A1815]">{caseCode}</p>
          </div>
        </div>
        <div className="absolute inset-x-3 -bottom-1 top-3 rounded-xl border border-[#232833]/70 bg-[#10141a]" aria-hidden="true" />
        <div className="dossier-grain dossier-cover-shadow relative overflow-hidden rounded-xl border border-[#2a313d] bg-gradient-to-b from-[#161920] to-[#111419] p-5 transition-transform duration-300 group-hover:-translate-y-1 sm:p-6">
          <div className="absolute right-0 top-3 h-10 w-[5px] rounded-l-sm bg-[#EAE2D0]/90" aria-hidden="true" />
          <div className="flex items-start justify-between gap-3">
            <p className="pt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[#9aa3b2]">Teczka śledcza</p>
            <span className={`dossier-stamp shrink-0 rounded border px-2 py-1 font-mono text-[10px] font-bold tracking-[0.18em] ${stampClass}`}>
              {DOSSIER_STATUS_LABELS[d.caseStatus].toUpperCase()}
            </span>
          </div>
          <h3 className="mt-3 text-xl font-display font-bold text-ink transition-colors group-hover:text-gold">{content.title}</h3>
          {content.excerpt && <p className="mt-2 line-clamp-2 text-sm text-muted">{content.excerpt}</p>}
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] tracking-wide text-[#9aa3b2]">
            <span className="tabular-nums">{dossierCountLabel(d.updates.length, 'aktualizacja')}</span>
            <span className="tabular-nums">{dossierCountLabel(d.documents.length, 'dokument')}</span>
            <span className="tabular-nums">{dossierCountLabel(d.statements.length, 'stanowisko')}</span>
          </div>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-gold">Otwórz teczkę <ArrowRight className="h-4 w-4" /></span>
        </div>
      </div>
    </Link>
  );
}
