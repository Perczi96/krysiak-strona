import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowRight, BookOpen, ExternalLink, FileText, FolderSearch, Play, Search, Send, X } from 'lucide-react';
import { getContentList, type Content } from '@/lib/supabase';
import { normalizePl, highlightMatch } from '@/lib/normalizePl';
import { presetTagFromContent } from '@/config/contentPresets';
import { isDossierContent } from '@/types/dossier';
import materialyData from '@/data/materialy.json';
import publikacjeData from '@/data/publikacje.json';

type Category = 'all' | 'materials' | 'sprawy' | 'ksiazki' | 'archiwum';

type SearchItem = {
  id: string;
  category: Exclude<Category, 'all'>;
  badge: string;
  title: string;
  description?: string;
  date?: string;
  href?: string;
  externalUrl?: string;
  keywords: string;
};

type MaterialJson = {
  slug: string;
  videoId?: string;
  tytul: string;
  data?: string;
  dataIso?: string;
  seria?: string;
  sekcja?: string;
  streszczenie?: string;
  youtubeUrl?: string;
  miniatura?: string;
};

type PublikacjeJson = {
  pozycje?: Array<{
    typ?: string;
    tytul?: string;
    medium?: string;
    data?: string;
    url?: string;
    doPotwierdzenia?: boolean;
  }>;
};

let supabaseCache: SearchItem[] | null = null;
let supabaseCachePromise: Promise<SearchItem[]> | null = null;

function contentBadge(c: Content): string {
  if (isDossierContent(c)) return 'Teczka sprawy';
  const preset = presetTagFromContent(c);
  if (preset === 'aktualizacja-sprawy') return 'Aktualizacja';
  if (preset === 'sprawa-sadowa') return 'Sprawa sądowa';
  if (preset === 'kulisy') return 'Kulisy';
  if (c.type === 'video') return 'Wideo';
  if (c.type === 'post') return 'Tekst';
  if (c.type === 'audio') return 'Audio';
  if (c.type === 'pdf') return 'PDF';
  return 'Materiał';
}

function mapSupabase(c: Content): SearchItem {
  const badge = contentBadge(c);
  return {
    id: `db:${c.id}`,
    category: 'materials',
    badge,
    title: c.title,
    description: c.excerpt || undefined,
    date: c.published_at || c.created_at || undefined,
    href: `/c/${c.slug}`,
    keywords: [c.title, c.excerpt, c.slug, badge, (c.meta as any)?.preset, (c.meta as any)?.dossier?.caseCode].filter(Boolean).join(' '),
  };
}

async function loadSupabaseItems(): Promise<SearchItem[]> {
  if (supabaseCache) return supabaseCache;
  if (supabaseCachePromise) return supabaseCachePromise;
  supabaseCachePromise = getContentList({ limit: 200, publishedOnly: true, orderBy: 'published_at' })
    .then((rows) => {
      const items = rows.map(mapSupabase);
      supabaseCache = items;
      return items;
    })
    .catch(() => [])
    .finally(() => { supabaseCachePromise = null; });
  return supabaseCachePromise;
}

function buildLocalItems(): { items: SearchItem[]; counts: { sprawy: number; ksiazki: number; archiwum: number } } {
  const sprawy: SearchItem[] = (materialyData as MaterialJson[]).map((m) => ({
    id: `sprawa:${m.slug || m.videoId || m.tytul}`,
    category: 'sprawy',
    badge: 'Sprawa śledcza',
    title: m.tytul,
    description: m.streszczenie || m.seria || 'Materiał śledczy',
    date: m.dataIso || m.data,
    href: m.youtubeUrl || undefined,
    externalUrl: m.youtubeUrl || undefined,
    keywords: [m.tytul, m.streszczenie, m.seria, m.sekcja, m.data].filter(Boolean).join(' '),
  }));

  const publikacje = (publikacjeData as PublikacjeJson).pozycje || [];
  const ksiazki: SearchItem[] = [];
  const archiwum: SearchItem[] = [];
  for (const p of publikacje) {
    if (p.doPotwierdzenia) continue;
    const base = {
      id: `pub:${p.typ || 'pub'}:${p.url || p.tytul}`,
      title: p.tytul || 'Bez tytułu',
      description: [p.medium, p.data].filter(Boolean).join(' · '),
      date: p.data,
      externalUrl: p.url || undefined,
      keywords: [p.tytul, p.medium, p.data, p.typ].filter(Boolean).join(' '),
    };
    if (p.typ === 'ksiazka') {
      ksiazki.push({ ...base, category: 'ksiazki', badge: 'Książka' });
    } else {
      archiwum.push({ ...base, category: 'archiwum', badge: p.typ === 'tekst' ? 'Tekst' : p.typ === 'wpis' ? 'Wpis' : 'Archiwum' });
    }
  }

  return { items: [...sprawy, ...ksiazki, ...archiwum], counts: { sprawy: sprawy.length, ksiazki: ksiazki.length, archiwum: archiwum.length } };
}

const LOCAL = buildLocalItems();

function badgeClass(badge: string): string {
  if (badge === 'Teczka sprawy') return 'bg-gold-dim text-gold border-gold/30';
  if (badge === 'Książka') return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
  if (badge === 'Sprawa śledcza') return 'bg-accent-dim text-accent border-accent/30';
  if (badge === 'Wideo' || badge === 'Aktualizacja') return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
  return 'bg-surface-hover text-muted border-border';
}

function Highlight({ text, query }: { text: string; query: string }) {
  const parts = highlightMatch(text, query);
  return <>{parts.map((p, i) => p.hit ? <mark key={i} className="bg-gold/25 text-ink rounded-sm px-0.5">{p.text}</mark> : <span key={i}>{p.text}</span>)}</>;
}

export function GlobalSearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category>('all');
  const [supabaseItems, setSupabaseItems] = useState<SearchItem[]>(supabaseCache || []);
  const [loadingSupabase, setLoadingSupabase] = useState(false);
  const [visibleCount, setVisibleCount] = useState(25);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => { document.body.style.overflow = prev; window.clearTimeout(t); };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (supabaseCache) { setSupabaseItems(supabaseCache); return; }
    let cancelled = false;
    setLoadingSupabase(true);
    void loadSupabaseItems().then((items) => { if (!cancelled) setSupabaseItems(items); }).finally(() => { if (!cancelled) setLoadingSupabase(false); });
    return () => { cancelled = true; };
  }, [open]);

  useEffect(() => { setVisibleCount(25); }, [query, category]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); onClose(); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const allItems = useMemo(() => [...supabaseItems, ...LOCAL.items], [supabaseItems]);
  const queryNorm = normalizePl(query);
  const filtered = useMemo(() => {
    if (!queryNorm) return [];
    const byCat = category === 'all' ? allItems : allItems.filter((i) => i.category === category);
    return byCat.filter((i) => normalizePl(i.keywords).includes(queryNorm));
  }, [allItems, category, queryNorm]);

  const counts = useMemo(() => {
    const countFor = (cat: Category) => {
      if (!queryNorm) return 0;
      const byCat = cat === 'all' ? allItems : allItems.filter((i) => i.category === cat);
      return byCat.filter((i) => normalizePl(i.keywords).includes(queryNorm)).length;
    };
    return {
      all: countFor('all'),
      materials: countFor('materials'),
      sprawy: countFor('sprawy'),
      ksiazki: countFor('ksiazki'),
      archiwum: countFor('archiwum'),
    };
  }, [allItems, queryNorm]);

  const visible = filtered.slice(0, visibleCount);
  const totalIndexed = supabaseItems.length + LOCAL.items.length;

  const closeAndReset = () => { onClose(); };

  const openItem = (item: SearchItem) => {
    if (item.externalUrl && !item.href) {
      window.open(item.externalUrl, '_blank', 'noopener,noreferrer');
      closeAndReset();
      return;
    }
    if (item.href) {
      void navigate({ to: item.href as never });
      closeAndReset();
      return;
    }
    if (item.externalUrl) {
      window.open(item.externalUrl, '_blank', 'noopener,noreferrer');
      closeAndReset();
    }
  };

  if (!open) return null;

  const pills: { id: Category; label: string; count: number }[] = [
    { id: 'all', label: 'Wszystko', count: counts.all },
    { id: 'materials', label: 'Teczki i materiały', count: counts.materials },
    { id: 'sprawy', label: 'Sprawy', count: counts.sprawy },
    { id: 'ksiazki', label: 'Książki', count: counts.ksiazki },
    { id: 'archiwum', label: 'Archiwum', count: counts.archiwum },
  ];

  const quickLinks = [
    { label: 'Teczki i sprawy', to: '/sprawy', icon: FolderSearch },
    { label: 'Moje książki', to: '/ksiazki', icon: BookOpen },
    { label: 'Kulisy', to: '/kulisy', icon: Play },
    { label: 'Sprawy sądowe', to: '/sprawy-sadowe', icon: FileText },
    { label: 'Wyślij sygnał', to: '/informator', icon: Send },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center md:p-4 md:pt-[8vh]" role="dialog" aria-modal="true" aria-label="Szukaj w archiwum">
      <button type="button" className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-label="Zamknij wyszukiwarkę" onClick={closeAndReset} />
      <div className="relative flex h-[100dvh] w-full flex-col bg-bg md:h-auto md:max-h-[80dvh] md:max-w-3xl md:rounded-2xl md:border md:border-border md:shadow-2xl">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-5">
          <Search className="h-5 w-5 shrink-0 text-muted" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Szukaj teczek, spraw, książek, publikacji..."
            className="w-full bg-transparent text-base text-ink placeholder:text-muted/70 outline-none"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          {query && <button type="button" onClick={() => setQuery('')} className="rounded-md p-1 text-muted hover:text-ink" aria-label="Wyczyść"><X className="h-4 w-4" /></button>}
          <button type="button" onClick={closeAndReset} className="rounded-md border border-border px-2.5 py-1.5 text-xs text-muted hover:text-ink">Esc</button>
        </div>

        <div className="border-b border-border px-4 py-3 sm:px-5">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {pills.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setCategory(p.id)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors ${category === p.id ? 'border-accent/40 bg-accent/10 text-ink' : 'border-border bg-surface text-muted hover:text-ink'}`}
              >
                {p.label}{queryNorm ? <span className="ml-1.5 font-mono text-xs opacity-80">{p.count}</span> : null}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 pb-safe touch-pan-y sm:px-5" style={{ WebkitOverflowScrolling: 'touch' }}>
          {!queryNorm ? (
            <div className="space-y-6">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Globalna wyszukiwarka</p>
                <h2 className="mt-2 text-xl font-display font-bold text-ink">Przeszukuj teczki, sprawy, książki i archiwum publikacji</h2>
                <p className="mt-2 text-sm text-muted">
                  Zaindeksowane materiały: <span className="font-mono tabular-nums text-ink">{totalIndexed}</span>
                  {loadingSupabase ? <span className="ml-2 text-muted">· ładowanie materiałów z bazy…</span> : null}
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {quickLinks.map((q) => {
                  const Icon = q.icon;
                  return (
                    <button
                      key={q.to}
                      type="button"
                      onClick={() => { void navigate({ to: q.to as never }); closeAndReset(); }}
                      className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-left hover:border-border-hover hover:bg-surface-hover"
                    >
                      <span className="flex items-center gap-3 text-sm font-medium text-ink"><Icon className="h-4 w-4 text-gold" />{q.label}</span>
                      <ArrowRight className="h-4 w-4 text-muted" />
                    </button>
                  );
                })}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-lg font-display font-bold text-ink">Brak wyników</p>
              <p className="mt-2 text-sm text-muted">Nie znaleziono dopasowań dla „{query}”. Spróbuj innej frazy lub zmień kategorię.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted">Znaleziono <span className="font-mono tabular-nums text-ink">{filtered.length}</span> {filtered.length === 1 ? 'wynik' : filtered.length < 5 ? 'wyniki' : 'wyników'}.</p>
              {visible.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openItem(item)}
                  className="flex w-full items-start gap-3 rounded-xl border border-border bg-surface p-4 text-left hover:border-border-hover hover:bg-surface-hover"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${badgeClass(item.badge)}`}>{item.badge}</span>
                      {item.date && <span className="font-mono text-[11px] tabular-nums text-muted">{item.date}</span>}
                      {item.externalUrl && !item.href && <ExternalLink className="h-3.5 w-3.5 text-muted" />}
                    </div>
                    <h3 className="mt-2 text-base font-display font-bold text-ink"><Highlight text={item.title} query={query} /></h3>
                    {item.description && <p className="mt-1 line-clamp-2 text-sm text-muted"><Highlight text={item.description} query={query} /></p>}
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted" />
                </button>
              ))}
              {filtered.length > visibleCount && (
                <button type="button" onClick={() => setVisibleCount((c) => c + 25)} className="btn btn-secondary w-full">Pokaż więcej ({filtered.length - visibleCount})</button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function getSearchIndexCounts() {
  return {
    local: LOCAL.counts,
    localTotal: LOCAL.items.length,
  };
}
