import { Link } from '@tanstack/react-router';
import { ArrowRight, Clapperboard } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { Content } from '@/lib/supabase';
import { presetTagFromContent } from '@/config/contentPresets';
import { formatRelativePL, getYouTubeThumbnail } from '@/lib/utils';

export function LatestKulisySection({ contents }: { contents: Content[] }) {
  const item = contents
    .filter((c) => presetTagFromContent(c) === 'kulisy')
    .sort((a, b) => (b.published_at || b.created_at).localeCompare(a.published_at || a.created_at))[0];

  if (!item) return null;
  const thumb = item.thumbnail_url || (item.video_id ? getYouTubeThumbnail(item.video_id) : null);

  return (
    <section className="container">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="gold" dot>Kulisy</Badge>
          <h2 className="mt-3 text-2xl font-display font-bold text-ink md:text-3xl">Za kulisami</h2>
        </div>
        <Link to="/kulisy" className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:text-gold-light">
          Wszystkie kulisy <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <Link to="/c/$slug" params={{ slug: item.slug }} className="group block">
        <Card variant="hover" className="overflow-hidden p-0">
          <div className="grid gap-0 md:grid-cols-12">
            <div className="relative aspect-video bg-surface md:col-span-5">
              {thumb ? (
                <img src={thumb} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              ) : (
                <div className="flex h-full items-center justify-center text-gold"><Clapperboard className="h-12 w-12" /></div>
              )}
            </div>
            <div className="p-6 md:col-span-7 md:p-8">
              <p className="text-xs text-muted">{formatRelativePL(item.published_at || item.created_at)}</p>
              <h3 className="mt-2 text-2xl font-display font-bold text-ink transition-colors group-hover:text-gold">{item.title}</h3>
              {item.excerpt && <p className="mt-3 text-muted line-clamp-3">{item.excerpt}</p>}
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-gold">Czytaj <ArrowRight className="h-4 w-4" /></span>
            </div>
          </div>
        </Card>
      </Link>
    </section>
  );
}
