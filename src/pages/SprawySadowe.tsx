import { useEffect, useState } from 'react';
import { FileText, Gavel, Scale } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getContentList, type Content } from '@/lib/supabase';
import { getAuthorComment, getCaseStage, presetTagFromContent } from '@/config/contentPresets';
import { formatRelativePL } from '@/lib/utils';
import { Link } from '@tanstack/react-router';

export function SprawySadowePage() {
  const [items, setItems] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await getContentList({ type: 'post', limit: 60 });
      setItems(data.filter((c) => presetTagFromContent(c) === 'sprawa-sadowa'));
      setLoading(false);
    };
    void load();
  }, []);

  return (
    <div className="container py-8 md:py-12">
      <div className="mb-10 max-w-3xl">
        <Badge variant="new" dot>Transparentność</Badge>
        <h1 className="mt-4 text-3xl font-display font-bold text-ink md:text-4xl">Moje sprawy sądowe</h1>
        <p className="mt-3 text-base text-muted md:text-lg">
          Postępowania dotyczące moich publikacji i działalności dziennikarskiej.
        </p>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card className="p-5"><Scale className="mb-3 h-6 w-6 text-accent" /><h2 className="font-display font-bold text-ink">Dokument</h2><p className="mt-2 text-sm text-muted">Pisma, orzeczenia i najważniejsze etapy postępowania.</p></Card>
        <Card className="p-5"><Gavel className="mb-3 h-6 w-6 text-gold" /><h2 className="font-display font-bold text-ink">Etap sprawy</h2><p className="mt-2 text-sm text-muted">Co się dzieje teraz, co już się wydarzyło i jaki jest kolejny krok.</p></Card>
        <Card className="p-5"><FileText className="mb-3 h-6 w-6 text-muted" /><h2 className="font-display font-bold text-ink">Komentarz autora</h2><p className="mt-2 text-sm text-muted">Kontekst i wyjaśnienie, oddzielone od samej dokumentacji sprawy.</p></Card>
      </div>

      {loading ? (
        <div className="space-y-6">{[1, 2].map((i) => <Card key={i} className="p-6"><div className="h-6 w-1/3 animate-pulse rounded bg-surface-hover" /><div className="mt-3 h-4 w-full animate-pulse rounded bg-surface-hover" /></Card>)}</div>
      ) : items.length > 0 ? (
        <div className="space-y-6">
          {items.map((item) => {
            const stage = getCaseStage(item) || 'Aktualizacja';
            const comment = getAuthorComment(item) || item.body_markdown || '';
            return (
              <Card key={item.id} className="overflow-hidden p-0">
                <div className="grid gap-0 md:grid-cols-12">
                  <div className="border-b border-border p-6 md:col-span-5 md:border-b-0 md:border-r">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted">Dokument / etap sprawy</p>
                    <h2 className="mt-2 text-xl font-display font-bold text-ink">{item.title}</h2>
                    <div className="mt-4 inline-flex rounded-full border border-border bg-surface-hover px-3 py-1 text-xs font-medium text-muted">{stage}</div>
                    <p className="mt-4 text-xs text-muted">{formatRelativePL(item.published_at || item.created_at)}</p>
                    {item.excerpt && <div className="mt-4 rounded-lg border border-dashed border-border bg-bg/40 p-4 text-sm text-muted">{item.excerpt}</div>}
                  </div>
                  <div className="p-6 md:col-span-7">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gold">Komentarz autora</p>
                    <p className="mt-3 whitespace-pre-wrap text-muted">{comment || 'Komentarz autora zostanie uzupełniony.'}</p>
                    <Link to="/c/$slug" params={{ slug: item.slug }} className="mt-5 inline-flex text-sm font-semibold text-gold hover:text-gold-light">Zobacz szczegóły →</Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-8 md:p-12">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent-dim text-accent"><Scale className="h-6 w-6" /></div>
            <h2 className="text-2xl font-display font-bold text-ink">Brak opublikowanych spraw sądowych</h2>
            <p className="mt-3 text-muted">Gdy w panelu admina pojawi się pierwszy wpis typu „Sprawa sądowa”, zostanie tu pokazany automatycznie w układzie: etap/dokument po lewej, komentarz autora po prawej.</p>
          </div>
        </Card>
      )}
    </div>
  );
}
