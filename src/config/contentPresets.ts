import type { LucideIcon } from 'lucide-react';
import { CalendarDays, Video, RefreshCw, Clapperboard, Mic, Scale } from 'lucide-react';
import type { Content } from '@/lib/supabase';

export type PresetId = 'dzis' | 'wideo' | 'aktualizacja-sprawy' | 'kulisy' | 'od-autora' | 'sprawa-sadowa';

export type ContentFormField =
  | 'title'
  | 'excerpt'
  | 'body'
  | 'youtubeUrl'
  | 'duration'
  | 'kulisySubtype'
  | 'caseStage'
  | 'authorComment';

export type VisibilityOption = 'public' | 'subscriber' | 'supporter';

export interface ContentPreset {
  id: PresetId;
  label: string;
  shortDescription: string;
  icon: LucideIcon;
  dbType: Content['type'];
  tag: string; // stored in meta.preset
  defaultVisibility: VisibilityOption;
  fields: ContentFormField[];
  showAdvanced: boolean;
}

export const KULISY_SUBTYPES = [
  { id: 'kulisy-materialu', label: 'Kulisy materiału' },
  { id: 'kulisy-ksiazki', label: 'Kulisy książki' },
  { id: 'z-warsztatu', label: 'Z warsztatu' },
  { id: 'po-publikacji', label: 'Po publikacji' },
  { id: 'z-archiwum', label: 'Z archiwum' },
] as const;

export type KulisySubtypeId = (typeof KULISY_SUBTYPES)[number]['id'];

export const CONTENT_PRESETS: ContentPreset[] = [
  {
    id: 'dzis',
    label: 'Wpis na „Dziś”',
    shortDescription: 'Krótka informacja dnia do sekcji „Co dziś warto wiedzieć”.',
    icon: CalendarDays,
    dbType: 'post',
    tag: 'dzis',
    defaultVisibility: 'public',
    fields: ['title', 'excerpt', 'body'],
    showAdvanced: true,
  },
  {
    id: 'wideo',
    label: 'Wideo / Podcast',
    shortDescription: 'Materiał YouTube lub nagranie wideo/audio z automatyczną miniaturą.',
    icon: Video,
    dbType: 'video',
    tag: 'wideo',
    defaultVisibility: 'public',
    fields: ['title', 'youtubeUrl', 'excerpt', 'body'],
    showAdvanced: true,
  },
  {
    id: 'aktualizacja-sprawy',
    label: 'Aktualizacja sprawy',
    shortDescription: 'Krótka aktualizacja do „Wracam do spraw” i /sprawy.',
    icon: RefreshCw,
    dbType: 'post',
    tag: 'aktualizacja-sprawy',
    defaultVisibility: 'public',
    fields: ['title', 'excerpt', 'body'],
    showAdvanced: true,
  },
  {
    id: 'kulisy',
    label: 'Kulisy',
    shortDescription: 'Wpis do rubryki Kulisy z wyborem podtypu.',
    icon: Clapperboard,
    dbType: 'post',
    tag: 'kulisy',
    defaultVisibility: 'public',
    fields: ['title', 'kulisySubtype', 'excerpt', 'body', 'youtubeUrl'],
    showAdvanced: true,
  },
  {
    id: 'od-autora',
    label: 'Od autora',
    shortDescription: 'Krótki komentarz tekstowy lub audio od Piotra.',
    icon: Mic,
    dbType: 'post',
    tag: 'od-autora',
    defaultVisibility: 'public',
    fields: ['title', 'excerpt', 'body', 'youtubeUrl', 'duration'],
    showAdvanced: true,
  },
  {
    id: 'sprawa-sadowa',
    label: 'Sprawa sądowa',
    shortDescription: 'Etap sprawy, czego dotyczy i komentarz autora.',
    icon: Scale,
    dbType: 'post',
    tag: 'sprawa-sadowa',
    defaultVisibility: 'public',
    fields: ['title', 'caseStage', 'excerpt', 'authorComment', 'body'],
    showAdvanced: true,
  },
];

export function getPresetById(id: PresetId | string | null | undefined): ContentPreset | undefined {
  return CONTENT_PRESETS.find((p) => p.id === id);
}

function metaOf(content: Pick<Content, 'meta'>): Record<string, unknown> {
  return content.meta && typeof content.meta === 'object' && !Array.isArray(content.meta)
    ? (content.meta as Record<string, unknown>)
    : {};
}

export function detectPreset(content: Pick<Content, 'meta' | 'type' | 'is_featured'>): ContentPreset {
  const meta = metaOf(content);
  const presetTag = String(meta.preset || meta.section || '').toLowerCase();
  const byTag = CONTENT_PRESETS.find((p) => p.tag === presetTag);
  if (byTag) return byTag;

  // Heuristics for legacy content
  if (content.type === 'video' || content.type === 'audio') return getPresetById('wideo')!;
  return getPresetById('dzis')!;
}

export function presetTagFromContent(content: Pick<Content, 'meta'>): string | null {
  const meta = metaOf(content);
  const tag = String(meta.preset || meta.section || '').toLowerCase();
  return tag || null;
}

export function getKulisySubtype(content: Pick<Content, 'meta'>): KulisySubtypeId | null {
  const meta = metaOf(content);
  const raw = String(meta.kulisy_subtype || meta.kulisy_category || meta.category || '').toLowerCase();
  return (KULISY_SUBTYPES.find((s) => s.id === raw)?.id as KulisySubtypeId | undefined) ?? null;
}

export function isPublished(content: Pick<Content, 'published_at'>): boolean {
  if (!content.published_at) return false;
  return new Date(content.published_at).getTime() <= Date.now();
}

export function getCaseStage(content: Pick<Content, 'meta' | 'excerpt'>): string {
  const meta = metaOf(content);
  return String(meta.case_stage || meta.etap || content.excerpt || '').trim();
}

export function getAuthorComment(content: Pick<Content, 'meta' | 'body_markdown'>): string {
  const meta = metaOf(content);
  return String(meta.author_comment || meta.komentarz_autora || content.body_markdown || '').trim();
}

export function slugifyPl(input: string): string {
  const map: Record<string, string> = { ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z' };
  return input
    .toLowerCase()
    .replace(/[ąćęłńóśźż]/g, (ch) => map[ch] || ch)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 80);
}

export function extractYouTubeId(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  if (/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw;
  try {
    const url = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
    const host = url.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
    }
    if (host.endsWith('youtube.com')) {
      const v = url.searchParams.get('v');
      if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v;
      const parts = url.pathname.split('/').filter(Boolean);
      const idx = parts.findIndex((p) => ['embed', 'shorts', 'live', 'v'].includes(p));
      const candidate = idx >= 0 ? parts[idx + 1] : null;
      if (candidate && /^[A-Za-z0-9_-]{11}$/.test(candidate)) return candidate;
    }
  } catch { /* ignore */ }
  const m = raw.match(/([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}
