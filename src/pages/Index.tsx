import { Link, useLoaderData } from '@tanstack/react-router';
import { Clock, Eye, Crown } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { getContentList, type Content } from '@/lib/supabase';
import { formatRelativePL, formatDuration, getYouTubeThumbnail, CONTENT_TYPE_CONFIG } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Badge, VisibilityBadge, TierBadge } from '@/components/ui/Badge';
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
    getContentList({ visibility: 'public', limit: 10 }),
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

  if (variant === 'featured') {
    return (
      <Link to={`/c/${content.slug}`} className="block group">
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-panel">
          {thumbnail && (
            <img
              src={thumbnail}
              alt={content.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading={priority ? 'eager' : 'lazy'}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-bg/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="gold" dot>{typeConfig.label}</Badge>
              <VisibilityBadge visibility={content.visibility} />
              {content.tier_id && <TierBadge tier={{ name: 'Wspierający', slug: 'gold', sort_order: 30 }} />}
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-ink mb-2 group-hover:text-gold transition-colors line-clamp-2">
              {content.title}
            </h2>
            {content.excerpt && (
              <p className="text-muted text-base md:text-lg line-clamp-2 mb-4">{content.excerpt}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> {formatRelativePL(content.published_at || content.created_at)}
              </span>
              {content.duration_seconds && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {formatDuration(content.duration_seconds)}
                </span>
              )}
              {content.view_count && (
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" /> {content.view_count.toLocaleString('pl-PL')} wyświetleń
                </span>
              )}
            </div>
          </div>
          {!hasAccess && content.visibility !== 'public' && (
            <div className="absolute inset-0 bg-bg/80 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center p-6">
                <Crown className="w-12 h-12 text-gold mx-auto mb-3" />
                <h3 className="text-xl font-serif font-bold text-ink mb-2">Treść dla wspierających</h3>
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
      <Link to={`/c/${content.slug}`} className="block group">
        <div className="flex gap-3">
          <div className="relative w-24 h-16 md:w-28 md:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-panel">
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
            <p className="text-sm text-muted">{formatRelativePL(content.published_at || content.created_at)}</p>
          </div>
        </div>
      </Link>
    );
  }

  // Default card
  return (
    <Link to={`/c/${content.slug}`} className="block group">
      <Card variant="hover" className="h-full flex flex-col">
        <div className="relative aspect-video overflow-hidden">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={content.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading={priority ? 'eager' : 'lazy'}
            />
          ) : (
            <div className="w-full h-full bg-panel-hover flex items-center justify-center text-muted">
              <span className="text-4xl">📄</span>
            </div>
          )}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant="gold">{typeConfig.label}</Badge>
            <VisibilityBadge visibility={content.visibility} />
          </div>
          {!hasAccess && content.visibility !== 'public' && (
            <div className="absolute inset-0 bg-bg/80 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center">
                <Crown className="w-8 h-8 text-gold mx-auto mb-2" />
                <span className="text-sm text-ink font-medium">Dla wspierających</span>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-serif font-bold text-lg text-ink group-hover:text-gold transition-colors line-clamp-2 mb-2">
            {content.title}
          </h3>
          {content.excerpt && (
            <p className="text-muted text-sm line-clamp-2 mb-3 flex-1">{content.excerpt}</p>
          )}
          <div className="flex items-center justify-between text-xs text-muted">
            <span>{formatRelativePL(content.published_at || content.created_at)}</span>
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

function SectionHeader({ title, href, more }: { title: string; href?: string; more?: string }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl md:text-3xl font-serif font-bold text-ink">{title}</h2>
      {href && (
        <Link to={href} className="text-gold hover:text-gold-light text-sm font-medium flex items-center gap-1 group">
          {more || 'Zobacz wszystkie'}
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </div>
  );
}

export function IndexPage() {
  const { featured, latest, videos, posts, supporter } = useLoaderData({ from: '/' }) as IndexLoaderData;

  return (
    <div className="pb-8">
      {/* Featured Hero */}
      {featured && (
        <section className="section pt-8 md:pt-12">
          <div className="container">
            <ContentCard content={featured} variant="featured" priority />
          </div>
        </section>
      )}

      {/* Latest */}
      <section className="section">
        <div className="container">
          <SectionHeader title="Najnowsze" href="/c/wyroznione" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((content) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        </div>
      </section>

      {/* Videos */}
      <section className="section bg-panel/30">
        <div className="container">
          <SectionHeader title="Wideo" href="/c/filmy" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {videos.map((content) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        </div>
      </section>

      {/* Posts/Articles */}
      <section className="section">
        <div className="container">
          <SectionHeader title="Teksty i analizy" href="/c/teksty" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((content) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        </div>
      </section>

      {/* Supporter-only preview */}
      {supporter.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-ink">Dla wspierających</h2>
                <p className="text-muted mt-1">Ekskluzywne treści dostępne tylko dla wspierających kanał</p>
              </div>
              <Link to="/konto" className="btn btn-primary btn-sm self-start md:self-auto">
                <Crown className="w-4 h-4" /> Zostań wspierającym
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {supporter.map((content) => (
                <ContentCard key={content.id} content={content} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section bg-panel/30">
        <div className="container">
          <Card className="bg-gold/5 border-gold/20 p-6 text-center">
            <Crown className="w-12 h-12 text-gold mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-ink mb-3">Wspieraj niezależne dziennikarstwo</h2>
            <p className="text-muted max-w-2xl mx-auto mb-6">
              Bez Maski to projekt finansowany przez widzów. Twoje wsparcie pozwala mi prowadzić śledztwa,
              tworzyć materiały i mówić prawdę bez kompromisów.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/konto" className="btn btn-primary btn-lg">Zostań wspierającym</Link>
              <a href="https://patronite.pl/krysiak" target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-lg">
                Patronite
              </a>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
