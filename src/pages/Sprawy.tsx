import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { ArrowRight, Clock, Eye, Play, Search } from 'lucide-react';
import { getContentList, type Content } from '@/lib/supabase';
import { formatRelativePL, formatDuration, getYouTubeThumbnail, CONTENT_TYPE_CONFIG } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Badge, VisibilityBadge } from '@/components/ui/Badge';

function SprawaCard({ content }: { content: Content }) {
  const typeConfig = CONTENT_TYPE_CONFIG[content.type];
  const thumbnail = content.thumbnail_url || (content.video_id ? getYouTubeThumbnail(content.video_id) : null);

  return (
    <Link to="/c/$slug" params={{ slug: content.slug }} className="group block">
      <Card variant="hover" className="h-full overflow-hidden p-0">
        <div className="relative aspect-video overflow-hidden bg-surface">
          {thumbnail ? (
            <img src={thumbnail} alt={content.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted">
              <Search className="h-10 w-10" />
            </div>
          )}
          {content.duration_seconds && <span className="duration-badge">{formatDuration(content.duration_seconds)}</span>}
          {content.visibility !== 'public' && <span className="premium-badge">Dla Patronów</span>}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="mb-2 flex items-center gap-2 text-xs text-muted">
            <span className="font-medium">{typeConfig.label}</span>
            <span className="text-muted/50">·</span>
            <span>{formatRelativePL(content.published_at || content.created_at)}</span>
          </div>
          <h3 className="mb-2 line-clamp-2 text-lg font-display font-bold text-ink transition-colors group-hover:text-gold">{content.title}</h3>
          {content.excerpt && <p className="mb-4 line-clamp-3 text-sm text-muted">{content.excerpt}</p>}
          <div className="mt-auto flex items-center justify-between border-t border-border pt-3 text-xs text-muted">
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{formatRelativePL(content.published_at || content.created_at)}</span>
            {content.view_count ? <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{content.view_count.toLocaleString('pl-PL')}</span> : <VisibilityBadge visibility={content.visibility} />}
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function SprawyPage() {
  const [items, setItems] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [featured, videos, posts] = await Promise.all([
        getContentList({ featured: true, limit: 12 }),
        getContentList({ type: 'video', limit: 12 }),
        getContentList({ type: 'post', limit: 12 }),
      ]);
      const byId = new Map<string, Content>();
      [...featured, ...videos, ...posts].forEach((item) => byId.set(item.id, item));
      setItems(Array.from(byId.values()).sort((a, b) => (b.published_at || b.created_at).localeCompare(a.published_at || a.created_at)));
      setLoading(false);
    };
    void load();
  }, []);

  return (
    <div className="container py-8 md:py-12">
      <div className="mb-10 max-w-3xl">
        <Badge variant="new" dot>Śledztwa</Badge>
        <h1 className="mt-4 text-3xl font-display font-bold text-ink md:text-4xl">Sprawy</h1>
        <p className="mt-3 text-base text-muted md:text-lg">
          Materiały śledcze, reportaże i sprawy, które wymagają czasu, dokumentów i cierpliwości. Tu trafiają publikacje, które warto śledzić od początku do końca.
        </p>
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
      ) : items.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => <SprawaCard key={item.id} content={item} />)}
        </div>
      ) : (
        <Card className="p-8 md:p-12">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent-dim text-accent">
              <Play className="h-6 w-6 fill-current" />
            </div>
            <h2 className="text-2xl font-display font-bold text-ink">Nowe sprawy już w przygotowaniu</h2>
            <p className="mt-3 text-muted">
              Ta sekcja zbierze materiały śledcze, analizy i reportaże. Gdy tylko nowe publikacje pojawią się w bazie, zobaczysz je tutaj w formie czytelnej listy.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/" className="btn btn-primary">Wróć na stronę główną <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/informator" className="btn btn-secondary">Masz trop? Napisz</Link>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
