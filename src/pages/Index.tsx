import { Link, useLoaderData } from '@tanstack/react-router';
import { useState } from 'react';
import { Clock, Eye, Crown, Play, Headphones, FileText, Lock } from 'lucide-react';
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
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <div className="lg:grid lg:grid-cols-12 lg:items-center">
            {/* Left column - content */}
            <div className="lg:col-span-6 p-6 md:p-8 lg:p-10">
              <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-transparent opacity-30 pointer-events-none lg:hidden" />
              <div className="relative z-10">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Badge variant={isPremium ? 'premium' : 'new'} dot>
                    {isPremium ? (
                      <>
                        <Lock className="w-3.5 h-3.5" /> Dla Patronów
                      </>
                    ) : (
                      'NOWY MATERIAŁ'
                    )}
                  </Badge>
                  {content.visibility !== 'public' && <VisibilityBadge visibility={content.visibility} />}
                  {content.tier_id && <TierBadge tier={{ name: 'Wspierający', slug: 'gold', sort_order: 30 }} />}
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-ink mb-3 group-hover:text-gold transition-colors line-clamp-2 max-w-2xl">
                  {content.title}
                </h2>
                {content.excerpt && (
                  <p className="text-muted text-base md:text-lg line-clamp-2 mb-6 max-w-xl">{content.excerpt}</p>
                )}
                <div className="flex items-center gap-4">
                  <Button variant="primary" size="lg" leftIcon={<Play className="w-4 h-4 fill-current" />}>
                    Oglądaj
                  </Button>
                  {content.duration_seconds && (
                    <span className="flex items-center gap-1 text-sm text-muted hidden sm:flex">
                      <Clock className="w-4 h-4" /> {formatDuration(content.duration_seconds)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right column - thumbnail */}
            <div className="lg:col-span-6 relative">
              {thumbnail && (
                <img
                  src={thumbnail}
                  alt=""
                  className="w-full h-full object-cover aspect-video lg:h-full lg:min-h-[380px] max-h-[440px] object-center"
                  loading={priority ? 'eager' : 'lazy'}
                />
              )}
              {!hasAccess && content.visibility !== 'public' && (
                <div className="absolute inset-0 bg-bg/80 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center p-6">
                    <Crown className="w-12 h-12 text-gold mx-auto mb-3" />
                    <h3 className="text-xl font-display font-bold text-ink mb-2">Treść dla wspierających</h3>
                    <p className="text-muted mb-4">Ta treść jest dostępna tylko dla wspierających kanał.</p>
                    <button 
                      onClick={(e) => { e.preventDefault(); window.location.href = '/konto'; }}
                      className="btn btn-primary inline-block"
                    >
                      Zostań wspierającym
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
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
      <Card variant="hover" className="h-full flex flex-col overflow-hidden p-0">
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
              <Lock className="w-3 h-3" /> Dla Patronów
            </span>
          )}
          {/* Type label moved to footer */}
          {!hasAccess && content.visibility !== 'public' && (
            <div className="absolute inset-0 bg-bg/80 backdrop-blur-sm flex items-center justify-center">
              <Crown className="w-10 h-10 text-gold" />
            </div>
          )}
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex items-center gap-2 text-xs text-muted mb-1.5">
            <span className="font-medium text-muted">{typeConfig.label}</span>
            <span className="text-muted/50">·</span>
            <span>{formatRelativePL(content.published_at || content.created_at)}</span>
          </div>
          <h3 className="font-display font-bold text-lg text-ink group-hover:text-gold transition-colors line-clamp-2 mb-2 flex-1">
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
  const [activeFilter, setActiveFilter] = useState<'all' | 'video' | 'audio' | 'post' | 'supporter'>('all');
  // @ts-ignore
  const { featured, latest, videos, posts, supporter } = useLoaderData({ strict: false }) as unknown as IndexLoaderData;
  const { profile, isLoading: authLoading } = useAuth();
  const isSupporter = profile?.role === 'supporter' && profile?.subscription_status === 'active';

  // Filter content based on active filter
  const getFilteredContent = (type: 'video' | 'audio' | 'post' | 'supporter') => {
    switch (type) {
      case 'video': return videos;
      case 'audio': return latest.filter(item => item.type === 'audio');
      case 'post': return posts;
      case 'supporter': return supporter;
    }
  };

  const filteredContent = activeFilter === 'all' ? latest : getFilteredContent(activeFilter);

  return (
    <div className="pt-4 md:pt-6 pb-16 space-y-8">
      {/* Hero / Featured */}
      {featured && (
        <section className="relative" aria-labelledby="featured-title">
          <ContentCard content={featured} variant="featured" priority />
        </section>
      )}

      {/* Filter Bar */}
      <section className="container" aria-label="Filtry treści">
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
            <Headphones className="w-4 h-4" /> Podcast
          </button>
          <button
            role="tab"
            aria-selected={activeFilter === 'post'}
            onClick={() => setActiveFilter('post')}
            className={cn('filter-pill', activeFilter === 'post' && 'active')}
          >
            <FileText className="w-4 h-4" /> Teksty
          </button>
          {supporter.length > 0 && (
            <button
              role="tab"
              aria-selected={activeFilter === 'supporter'}
              onClick={() => setActiveFilter('supporter')}
              className={cn('filter-pill', activeFilter === 'supporter' && 'active')}
            >
              <Crown className="w-4 h-4" /> Premium
            </button>
          )}
        </div>
      </section>

      {/* Content Grid */}
      <section className="container" aria-labelledby="content-grid-title">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredContent.map((item) => (
            <ContentCard key={item.id} content={item} variant="default" />
          ))}
        </div>
        {filteredContent.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-muted">Brak treści w tej kategorii</p>
          </div>
        )}
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
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
        <section className="container">
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
        </section>
      ) : null}
    </div>
  );
}
