import { Link } from '@tanstack/react-router';
import { ArrowLeft, Calendar, Clock, FileText, MessageSquare, Share2, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toaster';
import type { Content } from '@/lib/supabase';
import { formatDatePL } from '@/lib/utils';
import { DOSSIER_STATUS_LABELS, type DossierData } from '@/types/dossier';

function StatusBadge({ status }: { status: DossierData['caseStatus'] }) {
  if (status === 'w-toku') {
    return <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent-dim px-3 py-1 text-xs font-semibold text-accent"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-accent" /></span>W toku</span>;
  }
  if (status === 'nowa-aktualizacja') return <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent-dim px-3 py-1 text-xs font-semibold text-accent">Nowa aktualizacja</span>;
  if (status === 'w-sadzie') return <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">W sądzie</span>;
  return <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-hover px-3 py-1 text-xs font-semibold text-muted">Zakończona</span>;
}

export function DossierHeader({ content, dossier }: { content: Content; dossier: DossierData }) {
  const { toast } = useToast();
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/c/${content.slug}` : `/c/${content.slug}`;

  const onShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: content.title, text: content.excerpt || 'Teczka sprawy — Bez Maski', url: shareUrl });
        return;
      }
    } catch { /* fallback to copy */ }
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({ type: 'success', title: 'Skopiowano link', message: 'Link do teczki został skopiowany.' });
    } catch {
      toast({ type: 'error', title: 'Nie udało się skopiować', message: shareUrl });
    }
  };

  const updatesCount = dossier.updates.length;
  const docsCount = dossier.documents.length;
  const statementsCount = dossier.statements.length;
  const updated = dossier.updatedLabel || dossier.latestUpdate?.date || content.published_at || content.created_at;

  return (
    <header className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
        <Link to="/sprawy" className="inline-flex items-center gap-2 hover:text-gold"><ArrowLeft className="h-4 w-4" /> Sprawy</Link>
        <span className="text-border">/</span>
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Teczka śledcza{dossier.caseCode ? ` · ${dossier.caseCode}` : ''}</span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-accent/[0.08] via-surface to-surface">
        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={dossier.caseStatus} />
            <Badge variant="gold" dot>Teczka sprawy</Badge>
          </div>
          <h1 className="mt-4 max-w-4xl text-3xl font-display font-bold leading-tight text-ink md:text-5xl">{content.title}</h1>
          {content.excerpt && <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted md:text-lg">{content.excerpt}</p>}

          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
            {dossier.startedAt && <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4 text-gold" /> Otwarcie: <span className="text-ink tabular-nums">{dossier.startedAt}</span></span>}
            {updated && <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4 text-gold" /> Aktualizacja: <span className="text-ink tabular-nums">{typeof updated === 'string' && updated.includes('T') ? formatDatePL(updated, 'd MMM yyyy') : updated}</span></span>}
            <span className="inline-flex items-center gap-2"><RefreshCw className="h-4 w-4 text-gold" /> <span className="tabular-nums text-ink">{updatesCount}</span> aktualizacji</span>
            <span className="inline-flex items-center gap-2"><FileText className="h-4 w-4 text-gold" /> <span className="tabular-nums text-ink">{docsCount}</span> dokumentów</span>
            <span className="inline-flex items-center gap-2"><MessageSquare className="h-4 w-4 text-gold" /> <span className="tabular-nums text-ink">{statementsCount}</span> stanowisk</span>
          </div>

          <div className="mt-6">
            <Button variant="secondary" onClick={() => void onShare()} leftIcon={<Share2 className="h-4 w-4" />}>Udostępnij</Button>
          </div>
        </div>
      </div>
    </header>
  );
}

export function DossierStatusLabel({ status }: { status: DossierData['caseStatus'] }) {
  return <>{DOSSIER_STATUS_LABELS[status]}</>;
}
