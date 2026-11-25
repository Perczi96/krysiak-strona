import { ArrowLeft, Share2 } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toaster';
import type { Content } from '@/lib/supabase';
import { formatDatePL } from '@/lib/utils';
import { DOSSIER_STATUS_LABELS, dossierCountLabel, type DossierData } from '@/types/dossier';

function PaperClip() {
  return (
    <svg className="absolute -top-2 right-6 h-14 w-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)] sm:right-10" viewBox="0 0 32 64" fill="none" aria-hidden="true">
      <path d="M11 6C11 3.79086 12.7909 2 15 2H17C19.2091 2 21 3.79086 21 6V46C21 50.4183 17.4183 54 13 54C8.58172 54 5 50.4183 5 46V16C5 13.2386 7.23858 11 10 11C12.7614 11 15 13.2386 15 16V44" stroke="url(#clip)" strokeWidth="2.6" strokeLinecap="round" />
      <defs>
        <linearGradient id="clip" x1="5" y1="2" x2="24" y2="54" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F3F4F6" /><stop offset="0.45" stopColor="#9CA3AF" /><stop offset="1" stopColor="#E5E7EB" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function StatusStamp({ status }: { status: DossierData['caseStatus'] }) {
  const styles: Record<DossierData['caseStatus'], string> = {
    'w-toku': 'border-accent/70 text-accent',
    'nowa-aktualizacja': 'border-accent/80 text-accent',
    'w-sadzie': 'border-amber-400/70 text-amber-400',
    'zakonczona': 'border-emerald-500/60 text-emerald-400',
  };
  const label = DOSSIER_STATUS_LABELS[status].toUpperCase();
  return (
    <div className={`dossier-stamp pointer-events-none select-none rounded-md border-2 px-3 py-2 sm:px-4 sm:py-2.5 ${styles[status]}`}>
      <div className="rounded-[3px] border border-current/40 px-2 py-1 text-center">
        <p className="font-mono text-[10px] font-bold tracking-[0.22em] sm:text-[11px]">{label}</p>
        {status === 'w-toku' && (
          <div className="mt-1 flex items-center justify-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" /></span>
            <span className="font-mono text-[9px] tracking-[0.18em] opacity-80">AKTYWNE</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function DossierHeader({
  content,
  dossier,
  onOpen,
  onOpenLatest,
}: {
  content: Content;
  dossier: DossierData;
  onOpen: () => void;
  onOpenLatest: () => void;
}) {
  const { toast } = useToast();
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/c/${content.slug}` : `/c/${content.slug}`;
  const updated = dossier.updatedLabel || dossier.latestUpdate?.date || content.published_at || content.created_at;
  const caseCode = dossier.caseCode?.trim() || 'AKTA SPRAWY';

  const onShare = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      if (navigator.share) {
        await navigator.share({ title: content.title, text: content.excerpt || 'Teczka sprawy — Bez Maski', url: shareUrl });
        return;
      }
    } catch { /* fallback */ }
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({ type: 'success', title: 'Skopiowano link', message: 'Link do teczki został skopiowany.' });
    } catch {
      toast({ type: 'error', title: 'Nie udało się skopiować', message: shareUrl });
    }
  };

  return (
    <header className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
        <Link to="/sprawy" className="inline-flex items-center gap-2 hover:text-gold"><ArrowLeft className="h-4 w-4" /> Sprawy</Link>
        <span className="text-border">/</span>
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Teczka śledcza</span>
      </div>

      <div className="relative pt-8 sm:pt-9">
        <div className="absolute left-6 top-0 z-20 sm:left-10">
          <div className="rounded-t-md border border-[#c9b28c] bg-[#E5D3B3] px-4 py-2 shadow-[0_1px_0_rgba(255,255,255,0.35)_inset]">
            <p className="font-mono text-[11px] font-bold tracking-[0.24em] text-[#1A1815]">{caseCode.toUpperCase()}</p>
          </div>
        </div>

        <div className="absolute inset-x-4 bottom-2 top-12 hidden rounded-b-xl border border-[#232833]/60 bg-[#0d1015] sm:block translate-x-2 translate-y-2" aria-hidden="true" />
        <div className="absolute inset-x-2 bottom-1 top-11 hidden rounded-b-xl border border-[#232833]/70 bg-[#10141a] sm:block translate-x-1 translate-y-1" aria-hidden="true" />

        <button type="button" onClick={onOpen} className="group relative block w-full text-left">
          <div className="dossier-grain dossier-cover-shadow relative overflow-hidden rounded-xl border border-[#2a313d] bg-gradient-to-b from-[#161920] to-[#111419] transition-transform duration-300 group-hover:-translate-y-1 group-active:translate-y-0">
            <PaperClip />
            <div className="absolute right-4 top-5 z-10 sm:right-8 sm:top-7"><StatusStamp status={dossier.caseStatus} /></div>
            <div className="dossier-paper-edge absolute bottom-0 right-0 top-0 hidden w-3 bg-gradient-to-l from-[#e5d3b3]/10 to-transparent sm:block" aria-hidden="true" />

            <div className="relative p-6 pt-10 sm:p-10 sm:pt-12">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#c8b79a]/80">Materiały śledcze · Bez Maski</p>
              <h1 className="mt-4 max-w-4xl pr-20 text-3xl font-display font-bold leading-[1.08] text-ink sm:pr-28 md:text-5xl">{content.title}</h1>
              {content.excerpt && <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#c2cad6] md:text-lg">{content.excerpt}</p>}

              <div className="mt-8 grid gap-3 border-t border-[#2a313d]/80 pt-5 font-mono text-[11px] tracking-wide text-[#9aa3b2] sm:grid-cols-2 lg:grid-cols-4">
                <div><p className="text-[#7f8896]">OTWARCIE</p><p className="mt-1 tabular-nums text-[#dbe1ea]">{dossier.startedAt || '—'}</p></div>
                <div><p className="text-[#7f8896]">AKTUALIZACJA</p><p className="mt-1 tabular-nums text-[#dbe1ea]">{typeof updated === 'string' && updated.includes('T') ? formatDatePL(updated, 'd MMM yyyy') : (updated || '—')}</p></div>
                <div><p className="text-[#7f8896]">AKTA</p><p className="mt-1 tabular-nums text-[#dbe1ea]">{dossierCountLabel(dossier.updates.length, 'aktualizacja')}</p></div>
                <div><p className="text-[#7f8896]">MATERIAŁY</p><p className="mt-1 tabular-nums text-[#dbe1ea]">{dossierCountLabel(dossier.documents.length, 'dokument')} · {dossierCountLabel(dossier.statements.length, 'stanowisko')}</p></div>
              </div>

              <div className="mt-8 flex flex-col gap-3 border-t border-[#2a313d]/80 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <span className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-5 py-3 font-semibold text-white shadow-[0_8px_24px_rgba(217,45,32,0.25)] transition-colors group-hover:bg-accent-hover">
                  Otwórz teczkę →
                </span>
                <Button variant="ghost" onClick={onShare} leftIcon={<Share2 className="h-4 w-4" />} className="text-[#c2cad6] hover:text-ink">
                  Udostępnij
                </Button>
              </div>
            </div>
          </div>
        </button>
      </div>

      {dossier.latestUpdate && (dossier.latestUpdate.title || dossier.latestUpdate.summary) && (
        <div className="relative ml-2 rounded-r-lg border border-[#2a313d] border-l-2 border-l-accent bg-[#14171D] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-accent">Najnowsze w sprawie</p>
          {dossier.latestUpdate.date && <p className="mt-2 font-mono text-xs tabular-nums text-gold">{dossier.latestUpdate.date}</p>}
          {dossier.latestUpdate.title && <h2 className="mt-2 text-lg font-display font-bold text-ink">{dossier.latestUpdate.title}</h2>}
          {dossier.latestUpdate.summary && <p className="mt-2 text-sm leading-relaxed text-muted">{dossier.latestUpdate.summary}</p>}
          <button type="button" onClick={onOpenLatest} className="mt-4 text-sm font-semibold text-gold hover:text-gold-light">Otwórz na najnowszej aktualizacji →</button>
        </div>
      )}
    </header>
  );
}

export function DossierStatusLabel({ status }: { status: DossierData['caseStatus'] }) {
  return <>{DOSSIER_STATUS_LABELS[status]}</>;
}
