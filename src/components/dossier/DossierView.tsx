import { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Crown, Share2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toaster';
import type { Content } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { DOSSIER_STATUS_LABELS, dossierCountLabel, parseDossierMeta, type DossierData } from '@/types/dossier';
import { DossierHeader } from './DossierHeader';
import { DossierSummaryTab } from './DossierSummaryTab';
import { DossierUpdatesTab } from './DossierUpdatesTab';
import { DossierTimelineTab } from './DossierTimelineTab';
import { DossierDocumentsTab } from './DossierDocumentsTab';
import { DossierStatementsTab } from './DossierStatementsTab';

type TabId = 'summary' | 'updates' | 'timeline' | 'documents' | 'statements';

function StatusStampSmall({ status }: { status: DossierData['caseStatus'] }) {
  const styles: Record<DossierData['caseStatus'], string> = {
    'w-toku': 'border-accent/70 text-accent',
    'nowa-aktualizacja': 'border-accent/80 text-accent',
    'w-sadzie': 'border-amber-400/70 text-amber-400',
    'zakonczona': 'border-emerald-500/60 text-emerald-400',
  };
  return (
    <span className={`dossier-stamp inline-flex shrink-0 rounded border px-2 py-1 font-mono text-[10px] font-bold tracking-[0.18em] ${styles[status]}`}>
      {DOSSIER_STATUS_LABELS[status].toUpperCase()}
    </span>
  );
}

export function DossierView({ content, hasFullAccess }: { content: Content; hasFullAccess: boolean }) {
  const dossier: DossierData = useMemo(() => parseDossierMeta(content.meta), [content.meta]);
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<TabId>('summary');
  const [videoOpen, setVideoOpen] = useState(false);
  const { toast } = useToast();

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: 'summary', label: 'W skrócie' },
    { id: 'updates', label: 'Aktualizacje', count: dossier.updates.length },
    { id: 'timeline', label: 'Oś czasu', count: dossier.timeline.length },
    { id: 'documents', label: 'Dokumenty i źródła', count: dossier.documents.length },
    { id: 'statements', label: 'Stanowiska i odpowiedzi', count: dossier.statements.length },
  ];

  const locked = !hasFullAccess && tab !== 'statements' && tab !== 'summary';
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/c/${content.slug}` : `/c/${content.slug}`;

  const onShare = async () => {
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

  const openDossier = (targetTab: TabId = 'summary') => {
    setTab(targetTab);
    setIsOpen(true);
    window.requestAnimationFrame(() => {
      document.getElementById('dossier-open')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const caseCode = (dossier.caseCode?.trim() || 'AKTA SPRAWY').toUpperCase();
  const activeTabLabel = tabs.find((t) => t.id === tab)?.label || 'W skrócie';
  const updated = dossier.updatedLabel || dossier.latestUpdate?.date || content.published_at || content.created_at;
  const updatedLabel = typeof updated === 'string' ? updated.split('T')[0] : '—';

  return (
    <div className="space-y-8">
      {!isOpen ? (
        <DossierHeader content={content} dossier={dossier} onOpen={() => openDossier('summary')} onOpenLatest={() => openDossier('updates')} />
      ) : (
        <div id="dossier-open" className="dossier-open-enter scroll-mt-24 space-y-6">
          <div className="rounded-2xl border border-[#2C3240] bg-[#171A21] p-2.5 shadow-[0_24px_60px_rgba(0,0,0,0.65)] sm:p-5">
            <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="rounded-t-md border border-[#c9b28c] bg-[#E5D3B3] px-3 py-1.5 font-mono text-[11px] font-bold tracking-[0.24em] text-[#1A1815]">{caseCode}</span>
                  <Link to="/sprawy" className="text-sm text-[#9AA3B2] hover:text-gold">← Sprawy</Link>
                  <StatusStampSmall status={dossier.caseStatus} />
                </div>
                <h1 className="mt-3 max-w-4xl text-2xl font-display font-bold leading-tight text-ink md:text-4xl">{content.title}</h1>
                <p className="mt-2 font-mono text-[11px] tracking-wide text-[#9AA3B2]">
                  {dossierCountLabel(dossier.updates.length, 'aktualizacja')} · {dossierCountLabel(dossier.documents.length, 'dokument')} · {dossierCountLabel(dossier.statements.length, 'stanowisko')}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => void onShare()} leftIcon={<Share2 className="h-4 w-4" />}>Udostępnij</Button>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} leftIcon={<X className="h-4 w-4" />} className="text-[#c2cad6] hover:text-ink">Zamknij teczkę</Button>
              </div>
            </div>

            {(content.video_id || content.thumbnail_url) && (
              <div className="mb-4 rounded-xl border border-[#2C3240] bg-[#10141A] p-3 sm:p-4">
                <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[#9AA3B2]">Załącznik wideo / materiał</p>
                {content.video_id ? (
                  <div className="overflow-hidden rounded-lg border border-[#2C3240] bg-black">
                    {videoOpen ? (
                      <div className="aspect-video">
                        <iframe
                          src={`https://www.youtube-nocookie.com/embed/${content.video_id}?autoplay=1&rel=0`}
                          title={content.title}
                          className="h-full w-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <button type="button" onClick={() => setVideoOpen(true)} className="group relative block aspect-video w-full">
                        <img src={content.thumbnail_url || `https://i.ytimg.com/vi/${content.video_id}/hqdefault.jpg`} alt={content.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" loading="lazy" />
                        <div className="absolute inset-0 bg-black/35 transition-colors group-hover:bg-black/45" />
                        <div className="absolute inset-0 flex items-center justify-center"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-white shadow-lg"><svg className="ml-1 h-6 w-6 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg></div></div>
                      </button>
                    )}
                  </div>
                ) : content.thumbnail_url ? (
                  <div className="overflow-hidden rounded-lg border border-[#2C3240]"><img src={content.thumbnail_url} alt={content.title} className="aspect-video w-full object-cover" loading="lazy" /></div>
                ) : null}
              </div>
            )}

            <div className="px-1 sm:px-2">
              <div className="-mb-px flex gap-1 overflow-x-auto pb-px scrollbar-hide">
                {tabs.map((t) => {
                  const active = tab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTab(t.id)}
                      className={cn(
                        'relative shrink-0 rounded-t-xl border-x border-t px-3 py-2.5 text-left text-sm transition-all sm:px-4',
                        active
                          ? 'z-20 -mb-px border-[#CFC5B0] border-t-[3px] border-t-[#B91C1C] bg-[#EFE9DC] font-bold text-[#17191E]'
                          : 'border-[#A89E89] bg-[#C8BEA8] text-[#2B2823] opacity-90 hover:bg-[#D6CCB7]'
                      )}
                    >
                      <span className="flex items-center gap-2 whitespace-nowrap">
                        {t.label}
                        {typeof t.count === 'number' && (
                          <span className={cn('rounded-full px-2 py-0.5 font-mono text-[11px] tabular-nums', active ? 'bg-[#17191E]/10 text-[#17191E]' : 'bg-[#17191E]/10 text-[#17191E]')}>{t.count}</span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-x-3 bottom-0 h-4 rounded-b-lg bg-[#C8BEA8]" aria-hidden="true" />
              <div className="absolute inset-x-1.5 bottom-1 h-4 rounded-b-lg bg-[#DFD6C3]" aria-hidden="true" />
              <div className="dossier-paper relative overflow-hidden rounded-b-xl rounded-tr-xl border border-[#CFC5B0] p-4 pb-8 sm:p-6 sm:pb-10 md:p-8 md:pb-12">
                <div className="pointer-events-none absolute bottom-0 left-[22px] top-0 border-l border-[#D5CAB5] sm:left-[36px]" aria-hidden="true" />
                <div className="pointer-events-none absolute left-2 top-8 h-3 w-3 rounded-full bg-[#171A21] shadow-[inset_0_1px_2px_rgba(255,255,255,0.08)] sm:left-[30px] sm:h-3.5 sm:w-3.5" aria-hidden="true" />
                <div className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-[#171A21] shadow-[inset_0_1px_2px_rgba(255,255,255,0.08)] sm:left-[30px] sm:h-3.5 sm:w-3.5" aria-hidden="true" />
                <div className="pointer-events-none absolute bottom-8 left-2 h-3 w-3 rounded-full bg-[#171A21] shadow-[inset_0_1px_2px_rgba(255,255,255,0.08)] sm:left-[30px] sm:h-3.5 sm:w-3.5" aria-hidden="true" />

                <div className="relative pl-6 sm:pl-10">
                  <div className="mb-5 flex flex-col gap-2 border-b border-[#D5CAB5] pb-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-[#635E54] sm:flex-row sm:items-center sm:justify-between">
                    <span>{activeTabLabel} · {caseCode}</span>
                    <span>Aktualizacja: {updatedLabel}</span>
                  </div>

                  {tab === 'summary' && dossier.latestUpdate && (dossier.latestUpdate.title || dossier.latestUpdate.summary) && (
                    <div className="mb-6 rounded-r-lg border border-[#D5CBB7] border-l-4 border-l-[#B91C1C] bg-[#F7F3E8] p-4 shadow-[0_6px_16px_rgba(24,26,31,0.06)]">
                      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#B91C1C]">Najnowsze w sprawie</p>
                      {dossier.latestUpdate.date && <p className="mt-2 font-mono text-xs tabular-nums text-[#635E54]">{dossier.latestUpdate.date}</p>}
                      {dossier.latestUpdate.title && <h2 className="mt-2 text-lg font-display font-bold text-[#181A1F]">{dossier.latestUpdate.title}</h2>}
                      {dossier.latestUpdate.summary && <p className="mt-2 text-sm leading-relaxed text-[#3A3D45]">{dossier.latestUpdate.summary}</p>}
                      <button type="button" onClick={() => setTab('updates')} className="mt-4 text-sm font-semibold text-[#991B1B] hover:text-[#7F1D1D]">Zobacz wszystkie aktualizacje →</button>
                    </div>
                  )}

                  <div key={tab} className="dossier-sheet-enter">
                    {tab === 'summary' && <DossierSummaryTab dossier={dossier} bodyMarkdown={content.body_markdown} />}
                    {tab === 'statements' && <DossierStatementsTab statements={dossier.statements} />}
                    {locked ? (
                      <div className="rounded-xl border border-[#CFC5B0] bg-[#EAE1CE] p-6 text-center sm:p-8">
                        <div className="mx-auto mb-4 inline-flex rounded border-2 border-[#7A2E2E]/60 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#7A2E2E] dossier-stamp">Dostęp dla Klubu Bez Maski</div>
                        <div className="mx-auto mb-5 max-w-md space-y-2 opacity-45" aria-hidden="true">
                          <div className="h-3 rounded bg-[#8C8577]" />
                          <div className="h-3 w-11/12 rounded bg-[#8C8577]" />
                          <div className="h-3 w-4/5 rounded bg-[#8C8577]" />
                        </div>
                        <h3 className="text-xl font-display font-bold text-[#181A1F]">Ta część teczki jest objęta dostępem klubowym</h3>
                        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#3A3D45]">Wspieraj niezależne dziennikarstwo śledcze, aby uzyskać pełny dostęp do aktualizacji, osi czasu i dokumentów. Stanowiska i odpowiedzi pozostają zawsze publiczne.</p>
                        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                          <Link to="/klub" className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-5 py-3 font-semibold text-white hover:bg-accent-hover"><Crown className="h-4 w-4" /> Dołącz do Klubu →</Link>
                          <button type="button" onClick={() => setTab('statements')} className="inline-flex items-center justify-center rounded-md border border-[#B8AE99] bg-[#F6F1E6] px-5 py-3 font-semibold text-[#181A1F] hover:bg-[#EFE6D3]">Zobacz stanowiska</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {tab === 'updates' && <DossierUpdatesTab updates={dossier.updates} />}
                        {tab === 'timeline' && <DossierTimelineTab timeline={dossier.timeline} />}
                        {tab === 'documents' && <DossierDocumentsTab documents={dossier.documents} />}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-accent/30 bg-gradient-to-r from-accent/[0.08] via-surface to-surface p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-accent"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-accent" /></span> Informator</div>
                <h3 className="text-xl font-display font-bold text-ink md:text-2xl">Masz dokumenty, wiedzę albo sygnał w tej sprawie?</h3>
                <p className="mt-2 max-w-2xl text-sm text-muted">Przekaż informację bezpiecznie i anonimowo. Każdy wiarygodny sygnał pomaga w dalszym śledztwie.</p>
              </div>
              <a href={`/informator?temat=${encodeURIComponent(`Sprawa: ${content.title}`)}`} className="btn btn-primary shrink-0">Przekaż anonimowo przez Informator →</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
