import { useEffect, useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { FileText, Headphones, Lock, Play } from 'lucide-react';
import { getContentList, type Content } from '@/lib/supabase';
import { formatRelativePL, formatDuration, getYouTubeThumbnail, CONTENT_TYPE_CONFIG, cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { VisibilityBadge, TierBadge } from '@/components/ui/Badge';

function ContentCard({ content }: { content: Content }) {
  const thumbnail = content.thumbnail_url || (content.video_id ? getYouTubeThumbnail(content.video_id) : null);
  const typeConfig = CONTENT_TYPE_CONFIG[content.type];

  return (
    <Link to="/c/$slug" params={{ slug: content.slug }} className="group block">
      <Card variant="hover" padding="none" className="h-full overflow-hidden">
        <div className="relative aspect-video overflow-hidden bg-surface">
          {thumbnail ? (
            <img src={thumbnail} alt={content.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted">
              {content.type === 'video' && <Play className="h-12 w-12 opacity-30" />}
              {content.type === 'audio' && <Headphones className="h-12 w-12 opacity-30" />}
              {content.type === 'post' && <FileText className="h-12 w-12 opacity-30" />}
              {!['video', 'audio', 'post'].includes(content.type) && <span className="text-4xl opacity-30">{typeConfig.icon}</span>}
            </div>
          )}
          {content.duration_seconds && <span className="duration-badge">{formatDuration(content.duration_seconds)}</span>}
          {content.visibility !== 'public' && (
            <span className="premium-badge">
              {content.visibility === 'supporter' ? <><Lock className="h-3 w-3" /> Dla Patronów</> : <><Lock className="h-3 w-3" /> Dla subskrybentów</>}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col p-4">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted">{typeConfig.label}</span>
            <span className="text-muted/50">·</span>
            <span className="text-xs text-muted">{formatRelativePL(content.published_at || content.created_at)}</span>
          </div>
          <h3 className="mb-2 line-clamp-2 text-base font-semibold text-ink transition-colors group-hover:text-gold">{content.title}</h3>
          {content.excerpt && <p className="mb-3 line-clamp-2 text-sm text-muted">{content.excerpt}</p>}
          <div className="mt-auto flex items-center justify-between">
            <VisibilityBadge visibility={content.visibility} />
            {content.visibility === 'supporter' && <TierBadge tier={{ name: 'Patron', slug: 'gold', sort_order: 0 }} />}
          </div>
        </div>
      </Card>
    </Link>
  );
}

const FILTERS = [
  { id: 'all', label: 'Wszystkie' },
  { id: 'video', label: 'Wideo' },
  { id: 'audio', label: 'Podcast' },
  { id: 'post', label: 'Teksty' },
  { id: 'supporter', label: 'Premium' },
] as const;

export function ContentFeedSection({ initial }: { initial: Content[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all');
  const [items, setItems] = useState<Content[]>(initial);

  useEffect(() => {
    setItems(initial);
  }, [initial]);

  useEffect(() => {
    if (filter === 'all') {
      setItems(initial);
      return;
    }
    let cancelled = false;
    const load = async () => {
      if (filter === 'supporter') {
        const data = await getContentList({ visibility: 'supporter', limit: 12 });
        if (!cancelled) setItems(data);
        return;
      }
      const data = await getContentList({ type: filter as 'video' | 'audio' | 'post', limit: 12 });
      if (!cancelled) setItems(data);
    };
    void load();
    return () => { cancelled = true; };
  }, [filter, initial]);

  const filtered = useMemo(() => {
    if (filter === 'all') return initial;
    if (filter === 'supporter') return items.filter((i) => i.visibility === 'supporter');
    return items.filter((i) => i.type === filter);
  }, [filter, initial, items]);

  const list = filter === 'all' ? initial : filtered;

  return (
    <section className="container">
      <h2 className="mb-6 text-2xl font-display font-bold text-ink md:text-3xl">Najnowsze materiały</h2>
      <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
        {FILTERS.map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)} className={cn('filter-pill', filter === f.id && 'active')}>{f.label}</button>
        ))}
      </div>
      {list.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((content) => <ContentCard key={content.id} content={content} />)}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted">Brak materiałów w tej kategorii.</p>
        </Card>
      )}
    </section>
  );
}
