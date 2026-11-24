import { Link, useLoaderData } from '@tanstack/react-router';
import { useState } from 'react';
import { Clock, Eye, Crown, Play } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { getContentList, type Content } from '@/lib/supabase';
import { formatRelativePL, formatDuration, getYouTubeThumbnail, CONTENT_TYPE_CONFIG } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Badge, VisibilityBadge, TierBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export interface IndexLoaderData {
  featured: Content | undefined;
  latest: Content[];
  videos: Content[];
  posts: Content[];
  supporter: Content[];
}

// Loader for TanStack Router
export async function loader(): Promise<IndexLoaderData> {
  const [featured, latest, videos, posts, supporter] = await Promise.all([
    getContentList({ featured: true, limit: 1 }),
    getContentList({ visibility: 'public', limit: 12 }),
    getContentList({ type: 'video', visibility: 'public', limit: 8 }),
    getContentList({ type: 'post', visibility: 'public', limit: 6 }),
    getContentList({ visibility: 'supporter', limit: 4 })
  ]);

  return { featured: featured[0], latest, videos, posts, supporter };
}

function ContentCard({ content, variant = 'default', priority = false }: { content: Content; variant?: 'default' | 'featured' | 'compact'; priority?: boolean }) {
  const { profile } = useAuth();
  const isSupporter = profile?.role === 'supporter' && profile?.subscription_status === 'active';
  const isSubscriber = profile?.role === 'subscriber' || isSupporter;

  // Check access
  const hasAccess = content.visibility === 'public' ||
    (content.visibility === 'subscriber' && isSubscriber) ||
    (content.visibility === 'supporter' && isSupporter);

  const typeConfig = CONTENT_TYPE_CONFIG[content.type];
  const thumbnail = content.thumbnail_url || (content.video_id ? getYouTubeThumbnail(content.video_id) : null);
  const isPremium = content.visibility !== 'public';

  if (variant === 'featured') {
    return (
      <Link to={`/c/${content.slug}`} className="block group" aria-label={content.title}>
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-surface">
          {thumbnail && (
            <img
              src={thumbnail}
              alt=""
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading={priority ? 'eager' : 'lazy'}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-bg/90 via-bg/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-bg/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant={isPremium ? 'premium' : 'new'} dot>
                {isPremium ? 'LOCK Dla Patronów' : 'NEW NOWY MATERIAŁ'}
              </Badge>
              <VisibilityBadge visibility={content.visibility} />
              {content.tier_id && <TierBadge tier={{ name: 'Wspierający', slug: 'gold', sort_order: 30 }} />}
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-ink mb-3 group-hover:text-gold transition-colors line-clamp-2 max-w-2xl">
              {content.title}
            </h2>
            {content.excerpt && (
              <p className="text-muted text-base md:text-lg line-clamp-2 mb-6 max-w-xl">{content.excerpt}</p>
            )}
            <div className="flex items-center gap-4">
              <Button variant="primary" size="lg" leftIcon={<Play className="w-5 h-5" />}>
                ▶ Oglądaj
              </Button>
              {content.duration_seconds && (
                <span className="flex items-center gap-1 text-sm text-muted hidden sm:flex">
                  <Clock className="w-4 h-4" /> {formatDuration(content.duration_seconds)}
                </span>
              )}
            </div>
          </div>
          {!hasAccess && content.visibility !== 'public' && (
            <div className="absolute inset-0 bg-bg/80 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center p-6">
                <Crown className="w-12 h-12 text-gold mx-auto mb-3" />
                <h3 className="text-xl font-display font-bold text-ink mb-2">Treść dla wspierających</h3>
                <p className="text-muted mb-4">Ta treść jest dostępna tylko dla wspierających kanał.</p>
                <Link to="/konto" className="btn btn-primary inline-block">Zostań wspierającym</Link>
              </div>
            </div>
          )}
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link to={`/c/${content.slug}`} className="block group" aria-label={content.title}>
        <div className="flex gap-3">
          <div className="relative w-24 h-16 md:w-28 md:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-surface">
            {thumbnail && (
              <img
                src={thumbnail}
                alt=""
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-bg/80 to-transparent flex items-center justify-center">
              <span className={cn('text-xs font-medium px-2 py-0.5 rounded', typeConfig.bgColor, typeConfig.color)}>
                {typeConfig.label}
              </span>
            </div>
            {!hasAccess && content.visibility !== 'public' && (
              <div className="absolute inset-0 bg-bg/90 flex items-center justify-center">
                <Crown className="w-5 h-5 text-gold" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-ink group-hover:text-gold transition-colors line-clamp-2 mb-1">
              {content.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted">
              <VisibilityBadge visibility={content.visibility} />
              <span>{formatRelativePL(content.published_at || content.created_at)}</span>
              {content.duration_seconds && <span>{formatDuration(content.duration_seconds)}</span>}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default variant - cinematic card
  return (
    <Link to={`/c/${content.slug}`} className="block group" aria-label={content.title}>
      <Card variant="hover" className="h-full flex flex-col overflow-hidden">
        <div className="relative aspect-video overflow-hidden bg-surface">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={content.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading={priority ? 'eager' : 'lazy'}
            />
          ) : (
            <div className="w-full h-full bg-surface flex items-center justify-center text-muted">
              <span className="text-4xl">📄</span>
            </div>
          )}
          {/* Duration badge */}
          {content.duration_seconds && (
            <span className="duration-badge">
              {formatDuration(content.duration_seconds)}
            </span>
          )}
          {/* Premium lock badge */}
          {isPremium && (
            <span className="premium-badge">
              <Crown className="w-3.5 h-3.5" /> Premium
            </span>
          )}
          {/* Type badge */}
          <div className="absolute top-2 left-2 flex gap-1.5">
            <Badge variant="gold" size="sm">{typeConfig.label}</Badge>
            <VisibilityBadge visibility={content.visibility} />
          </div>
          {!hasAccess && content.visibility !== 'public' && (
            <div className="absolute inset-0 bg-bg/80 backdrop-blur-sm flex items-center justify-center">
              <Crown className="w-10 h-10 text-gold" />
            </div>
          )}
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-display font-bold text-lg text-ink group-hover:text-gold transition-colors line-clamp-2 mb-2">
            {content.title}
          </h3>
          {content.excerpt && (
            <p className="text-sm text-muted line-clamp-2 mb-3 flex-1">{content.excerpt}</p>
          )}
          <div className="flex items-center justify-between text-xs text-muted pt-2 border-t border-border">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatRelativePL(content.published_at || content.created_at)}
            </span>
            {content.view_count && (
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> {content.view_count.toLocaleString('pl-PL')}
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}


export function IndexPage() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'video' | 'audio' | 'post' | 'live'>('all');
  // @ts-ignore
  const { featured, latest, videos, posts, supporter } = useLoaderData({ strict: false }) as unknown as IndexLoaderData;
  const { profile, isLoading: authLoading } = useAuth();
  const isSupporter = profile?.role === 'supporter' && profile?.subscription_status === 'active';

  // Filter content based on active filter
  const getFilteredContent = (type: 'video' | 'audio' | 'post' | 'live') => {
    switch (type) {
      case 'video': return videos;
      case 'audio': return []; // placeholder
      case 'post': return posts;
      case 'live': return []; // placeholder
    }
  };

  const filteredContent = activeFilter === 'all' ? latest : getFilteredContent(activeFilter);

  return (
    <div className="space-y-12">
      {/* Hero / Featured */}
      {featured && (
        <section className="relative" aria-labelledby="featured-title">
          <ContentCard content={featured} variant="featured" priority />
        </section>
      )}

      {/* Filter Bar */}
      <section className="section pt-0" aria-label="Filtry treści">
        <div className="container">
          <div className="flex flex-wrap gap-2" role="tablist">
            <button
              role="tab"
              aria-selected={activeFilter === 'all'}
              onClick={() => setActiveFilter('all')}
              className={cn('filter-pill', activeFilter === 'all' && 'active')}
            >
              Wszystkie
            </button>
            <button
              role="tab"
              aria-selected={activeFilter === 'video'}
              onClick={() => setActiveFilter('video')}
              className={cn('filter-pill', activeFilter === 'video' && 'active')}
            >
              <Play className="w-4 h-4" /> Wideo
            </button>
            <button
              role="tab"
              aria-selected={activeFilter === 'audio'}
              onClick={() => setActiveFilter('audio')}
              className={cn('filter-pill', activeFilter === 'audio' && 'active')}
            >
              PODCAST Podcast
            </button>
            <button
              role="tab"
              aria-selected={activeFilter === 'post'}
              onClick={() => setActiveFilter('post')}
              className={cn('filter-pill', activeFilter === 'post' && 'active')}
            >
              TEXT Teksty
            </button>
            {supporter.length > 0 && (
              <button
                role="tab"
                aria-selected={activeFilter === 'live'}
                onClick={() => setActiveFilter('live')}
                className={cn('filter-pill', activeFilter === 'live' && 'active')}
              >
                <Crown className="w-4 h-4" /> Premium
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <section className="section pt-0" aria-labelledby="content-grid-title">
        <div className="container">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredContent.map((item) => (
              <ContentCard key={item.id} content={item} variant="default" />
            ))}
          </div>
          {filteredContent.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-muted">Brak treści w tej kategorii</p>
            </div>
          )}
        </div>
      </section>

      {/* Supporter preview */}
      {supporter.length > 0 && (
        <section className="space-y-4">
          <div className="container">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold text-ink flex items-center gap-2">
                <Crown className="w-6 h-6 text-gold" />
                Dla wspierających
              </h2>
              {isSupporter ? (
                <Link to="/c/wspierajacy" className="text-sm font-medium text-gold hover:text-gold-light">
                  Zobacz wszystko →
                </Link>
              ) : (
                <Link to="/konto" className="btn btn-primary btn-sm">
                  Zostań wspierającym
                </Link>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {supporter.map((item) => (
                <ContentCard key={item.id} content={item} variant="default" />
              ))}
            </div>
            {!isSupporter && (
              <Card className="bg-gold-dim border-gold/30 p-6 text-center">
                <Crown className="w-12 h-12 text-gold mx-auto mb-3" />
                <h3 className="text-xl font-display font-bold text-ink mb-2">Odblokuj ekskluzywne treści</h3>
                <p className="text-muted mb-4">Jako wspierający uzyskasz dostęp do zamkniętych materiałów wideo, audio, PDF oraz wcześniejszego dostępu do nowości.</p>
                <Link to="/konto" className="btn btn-gold">Wybierz plan wsparcia</Link>
              </Card>
            )}
          </div>
        </section>
      )}

      {/* CTA for non-logged users */}
      {authLoading || !profile ? (
        <section className="section">
          <div className="container">
            <Card className="bg-surface-hover border-border text-center py-12 px-6">
              <h2 className="text-xl font-display font-bold text-ink mb-2">Dołącz do społeczności</h2>
              <p className="text-muted mb-6 max-w-md mx-auto">
                Zaloguj się, aby otrzymywać powiadomienia o nowych materiałach, komentować i zapisywać swoje ulubione treści.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="/auth" className="btn btn-primary">Zaloguj się</a>
                <a href="/auth?mode=register" className="btn btn-secondary">Zarejestruj się</a>
              </div>
            </Card>
          </div>
        </section>
      ) : null}
    </div>
  );
}
