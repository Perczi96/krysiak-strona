import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { Content } from '@/lib/supabase';
import { presetTagFromContent } from '@/config/contentPresets';
import { formatRelativePL } from '@/lib/utils';

export function CaseUpdatesSection({ contents }: { contents: Content[] }) {
  const items = contents
    .filter((c) => presetTagFromContent(c) === 'aktualizacja-sprawy')
    .sort((a, b) => (b.published_at || b.created_at).localeCompare(a.published_at || a.created_at))
    .slice(0, 3);

  if (items.length === 0) return null;

  return (
    <section className="container">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="new" dot>Wracam do spraw</Badge>
          <h2 className="mt-3 text-2xl font-display font-bold text-ink md:text-3xl">Aktualizacje spraw</h2>
        </div>
        <Link to="/sprawy" className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:text-gold-light">
          Wszystkie sprawy <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id} variant="hover" className="flex h-full flex-col p-6">
            <span className="inline-flex w-fit rounded-full bg-accent-dim px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-accent">Nowa aktualizacja</span>
            <p className="mt-3 text-xs text-muted">{formatRelativePL(item.published_at || item.created_at)}</p>
            <h3 className="mt-2 text-lg font-display font-bold text-ink">{item.title}</h3>
            {item.excerpt && <p className="mt-2 flex-1 text-sm text-muted line-clamp-3">{item.excerpt}</p>}
            <Link to="/c/$slug" params={{ slug: item.slug }} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-gold hover:text-gold-light">
              Zobacz <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
        ))}
      </div>
    </section>
  );
}
