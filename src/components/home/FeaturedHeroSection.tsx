import { Link } from '@tanstack/react-router';
import { Clock, Eye, Play } from 'lucide-react';
import { type Content } from '@/lib/supabase';
import { formatRelativePL, formatDuration, getYouTubeThumbnail, CONTENT_TYPE_CONFIG } from '@/lib/utils';
import { Badge, VisibilityBadge } from '@/components/ui/Badge';

export function FeaturedHeroSection({ featured }: { featured: Content | undefined }) {
  if (!featured) return null;
  const thumbnail = featured.thumbnail_url || (featured.video_id ? getYouTubeThumbnail(featured.video_id, 'maxres') : null);
  const typeConfig = CONTENT_TYPE_CONFIG[featured.type];

  return (
    <section className="container">
      <div className="card-hover group relative overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="relative aspect-video md:aspect-auto md:min-h-[400px] overflow-hidden">
            {thumbnail ? (
              <img src={thumbnail} alt={featured.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-surface">
                <span className="text-6xl opacity-30">{typeConfig.icon}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-bg" />
            {featured.type === 'video' && featured.video_id && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/90 text-white shadow-lg transition-transform group-hover:scale-110">
                  <Play className="ml-1 h-7 w-7 fill-current" />
                </div>
              </div>
            )}
            {featured.duration_seconds && <span className="duration-badge">{formatDuration(featured.duration_seconds)}</span>}
          </div>
          <div className="flex flex-col justify-center p-6 md:p-10">
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge variant="red" dot>Wyróżnione</Badge>
              <VisibilityBadge visibility={featured.visibility} />
            </div>
            <h1 className="mb-4 text-2xl font-display font-bold leading-tight text-ink md:text-3xl lg:text-4xl">{featured.title}</h1>
            {featured.excerpt && <p className="mb-6 line-clamp-3 text-base text-muted md:text-lg">{featured.excerpt}</p>}
            <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-muted">
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{formatRelativePL(featured.published_at || featured.created_at)}</span>
              <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" />{(featured.view_count || 0).toLocaleString('pl-PL')} wyświetleń</span>
            </div>
            <Link to="/c/$slug" params={{ slug: featured.slug }} className="btn btn-primary w-fit">
              {featured.type === 'video' ? 'Odtwórz teraz' : 'Czytaj więcej'}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
