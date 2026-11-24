import { Link } from '@tanstack/react-router';
import { ArrowRight, Mic } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { Content } from '@/lib/supabase';
import { presetTagFromContent } from '@/config/contentPresets';
import { formatRelativePL, formatDuration } from '@/lib/utils';

export function AuthorNoteSection({ contents }: { contents: Content[] }) {
  const item = contents
    .filter((c) => presetTagFromContent(c) === 'od-autora')
    .sort((a, b) => (b.published_at || b.created_at).localeCompare(a.published_at || a.created_at))[0];

  if (!item) return null;

  return (
    <section className="container">
      <Card className="p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-3xl">
            <Badge variant="gold" dot>Od autora</Badge>
            <h2 className="mt-3 text-2xl font-display font-bold text-ink md:text-3xl">{item.title}</h2>
            {item.excerpt && <p className="mt-3 text-muted">{item.excerpt}</p>}
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted">
              <span>{formatRelativePL(item.published_at || item.created_at)}</span>
              {item.duration_seconds ? <span className="inline-flex items-center gap-1"><Mic className="h-4 w-4" /> {formatDuration(item.duration_seconds)}</span> : null}
            </div>
          </div>
          <Link to="/c/$slug" params={{ slug: item.slug }} className="btn btn-secondary inline-flex shrink-0 items-center gap-2">
            Posłuchaj lub przeczytaj <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Card>
    </section>
  );
}
