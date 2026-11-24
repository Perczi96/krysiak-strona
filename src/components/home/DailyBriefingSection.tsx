import { Link } from '@tanstack/react-router';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { Content } from '@/lib/supabase';
import { presetTagFromContent } from '@/config/contentPresets';
import { formatRelativePL } from '@/lib/utils';

export function DailyBriefingSection({ contents }: { contents: Content[] }) {
  const items = contents
    .filter((c) => presetTagFromContent(c) === 'dzis')
    .sort((a, b) => (b.published_at || b.created_at).localeCompare(a.published_at || a.created_at));

  if (items.length === 0) return null;

  const [lead, ...rest] = items;
  const secondary = rest.slice(0, 2);
  const updatedAt = lead.published_at || lead.created_at;

  return (
    <section className="container">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="red" dot>Co dziś warto wiedzieć</Badge>
          <h2 className="mt-3 text-2xl font-display font-bold text-ink md:text-3xl">Dziś</h2>
        </div>
        <p className="text-sm text-muted">Aktualizacja: {formatRelativePL(updatedAt)}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="p-6 md:p-8 lg:col-span-7">
          <div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
            <CalendarDays className="h-4 w-4" /> Najnowszy wpis
          </div>
          <h3 className="text-2xl font-display font-bold text-ink md:text-3xl">{lead.title}</h3>
          {lead.excerpt && <p className="mt-4 text-base leading-relaxed text-muted">{lead.excerpt}</p>}
          <Link to="/c/$slug" params={{ slug: lead.slug }} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-gold hover:text-gold-light">
            Czytaj <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>

        <div className="grid gap-4 lg:col-span-5">
          {secondary.length > 0 ? secondary.map((item) => (
            <Link key={item.id} to="/c/$slug" params={{ slug: item.slug }} className="block">
              <Card variant="hover" className="p-5">
                <p className="text-xs text-muted">{formatRelativePL(item.published_at || item.created_at)}</p>
                <h4 className="mt-2 text-base font-display font-bold text-ink">{item.title}</h4>
                {item.excerpt && <p className="mt-2 line-clamp-2 text-sm text-muted">{item.excerpt}</p>}
              </Card>
            </Link>
          )) : (
            <Card className="flex h-full items-center p-5">
              <p className="text-sm text-muted">Kolejne krótkie aktualizacje dnia pojawią się tutaj, gdy zostaną opublikowane.</p>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
