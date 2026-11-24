import { Link, useLoaderData } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Clock, Eye, Crown, Play, Headphones, FileText, Lock, ExternalLink } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { getContentList, type Content } from '@/lib/supabase';
import { formatRelativePL, formatDuration, getYouTubeThumbnail, CONTENT_TYPE_CONFIG, cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Badge, VisibilityBadge, TierBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export interface IndexLoaderData {
  featured: Content | undefined;
  latest: Content[];
  videos: Content[];
  posts: Content[];
  supporter: Content[];
}

interface LatestYouTube {
  videoId: string;
  title: string;
  url?: string;
  published?: string;
  thumbnail?: string;
  fetchedAt?: string;
}

const YT_FALLBACK: LatestYouTube = {
  videoId: 'TSSf8OBXykA',
  title: 'Co naprawdę zrobiła Julie K. Brown w sprawie Epsteina?',
  url: 'https://www.youtube.com/watch?v=TSSf8OBXykA',
  published: '',
  thumbnail: 'https://i.ytimg.com/vi/TSSf8OBXykA/hqdefault.jpg',
};

const SOCIALS = [
  {
    label: 'YouTube',
    href: 'https://youtube.com/@piotr_krysiak',
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/piotr_krysiak',
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
    ),
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/share/1DHXKQyD7i/?mibextid=wwXIfr',
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
    ),
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@piotr_krysiak',
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
    ),
  },
];

export async function loader(): Promise<IndexLoaderData> {
  const [featured, latest, videos, posts, supporter] = await Promise.all([
    getContentList({ featured: true, limit: 1 }),
    getContentList({ visibility: 'public', limit: 12 }),
    getContentList({ type: 'video', visibility: 'public', limit: 8 }),
    getContentList({ type: 'post', visibility: 'public', limit: 6 }),
    getContentList({ visibility: 'supporter', limit: 4 }),
  ]);

  return { featured: featured[0], latest, videos, posts, supporter };
}

function SocialBar() {
  return (
    <section className="container" aria-label="Social media Piotra Krysiaka">
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface/70 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-ink">Piotr Krysiak — oficjalna platforma</p>
          <p className="text-xs text-muted">Śledź materiały, kulisy i nowe publikacje w social media.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-bg/40 px-3 py-2 text-sm font-medium text-muted transition-colors hover:border-border-hover hover:text-ink"
            >
              {s.icon}
              <span>{s.label}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function MobileInformatorCard() {
  return (
    <section className="container md:hidden" aria-label="Informator">
      <Link to="/informator" className="block rounded-xl border border-accent/40 bg-accent-dim/40 p-4 transition-colors hover:bg-accent-dim/60">
        <div className="flex items-start gap-3">
          <span className="relative mt-1 flex h-3 w-3 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-accent" />
          </span>
          <div>
            <p className="font-display font-bold text-ink">● Informator</p>
            <p className="mt-1 text-sm text-muted">Masz gorący temat albo breaking news? Napisz do mnie.</p>
          </div>
        </div>
      </Link>
    </section>
  );
}

function LatestYouTubeSection() {
  const [data, setData] = useState<LatestYouTube>(YT_FALLBACK);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch('/latest-youtube.json', { cache: 'no-store' });
        if (!res.ok) throw new Error('fetch failed');
        const json = (await res.json()) as Partial<LatestYouTube>;
        if (mounted && json && typeof json.videoId === 'string' && typeof json.title === 'string') {
          setData({
            videoId: json.videoId,
            title: json.title,
            url: json.url || `https://www.youtube.com/watch?v=${json.videoId}`,
            published: json.published || '',
            thumbnail: json.thumbnail || `https://i.ytimg.com/vi/${json.videoId}/hqdefault.jpg`,
            fetchedAt: json.fetchedAt,
          });
        }
      } catch {
        // keep fallback
      }
    };
    void load();
    return () => { mounted = false; };
  }, []);

  const watchUrl = data.url || `https://www.youtube.com/watch?v=${data.videoId}`;
  const thumb = data.thumbnail || `https://i.ytimg.com/vi/${data.videoId}/hqdefault.jpg`;
  const publishedLabel = data.published ? formatRelativePL(data.published) : null;

  return (
    <section className="container" aria-labelledby="latest-youtube-title">
      <Card className="overflow-hidden p-0">
        <div className="grid gap-0 md:grid-cols-12">
          <a href={watchUrl} target="_blank" rel="noopener noreferrer" className="group relative block md:col-span-5">
            <div className="aspect-video overflow-hidden bg-surface">
              <img src={thumb} alt={data.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg">
                <Play className="ml-0.5 h-6 w-6 fill-current" />
              </span>
            </div>
          </a>
          <div className="flex flex-col justify-center p-6 md:col-span-7 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">Najnowszy odcinek na YouTube</p>
            <h2 id="latest-youtube-title" className="mt-3 text-2xl font-display font-bold text-ink md:text-3xl">
              <a href={watchUrl} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-gold">
                {data.title}
              </a>
            </h2>
            {publishedLabel && <p className="mt-2 text-sm text-muted">Opublikowano: {publishedLabel}</p>}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a href={watchUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary inline-flex items-center gap-2">
                <Play className="h-4 w-4 fill-current" /> Oglądaj na YouTube
              </a>
              <a href="https://youtube.com/@piotr_krysiak" target="_blank" rel="noopener noreferrer" className="btn btn-secondary inline-flex items-center gap-2">
                Kanał <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}

function ContentCard({ content, variant = 'default', priority = false }: { content: Content; variant?: 'default' | 'featured' | 'compact'; priority?: boolean }) {
  const { profile } = useAuth();
  const isSupporter = profile?.role === 'supporter' && profile?.subscription_status === 'active';
  const isSubscriber = profile?.role === 'subscriber' || isSupporter;

  const hasAccess = content.visibility === 'public' ||
    (content.visibility === 'subscriber' && isSubscriber) ||
    (content.visibility === 'supporter' && isSupporter);

  const typeConfig = CONTENT_TYPE_CONFIG[content.type];
  const thumbnail = content.thumbnail_url || (content.video_id ? getYouTubeThumbnail(content.video_id) : null);
  const isPremium = content.visibility !== 'public';

  if (variant === 'featured') {
    return (
      <Link to="/c/$slug" params={{ slug: content.slug }} className="group block" aria-label={content.title}>
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="lg:grid lg:grid-cols-12 lg:items-center">
            <div className="p-6 md:p-8 lg:col-span-6 lg:p-10">
              <div className="relative z-10">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <Badge variant={isPremium ? 'premium' : 'new'} dot>
                    {isPremium ? (<><Lock className="h-3.5 w-3.5" /> Dla Patronów</>) : 'NOWY MATERIAŁ'}
                  </Badge>
                  {content.visibility !== 'public' && <VisibilityBadge visibility={content.visibility} />}
                  {content.tier_id && <TierBadge tier={{ name: 'Wspierający', slug: 'gold', sort_order: 30 }} />}
                </div>
                <h2 className="mb-3 line-clamp-2 max-w-2xl text-2xl font-display font-bold text-ink transition-colors group-hover:text-gold md:text-3xl lg:text-4xl">
                  {content.title}
                </h2>
                {content.excerpt && (
                  <p className="mb-6 line-clamp-2 max-w-xl text-base text-muted md:text-lg">{content.excerpt}</p>
                )}
                <div className="flex items-center gap-4">
                  <Button variant="primary" size="lg" leftIcon={<Play className="h-4 w-4 fill-current" />}>
                    Oglądaj
                  </Button>
                  {content.duration_seconds && (
                    <span className="hidden items-center gap-1 text-sm text-muted sm:flex">
                      <Clock className="h-4 w-4" /> {formatDuration(content.duration_seconds)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="relative lg:col-span-6">
              {thumbnail && (
                <img
                  src={thumbnail}
                  alt=""
                  className="aspect-video max-h-[440px] w-full object-cover object-center lg:h-full lg:min-h-[380px]"
                  loading={priority ? 'eager' : 'lazy'}
                />
              )}
              {!hasAccess && content.visibility !== 'public' && (
                <div className="absolute inset-0 flex items-center justify-center bg-bg/80 backdrop-blur-sm">
                  <div className="p-6 text-center">
                    <Crown className="mx-auto mb-3 h-12 w-12 text-gold" />
                    <h3 className="mb-2 text-xl font-display font-bold text-ink">Treść dla wspierających</h3>
                    <p className="mb-4 text-muted">Ta treść jest dostępna tylko dla wspierających kanał.</p>
                    <Link to="/klub" className="btn btn-primary inline-block">Zostań wspierającym</Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to="/c/$slug" params={{ slug: content.slug }} className="group block" aria-label={content.title}>
      <Card variant="hover" className="flex h-full flex-col overflow-hidden p-0">
        <div className="relative aspect-video overflow-hidden bg-surface">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={content.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading={priority ? 'eager' : 'lazy'}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-surface text-muted">
              <span className="text-4xl">📄</span>
            </div>
          )}
          {content.duration_seconds && <span className="duration-badge">{formatDuration(content.duration_seconds)}</span>}
          {isPremium && <span className="premium-badge"><Lock className="h-3 w-3" /> Dla Patronów</span>}
          {!hasAccess && content.visibility !== 'public' && (
            <div className="absolute inset-0 flex items-center justify-center bg-bg/80 backdrop-blur-sm">
              <Crown className="h-10 w-10 text-gold" />
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-4">
          <div className="mb-1.5 flex items-center gap-2 text-xs text-muted">
            <span className="font-medium text-muted">{typeConfig.label}</span>
            <span className="text-muted/50">·</span>
            <span>{formatRelativePL(content.published_at || content.created_at)}</span>
          </div>
          <h3 className="mb-2 line-clamp-2 flex-1 text-lg font-display font-bold text-ink transition-colors group-hover:text-gold">
            {content.title}
          </h3>
          {content.excerpt && <p className="mb-3 line-clamp-2 flex-1 text-sm text-muted">{content.excerpt}</p>}
          <div className="flex items-center justify-between border-t border-border pt-2 text-xs text-muted">
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{formatRelativePL(content.published_at || content.created_at)}</span>
            {content.view_count ? <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {content.view_count.toLocaleString('pl-PL')}</span> : <VisibilityBadge visibility={content.visibility} />}
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

  const getFilteredContent = (type: 'video' | 'audio' | 'post' | 'supporter') => {
    switch (type) {
      case 'video': return videos;
      case 'audio': return latest.filter((item) => item.type === 'audio');
      case 'post': return posts;
      case 'supporter': return supporter;
    }
  };

  const filteredContent = activeFilter === 'all' ? latest : getFilteredContent(activeFilter);

  return (
    <div className="space-y-8 pb-16 pt-4 md:pt-6">
      <SocialBar />
      <MobileInformatorCard />

      {featured && (
        <section className="container" aria-labelledby="featured-title">
          <ContentCard content={featured} variant="featured" priority />
        </section>
      )}

      <section className="container" aria-label="Filtry treści">
        <div className="flex flex-wrap gap-2" role="tablist">
          <button role="tab" aria-selected={activeFilter === 'all'} onClick={() => setActiveFilter('all')} className={cn('filter-pill', activeFilter === 'all' && 'active')}>Wszystkie</button>
          <button role="tab" aria-selected={activeFilter === 'video'} onClick={() => setActiveFilter('video')} className={cn('filter-pill', activeFilter === 'video' && 'active')}><Play className="h-4 w-4" /> Wideo</button>
          <button role="tab" aria-selected={activeFilter === 'audio'} onClick={() => setActiveFilter('audio')} className={cn('filter-pill', activeFilter === 'audio' && 'active')}><Headphones className="h-4 w-4" /> Podcast</button>
          <button role="tab" aria-selected={activeFilter === 'post'} onClick={() => setActiveFilter('post')} className={cn('filter-pill', activeFilter === 'post' && 'active')}><FileText className="h-4 w-4" /> Teksty</button>
          {supporter.length > 0 && (
            <button role="tab" aria-selected={activeFilter === 'supporter'} onClick={() => setActiveFilter('supporter')} className={cn('filter-pill', activeFilter === 'supporter' && 'active')}><Crown className="h-4 w-4" /> Premium</button>
          )}
        </div>
      </section>

      <section className="container" aria-labelledby="content-grid-title">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredContent.map((item) => <ContentCard key={item.id} content={item} variant="default" />)}
        </div>
        {filteredContent.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted">Brak treści w tej kategorii</p>
          </div>
        )}
      </section>

      {supporter.length > 0 && (
        <section className="container space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-display font-bold text-ink">
              <Crown className="h-6 w-6 text-gold" />
              Dla wspierających
            </h2>
            {isSupporter ? (
              <Link to="/klub" className="text-sm font-medium text-gold hover:text-gold-light">Zobacz wszystko →</Link>
            ) : (
              <Link to="/klub" className="btn btn-primary btn-sm">Zostań wspierającym</Link>
            )}
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {supporter.map((item) => <ContentCard key={item.id} content={item} variant="default" />)}
          </div>
          {!isSupporter && (
            <Card className="border-gold/30 bg-gold-dim p-6 text-center">
              <Crown className="mx-auto mb-3 h-12 w-12 text-gold" />
              <h3 className="mb-2 text-xl font-display font-bold text-ink">Odblokuj ekskluzywne treści</h3>
              <p className="mb-4 text-muted">Jako wspierający uzyskasz dostęp do zamkniętych materiałów wideo, audio, PDF oraz wcześniejszego dostępu do nowości.</p>
              <Link to="/klub" className="btn btn-gold">Wybierz plan wsparcia</Link>
            </Card>
          )}
        </section>
      )}

      <LatestYouTubeSection />

      {(authLoading || !profile) && (
        <section className="container">
          <Card className="bg-surface-hover border-border px-6 py-12 text-center">
            <h2 className="mb-2 text-xl font-display font-bold text-ink">Dołącz do społeczności</h2>
            <p className="mx-auto mb-6 max-w-md text-muted">
              Zaloguj się, aby otrzymywać powiadomienia o nowych materiałach, komentować i zapisywać swoje ulubione treści.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/auth" className="btn btn-primary">Zaloguj się</Link>
              <a href="/auth?mode=register" className="btn btn-secondary">Zarejestruj się</a>
            </div>
          </Card>
        </section>
      )}
    </div>
  );
}
