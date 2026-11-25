import { useEffect, useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRight, Clock, ExternalLink, FolderSearch, Play, Search } from 'lucide-react';
import { getContentList, type Content } from '@/lib/supabase';
import { formatRelativePL, formatDuration, getYouTubeThumbnail } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import materialyData from '@/data/materialy.json';
import wyroznioneData from '@/data/wyroznione.json';
import { presetTagFromContent } from '@/config/contentPresets';
import { DOSSIER_STATUS_LABELS, dossierCountLabel, isDossierContent, parseDossierMeta } from '@/types/dossier';

type MaterialJson = {
  slug: string;
  videoId: string;
  tytul: string;
  data?: string;
  dataIso?: string;
  seria?: string;
  sekcja?: string;
  streszczenie?: string;
  youtubeUrl: string;
  miniatura?: string;
};

type WyroznioneJson = {
  pozycje: Array<{ tytul: string; url: string; medium?: string; etykieta?: string }>;
};

type UnifiedItem = {
  key: string;
  title: string;
  excerpt?: string;
  date?: string;
  videoId?: string;
  thumbnail?: string | null;
  href?: string;
  externalUrl?: string;
  badge: string;
  featured: boolean;
  durationSeconds?: number | null;
};

function extractYtId(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : null;
}

function normTitle(s: string): string {
  return s.toLowerCase().replace(/\s+/g, ' ').trim();
}

function toUnifiedFromSupabase(c: Content): UnifiedItem {
  const preset = presetTagFromContent(c);
  const badge =
    preset === 'aktualizacja-sprawy' ? 'Aktualizacja sprawy' :
    preset === 'sprawa-sadowa' ? 'Sprawa sądowa' :
    c.visibility !== 'public' ? 'Dla Patronów' :
    c.type === 'post' ? 'Tekst' : 'Wideo';
  return {
    key: `db:${c.id}`,
    title: c.title,
    excerpt: c.excerpt || undefined,
    date: c.published_at || c.created_at,
    videoId: c.video_id || undefined,
    thumbnail: c.thumbnail_url || (c.video_id ? getYouTubeThumbnail(c.video_id) : null),
    href: `/c/${c.slug}`,
    badge,
    featured: !!c.is_featured || preset === 'aktualizacja-sprawy',
    durationSeconds: c.duration_seconds,
  };
}

function toUnifiedFromMaterial(m: MaterialJson, featured = false): UnifiedItem {
  return {
    key: `mat:${m.videoId || m.slug}`,
    title: m.tytul,
    excerpt: m.streszczenie,
    date: m.dataIso || m.data,
    videoId: m.videoId,
    thumbnail: m.miniatura || (m.videoId ? getYouTubeThumbnail(m.videoId) : null),
    externalUrl: m.youtubeUrl,
    badge: m.seria || 'Wideo',
    featured,
  };
}

function toUnifiedFromWyroznione(w: { tytul: string; url: string; etykieta?: string }): UnifiedItem | null {
  const videoId = extractYtId(w.url);
  if (!videoId) return null;
  return {
    key: `wyr:${videoId}`,
    title: w.tytul,
    date: undefined,
    videoId,
    thumbnail: getYouTubeThumbnail(videoId),
    externalUrl: w.url,
    badge: w.etykieta || 'Wideo',
    featured: true,
  };
}

function ItemCard({ item }: { item: UnifiedItem }) {
  const inner = (
    <Card variant="hover" className="h-full overflow-hidden p-0">
      <div className="relative aspect-video overflow-hidden bg-surface">
        {item.thumbnail ? (
          <img src={item.thumbnail} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted">
            <Search className="h-10 w-10" />
          </div>
        )}
        {item.durationSeconds ? <span className="duration-badge">{formatDuration(item.durationSeconds)}</span> : null}
        {item.featured ? <span className="premium-badge bg-accent/90 text-white"><Play className="h-3 w-3 fill-current" /> Wyróżnione</span> : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted">
          <span className="font-medium text-gold">{item.badge}</span>
          {item.date && <><span className="text-muted/50">·</span><span>{formatRelativePL(item.date)}</span></>}
        </div>
        <h3 className="mb-2 line-clamp-2 text-lg font-display font-bold text-ink transition-colors group-hover:text-gold">{item.title}</h3>
        {item.excerpt && <p className="mb-4 line-clamp-3 text-sm text-muted">{item.excerpt}</p>}
        <div className="mt-auto flex items-center justify-between border-t border-border pt-3 text-xs text-muted">
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{item.date ? formatRelativePL(item.date) : 'Archiwum'}</span>
          {item.externalUrl && !item.href ? <span className="inline-flex items-center gap-1">YouTube <ExternalLink className="h-3.5 w-3.5" /></span> : null}
        </div>
      </div>
    </Card>
  );

  if (item.href) {
    return <Link to="/c/$slug" params={{ slug: item.href.replace('/c/', '') }} className="group block">{inner}</Link>;
  }
  return (
    <a href={item.externalUrl} target="_blank" rel="noopener noreferrer" className="group block">
      {inner}
    </a>
  );
}

export function SprawyPage() {
  const [dbItems, setDbItems] = useState<Content[]>([]);
  const [dossiers, setDossiers] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'featured' | 'video'>('all');

  useEffect(() => {
    const load = async () => {
      const [featured, videos, posts] = await Promise.all([
        getContentList({ featured: true, limit: 20 }),
        getContentList({ type: 'video', limit: 30 }),
        getContentList({ type: 'post', limit: 40 }),
      ]);
      const byId = new Map<string, Content>();
      [...featured, ...videos, ...posts].forEach((item) => byId.set(item.id, item));
      const all = Array.from(byId.values());
      setDbItems(all);
      setDossiers(all.filter((c) => isDossierContent(c)).sort((a, b) => (b.published_at || b.created_at).localeCompare(a.published_at || a.created_at)));
      setLoading(false);
    };
    void load();
  }, []);

  const { featuredItems, allItems } = useMemo(() => {
    const wyroznione = (wyroznioneData as WyroznioneJson).pozycje
      .map((w) => toUnifiedFromWyroznione(w))
      .filter((x): x is UnifiedItem => !!x);

    const materials = (materialyData as MaterialJson[]).map((m) => toUnifiedFromMaterial(m, false));
    const dbUnified = dbItems.map(toUnifiedFromSupabase);

    const seenVideo = new Set<string>();
    const seenTitle = new Set<string>();
    const merged: UnifiedItem[] = [];

    const push = (item: UnifiedItem) => {
      const vid = item.videoId || '';
      const t = normTitle(item.title);
      if (vid && seenVideo.has(vid)) return;
      if (seenTitle.has(t)) return;
      if (vid) seenVideo.add(vid);
      seenTitle.add(t);
      merged.push(item);
    };

    // Featured section: wyroznione first, then DB featured, then featured-looking materials
    const featuredMerged: UnifiedItem[] = [];
    const pushFeatured = (item: UnifiedItem) => {
      const vid = item.videoId || '';
      const t = normTitle(item.title);
      if (vid && seenVideo.has(`f:${vid}`)) return;
      if (seenTitle.has(`f:${t}`)) return;
      if (vid) seenVideo.add(`f:${vid}`);
      seenTitle.add(`f:${t}`);
      featuredMerged.push({ ...item, featured: true });
    };
    wyroznione.slice(0, 6).forEach(pushFeatured);
    dbUnified.filter((i) => i.featured).forEach(pushFeatured);

    // All: DB first (fresh), then materials, then remaining wyroznione
    dbUnified.forEach(push);
    materials.forEach(push);
    wyroznione.forEach(push);

    // Sort by date desc when available
    merged.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    return { featuredItems: featuredMerged, allItems: merged };
  }, [dbItems]);

  const visible = useMemo(() => {
    if (filter === 'featured') return allItems.filter((i) => i.featured || featuredItems.some((f) => f.key === i.key || f.videoId === i.videoId));
    if (filter === 'video') return allItems.filter((i) => i.videoId);
    return allItems;
  }, [allItems, featuredItems, filter]);

  return (
    <div className="container py-8 md:py-12">
      <div className="mb-10 max-w-3xl">
        <Badge variant="new" dot>Śledztwa</Badge>
        <h1 className="mt-4 text-3xl font-display font-bold text-ink md:text-4xl">Sprawy</h1>
        <p className="mt-3 text-base text-muted md:text-lg">
          Materiały śledcze, reportaże i sprawy, które wymagają czasu, dokumentów i cierpliwości. Archiwum łączy najnowsze publikacje z bazy z wyróżnionymi materiałami i sprawami.
        </p>
      </div>

      {dossiers.length > 0 && (
        <section className="mb-12">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-dim text-gold"><FolderSearch className="h-5 w-5" /></div>
            <div>
              <h2 className="text-2xl font-display font-bold text-ink">Teczki spraw</h2>
              <p className="text-sm text-muted">Najważniejsze śledztwa w jednym miejscu — z aktualizacjami, osią czasu i dokumentami.</p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {dossiers.map((c) => {
              const d = parseDossierMeta(c.meta);
              const caseCode = (d.caseCode || 'AKTA SPRAWY').toUpperCase();
              const stampClass =
                d.caseStatus === 'w-sadzie' ? 'border-amber-400/70 text-amber-400' :
                d.caseStatus === 'zakonczona' ? 'border-emerald-500/60 text-emerald-400' :
                'border-accent/70 text-accent';
              return (
                <Link key={c.id} to="/c/$slug" params={{ slug: c.slug }} className="group block pt-7">
                  <div className="relative">
                    <div className="absolute left-5 top-0 z-20 -translate-y-1/2">
                      <div className="rounded-t-md border border-[#c9b28c] bg-[#E5D3B3] px-3 py-1.5 shadow-[0_1px_0_rgba(255,255,255,0.35)_inset]">
                        <p className="font-mono text-[10px] font-bold tracking-[0.22em] text-[#1A1815]">{caseCode}</p>
                      </div>
                    </div>
                    <div className="absolute inset-x-3 -bottom-1 top-3 rounded-xl border border-[#232833]/70 bg-[#10141a]" aria-hidden="true" />
                    <div className="dossier-grain dossier-cover-shadow relative overflow-hidden rounded-xl border border-[#2a313d] bg-gradient-to-b from-[#161920] to-[#111419] p-6 transition-transform duration-300 group-hover:-translate-y-1">
                      <div className={`dossier-stamp absolute right-4 top-4 rounded border px-2 py-1 font-mono text-[10px] font-bold tracking-[0.18em] ${stampClass}`}>
                        {DOSSIER_STATUS_LABELS[d.caseStatus].toUpperCase()}
                      </div>
                      <p className="pr-24 font-mono text-[10px] uppercase tracking-[0.22em] text-[#9aa3b2]">Teczka śledcza</p>
                      <h3 className="mt-3 text-xl font-display font-bold text-ink transition-colors group-hover:text-gold">{c.title}</h3>
                      {c.excerpt && <p className="mt-2 line-clamp-2 text-sm text-muted">{c.excerpt}</p>}
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
            })}
          </div>
        </section>
      )}

      {featuredItems.length > 0 && (
        <section className="mb-12">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-display font-bold text-ink">Wyróżnione śledztwa</h2>
            <span className="text-sm text-muted">{featuredItems.length} materiałów</span>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredItems.slice(0, 6).map((item) => <ItemCard key={item.key} item={item} />)}
          </div>
        </section>
      )}

      <section>
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-display font-bold text-ink">Wszystkie materiały</h2>
          <div className="flex flex-wrap gap-2">
            {([
              ['all', 'Wszystkie'],
              ['featured', 'Wyróżnione'],
              ['video', 'Wideo'],
            ] as const).map(([v, label]) => (
              <button key={v} type="button" onClick={() => setFilter(v)} className={v === filter ? 'filter-pill active' : 'filter-pill'}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden p-0">
                <div className="aspect-video animate-pulse bg-surface-hover" />
                <div className="space-y-3 p-5">
                  <div className="h-4 w-1/3 animate-pulse rounded bg-surface-hover" />
                  <div className="h-6 w-full animate-pulse rounded bg-surface-hover" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-surface-hover" />
                </div>
              </Card>
            ))}
          </div>
        ) : visible.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((item) => <ItemCard key={item.key} item={item} />)}
          </div>
        ) : (
          <Card className="p-8 md:p-12">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent-dim text-accent">
                <Play className="h-6 w-6 fill-current" />
              </div>
              <h2 className="text-2xl font-display font-bold text-ink">Brak materiałów w tym filtrze</h2>
              <p className="mt-3 text-muted">Zmień filtr lub wróć do wszystkich spraw.</p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <button type="button" onClick={() => setFilter('all')} className="btn btn-primary">Pokaż wszystkie <ArrowRight className="h-4 w-4" /></button>
                <Link to="/informator" className="btn btn-secondary">Masz trop? Napisz</Link>
              </div>
            </div>
          </Card>
        )}
      </section>
    </div>
  );
}
