import { useEffect, useMemo, useState } from 'react';
import { Archive, BookOpen, Camera, Clapperboard, FileEdit, type LucideIcon } from 'lucide-react';
import { getContentList, type Content } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn, formatRelativePL, getYouTubeThumbnail } from '@/lib/utils';
import { Link } from '@tanstack/react-router';
import { getKulisySubtype, presetTagFromContent, type KulisySubtypeId } from '@/config/contentPresets';

type KulisyCategory = KulisySubtypeId;

const CATEGORIES: { id: KulisyCategory; label: string; icon: LucideIcon; description: string }[] = [
  { id: 'kulisy-materialu', label: 'Kulisy materiału', icon: Clapperboard, description: 'Jak powstają reportaże, rozmowy i materiały śledcze.' },
  { id: 'kulisy-ksiazki', label: 'Kulisy książki', icon: BookOpen, description: 'Proces pisania, research, archiwa i decyzje redakcyjne.' },
  { id: 'z-warsztatu', label: 'Z warsztatu', icon: FileEdit, description: 'Narzędzia, metody pracy i dziennikarskie kulisy rzemiosła.' },
  { id: 'po-publikacji', label: 'Po publikacji', icon: Camera, description: 'Co dzieje się po emisji: reakcje, ślady, konsekwencje.' },
  { id: 'z-archiwum', label: 'Z archiwum', icon: Archive, description: 'Materiały, notatki i historie, które wracają po latach.' },
];

function contentCategory(content: Content): KulisyCategory | null {
  const tag = presetTagFromContent(content);
  if (tag === 'kulisy') return getKulisySubtype(content) || 'kulisy-materialu';
  const meta = (content.meta && typeof content.meta === 'object' && !Array.isArray(content.meta) ? content.meta : {}) as Record<string, unknown>;
  const raw = String(meta.kulisy_category || meta.category || meta.section || '').toLowerCase();
  if ((CATEGORIES.map((c) => c.id) as string[]).includes(raw)) return raw as KulisyCategory;
  const haystack = `${content.slug} ${content.title} ${content.excerpt || ''}`.toLowerCase();
  if (haystack.includes('książ') || haystack.includes('ksiaz')) return 'kulisy-ksiazki';
  if (haystack.includes('archiw')) return 'z-archiwum';
  if (haystack.includes('publikac')) return 'po-publikacji';
  if (haystack.includes('warsztat')) return 'z-warsztatu';
  if (haystack.includes('kulisy')) return 'kulisy-materialu';
  return null;
}

export function KulisyPage() {
  const [active, setActive] = useState<KulisyCategory>('kulisy-materialu');
  const [items, setItems] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [posts, videos] = await Promise.all([
        getContentList({ type: 'post', limit: 60 }),
        getContentList({ type: 'video', limit: 30 }),
      ]);
      const byId = new Map<string, Content>();
      [...posts, ...videos].forEach((item) => byId.set(item.id, item));
      setItems(Array.from(byId.values()));
      setLoading(false);
    };
    void load();
  }, []);

  const filtered = useMemo(() => {
    return items
      .filter((item) => contentCategory(item) === active)
      .sort((a, b) => (b.published_at || b.created_at).localeCompare(a.published_at || a.created_at));
  }, [items, active]);

  const activeMeta = CATEGORIES.find((c) => c.id === active)!;

  return (
    <div className="container py-8 md:py-12">
      <div className="mb-8 max-w-3xl">
        <Badge variant="gold" dot>Kulisy</Badge>
        <h1 className="mt-4 text-3xl font-display font-bold text-ink md:text-4xl">Kulisy</h1>
        <p className="mt-3 text-base text-muted md:text-lg">
          Zaplecze pracy dziennikarskiej: co dzieje się przed publikacją, co po niej i jakie historie kryją się za materiałami oraz książkami.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label="Kategorie kulisów">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const selected = active === cat.id;
          return (
            <button key={cat.id} role="tab" aria-selected={selected} onClick={() => setActive(cat.id)} className={cn('filter-pill', selected && 'active')}>
              <Icon className="h-4 w-4" /> {cat.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6"><div className="h-5 w-1/2 animate-pulse rounded bg-surface-hover" /><div className="mt-3 h-4 w-full animate-pulse rounded bg-surface-hover" /><div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-surface-hover" /></Card>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => {
            const thumb = item.thumbnail_url || (item.video_id ? getYouTubeThumbnail(item.video_id) : null);
            return (
              <Link key={item.id} to="/c/$slug" params={{ slug: item.slug }} className="group block">
                <Card variant="hover" className="h-full overflow-hidden p-0">
                  {thumb && <div className="aspect-video overflow-hidden bg-surface"><img src={thumb} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" /></div>}
                  <div className="p-5">
                    <p className="mb-2 text-xs text-muted">{formatRelativePL(item.published_at || item.created_at)}</p>
                    <h3 className="line-clamp-2 text-lg font-display font-bold text-ink transition-colors group-hover:text-gold">{item.title}</h3>
                    {item.excerpt && <p className="mt-2 line-clamp-3 text-sm text-muted">{item.excerpt}</p>}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card className="p-8 md:p-12">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold-dim text-gold"><activeMeta.icon className="h-6 w-6" /></div>
            <h2 className="text-2xl font-display font-bold text-ink">{activeMeta.label}</h2>
            <p className="mt-3 text-muted">{activeMeta.description}</p>
            <p className="mt-4 text-sm text-muted">Wpisy z tej rubryki pojawią się tutaj, gdy zostaną opublikowane w panelu admina (preset „Kulisy”).</p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/sprawy" className="btn btn-primary">Zobacz sprawy</Link>
              <Link to="/" className="btn btn-secondary">Strona główna</Link>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
