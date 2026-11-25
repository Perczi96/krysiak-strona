import { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Crown, Lock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { Content } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { parseDossierMeta, type DossierData } from '@/types/dossier';
import { DossierHeader } from './DossierHeader';
import { DossierSummaryTab } from './DossierSummaryTab';
import { DossierUpdatesTab } from './DossierUpdatesTab';
import { DossierTimelineTab } from './DossierTimelineTab';
import { DossierDocumentsTab } from './DossierDocumentsTab';
import { DossierStatementsTab } from './DossierStatementsTab';

type TabId = 'summary' | 'updates' | 'timeline' | 'documents' | 'statements';

export function DossierView({ content, hasFullAccess }: { content: Content; hasFullAccess: boolean }) {
  const dossier: DossierData = useMemo(() => parseDossierMeta(content.meta), [content.meta]);
  const [tab, setTab] = useState<TabId>('summary');
  const [videoOpen, setVideoOpen] = useState(false);

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: 'summary', label: 'W skrócie' },
    { id: 'updates', label: 'Aktualizacje', count: dossier.updates.length },
    { id: 'timeline', label: 'Oś czasu', count: dossier.timeline.length },
    { id: 'documents', label: 'Dokumenty i źródła', count: dossier.documents.length },
    { id: 'statements', label: 'Stanowiska i odpowiedzi', count: dossier.statements.length },
  ];

  const locked = !hasFullAccess && tab !== 'statements' && tab !== 'summary';

  return (
    <div className="space-y-8">
      <DossierHeader content={content} dossier={dossier} />

      {content.video_id ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-black">
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
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-white shadow-lg"><svg className="ml-1 h-6 w-6 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>
              </div>
            </button>
          )}
        </div>
      ) : content.thumbnail_url ? (
        <div className="overflow-hidden rounded-2xl border border-border"><img src={content.thumbnail_url} alt={content.title} className="aspect-video w-full object-cover" loading="lazy" /></div>
      ) : null}

      {dossier.latestUpdate && (dossier.latestUpdate.title || dossier.latestUpdate.summary) && (
        <Card className="border-l-2 border-l-accent p-5 md:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Najnowsze w sprawie</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            {dossier.latestUpdate.date && <span className="font-mono tabular-nums text-gold">{dossier.latestUpdate.date}</span>}
          </div>
          {dossier.latestUpdate.title && <h2 className="mt-2 text-lg font-display font-bold text-ink">{dossier.latestUpdate.title}</h2>}
          {dossier.latestUpdate.summary && <p className="mt-2 text-sm leading-relaxed text-muted">{dossier.latestUpdate.summary}</p>}
          <button type="button" onClick={() => setTab('updates')} className="mt-4 text-sm font-semibold text-gold hover:text-gold-light">Zobacz wszystkie aktualizacje →</button>
        </Card>
      )}

      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-2 border-b border-border pb-px">
          {tabs.map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)}
              className={cn('inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors', tab === t.id ? 'border-gold text-ink' : 'border-transparent text-muted hover:text-ink')}>
              {t.label}
              {typeof t.count === 'number' && <span className={cn('rounded-full px-2 py-0.5 text-[11px] tabular-nums', tab === t.id ? 'bg-gold-dim text-gold' : 'bg-surface-hover text-muted')}>{t.count}</span>}
            </button>
          ))}
        </div>
      </div>

      <div>
        {tab === 'summary' && <DossierSummaryTab dossier={dossier} bodyMarkdown={content.body_markdown} />}
        {tab === 'statements' && <DossierStatementsTab statements={dossier.statements} />}
        {locked ? (
          <Card className="border-gold/20 bg-gold-dim/10 p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold-dim"><Lock className="h-6 w-6 text-gold" /></div>
            <h3 className="text-xl font-display font-bold text-ink">Ta część teczki jest dla Klubu Bez Maski</h3>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted">Wspieraj niezależne dziennikarstwo śledcze, aby uzyskać pełny dostęp do aktualizacji, osi czasu i dokumentów. Stanowiska i odpowiedzi pozostają zawsze publiczne.</p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/klub" className="btn btn-primary inline-flex items-center gap-2"><Crown className="h-4 w-4" /> Poznaj Klub</Link>
              <button type="button" onClick={() => setTab('statements')} className="btn btn-secondary">Zobacz stanowiska</button>
            </div>
          </Card>
        ) : (
          <>
            {tab === 'updates' && <DossierUpdatesTab updates={dossier.updates} />}
            {tab === 'timeline' && <DossierTimelineTab timeline={dossier.timeline} />}
            {tab === 'documents' && <DossierDocumentsTab documents={dossier.documents} />}
          </>
        )}
      </div>

      <Card className="overflow-hidden border-accent/30 p-0">
        <div className="flex flex-col gap-4 bg-gradient-to-r from-accent/[0.08] via-surface to-surface p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-accent"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-accent" /></span> Informator</div>
            <h3 className="text-xl font-display font-bold text-ink md:text-2xl">Masz dokumenty, wiedzę albo sygnał w tej sprawie?</h3>
            <p className="mt-2 max-w-2xl text-sm text-muted">Przekaż informację bezpiecznie i anonimowo. Każdy wiarygodny sygnał pomaga w dalszym śledztwie.</p>
          </div>
          <a href={`/informator?temat=${encodeURIComponent(`Sprawa: ${content.title}`)}`} className="btn btn-primary shrink-0">
            Przekaż anonimowo przez Informator →
          </a>
        </div>
      </Card>
    </div>
  );
}
