import { useEffect, useState } from 'react';
import { ChevronDown, Save, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { Content, Tier } from '@/lib/supabase';
import { CONTENT_PRESETS, KULISY_SUBTYPES, detectPreset, extractYouTubeId, getAuthorComment, getCaseStage, getKulisySubtype, getPresetById, slugifyPl, type PresetId } from '@/config/contentPresets';

export interface AdminContentFormValues {
  title: string;
  slug: string;
  presetId: PresetId;
  type: Content['type'];
  visibility: 'public' | 'subscriber' | 'supporter';
  tier_id: string | null;
  excerpt: string;
  body_markdown: string;
  video_provider: 'youtube' | null;
  video_id: string;
  thumbnail_url: string;
  duration_seconds: string;
  is_featured: boolean;
  published: boolean;
  kulisySubtype: string;
  caseStage: string;
  authorComment: string;
}

function toValues(content: Content | null, presetId: PresetId): AdminContentFormValues {
  const preset = getPresetById(presetId)!;
  const meta = (content?.meta && typeof content.meta === 'object' && !Array.isArray(content.meta) ? content.meta : {}) as Record<string, unknown>;
  return {
    title: content?.title || '',
    slug: content?.slug || '',
    presetId,
    type: content?.type || preset.dbType,
    visibility: content?.visibility || preset.defaultVisibility,
    tier_id: content?.tier_id || null,
    excerpt: content?.excerpt || '',
    body_markdown: content?.body_markdown || '',
    video_provider: content?.video_provider === 'youtube' ? 'youtube' : (content?.video_id ? 'youtube' : null),
    video_id: content?.video_id || '',
    thumbnail_url: content?.thumbnail_url || '',
    duration_seconds: content?.duration_seconds ? String(content.duration_seconds) : '',
    is_featured: content?.is_featured || false,
    published: !!content?.published_at,
    kulisySubtype: (getKulisySubtype(content || ({ meta: {} } as Content)) as string) || (String(meta.kulisy_subtype || 'kulisy-materialu')),
    caseStage: content ? getCaseStage(content) : '',
    authorComment: content ? getAuthorComment(content) : '',
  };
}

export function AdminContentForm({
  isOpen,
  onClose,
  content,
  initialPresetId,
  tiers,
  onSubmit,
  loading,
}: {
  isOpen: boolean;
  onClose: () => void;
  content: Content | null;
  initialPresetId: PresetId;
  tiers: Tier[];
  onSubmit: (values: AdminContentFormValues) => Promise<void>;
  loading: boolean;
}) {
  const presetId = content ? detectPreset(content).id : initialPresetId;
  const [values, setValues] = useState<AdminContentFormValues>(() => toValues(content, presetId));
  const [ytInput, setYtInput] = useState(content?.video_id ? `https://www.youtube.com/watch?v=${content.video_id}` : '');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!!content?.slug);

  useEffect(() => {
    const pid = content ? detectPreset(content).id : initialPresetId;
    setValues(toValues(content, pid));
    setYtInput(content?.video_id ? `https://www.youtube.com/watch?v=${content.video_id}` : '');
    setAdvancedOpen(false);
    setSlugTouched(!!content?.slug);
  }, [content, initialPresetId, isOpen]);

  const preset = getPresetById(values.presetId) || CONTENT_PRESETS[0];
  const show = (field: string) => preset.fields.includes(field as any);

  useEffect(() => {
    if (!slugTouched) {
      setValues((v) => ({ ...v, slug: slugifyPl(v.title) }));
    }
  }, [values.title, slugTouched]);

  useEffect(() => {
    const id = extractYouTubeId(ytInput);
    setValues((v) => ({
      ...v,
      video_id: id || '',
      video_provider: id ? 'youtube' : v.video_provider,
      thumbnail_url: id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : v.thumbnail_url,
    }));
  }, [ytInput]);

  const ytPreview = values.video_id ? `https://i.ytimg.com/vi/${values.video_id}/hqdefault.jpg` : null;

  const set = <K extends keyof AdminContentFormValues>(key: K, val: AdminContentFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: val }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ ...values, slug: values.slug || slugifyPl(values.title) });
  };

  const title = content ? `Edytuj: ${preset.label}` : `Nowy wpis: ${preset.label}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-muted">Typ wpisu</label>
          <div className="grid gap-2 sm:grid-cols-2">
            {CONTENT_PRESETS.map((p) => {
              const Icon = p.icon;
              const active = values.presetId === p.id;
              return (
                <button key={p.id} type="button" onClick={() => setValues((v) => ({ ...v, presetId: p.id, type: p.dbType, visibility: content ? v.visibility : p.defaultVisibility }))}
                  className={cn('flex items-start gap-3 rounded-lg border p-3 text-left transition-colors', active ? 'border-gold bg-gold-dim/20' : 'border-border bg-bg/30 hover:border-border-hover')}>
                  <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', active ? 'text-gold' : 'text-muted')} />
                  <div>
                    <p className="text-sm font-semibold text-ink">{p.label}</p>
                    <p className="text-xs text-muted">{p.shortDescription}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-muted">Tytuł *</label>
          <input className="input" value={values.title} onChange={(e) => set('title', e.target.value)} required placeholder="Wpisz jasny tytuł..." />
        </div>

        {show('kulisySubtype') && (
          <div>
            <label className="mb-2 block text-sm font-medium text-muted">Podtyp kulisów</label>
            <div className="flex flex-wrap gap-2">
              {KULISY_SUBTYPES.map((s) => (
                <button key={s.id} type="button" onClick={() => set('kulisySubtype', s.id)} className={cn('filter-pill', values.kulisySubtype === s.id && 'active')}>{s.label}</button>
              ))}
            </div>
          </div>
        )}

        {show('caseStage') && (
          <div>
            <label className="mb-2 block text-sm font-medium text-muted">Etap sprawy / czego dotyczy</label>
            <input className="input" value={values.caseStage} onChange={(e) => set('caseStage', e.target.value)} placeholder="np. Wniosek o apelację, rozprawa, nowe pismo..." />
          </div>
        )}

        {show('youtubeUrl') && (
          <div>
            <label className="mb-2 block text-sm font-medium text-muted">Link YouTube (lub ID)</label>
            <input className="input" value={ytInput} onChange={(e) => setYtInput(e.target.value)} placeholder="https://www.youtube.com/watch?v=... lub youtu.be/..." />
            {ytPreview ? (
              <div className="mt-3 overflow-hidden rounded-lg border border-border bg-bg/30">
                <img src={ytPreview} alt="Podgląd miniatury" className="aspect-video w-full object-cover" />
                <p className="px-3 py-2 text-xs text-muted">Wykryte ID: <span className="font-mono text-ink">{values.video_id}</span></p>
              </div>
            ) : ytInput.trim() ? (
              <p className="mt-2 text-xs text-accent">Nie rozpoznano poprawnego linku/ID YouTube.</p>
            ) : null}
          </div>
        )}

        {show('excerpt') && (
          <div>
            <label className="mb-2 block text-sm font-medium text-muted">Krótki opis / lead</label>
            <textarea className="input min-h-[90px] py-3" value={values.excerpt} onChange={(e) => set('excerpt', e.target.value)} placeholder="Krótko: o czym jest ten wpis?" />
          </div>
        )}

        {show('authorComment') && (
          <div>
            <label className="mb-2 block text-sm font-medium text-muted">Komentarz autora</label>
            <textarea className="input min-h-[120px] py-3" value={values.authorComment} onChange={(e) => set('authorComment', e.target.value)} placeholder="Kontekst, komentarz, wyjaśnienie..." />
          </div>
        )}

        {show('body') && (
          <div>
            <label className="mb-2 block text-sm font-medium text-muted">Treść / rozwinięcie (opcjonalnie)</label>
            <textarea className="input min-h-[140px] py-3" value={values.body_markdown} onChange={(e) => set('body_markdown', e.target.value)} placeholder="Dłuższa treść, notatki, opis..." />
          </div>
        )}

        {show('duration') && (
          <div>
            <label className="mb-2 block text-sm font-medium text-muted">Czas trwania (sekundy, opcjonalnie)</label>
            <input className="input" type="number" min="0" value={values.duration_seconds} onChange={(e) => set('duration_seconds', e.target.value)} placeholder="np. 180" />
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-muted">Dostęp</label>
            <div className="flex flex-wrap gap-2">
              {([['public', 'Publiczne'], ['subscriber', 'Dla zalogowanych'], ['supporter', 'Dla Klubu']] as const).map(([v, label]) => (
                <button key={v} type="button" onClick={() => set('visibility', v)} className={cn('filter-pill', values.visibility === v && 'active')}>{label}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-muted">Status</label>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => set('published', false)} className={cn('filter-pill', !values.published && 'active')}>Szkic</button>
              <button type="button" onClick={() => set('published', true)} className={cn('filter-pill', values.published && 'active')}>Opublikowane</button>
            </div>
          </div>
        </div>

        <label className="flex items-center gap-3 rounded-lg border border-border bg-bg/30 p-3 text-sm text-ink">
          <input type="checkbox" checked={values.is_featured} onChange={(e) => set('is_featured', e.target.checked)} className="h-4 w-4 accent-[var(--color-gold)]" />
          Pokaż jako główny materiał (Hero)
        </label>

        <div className="rounded-lg border border-border bg-bg/20">
          <button type="button" onClick={() => setAdvancedOpen((o) => !o)} className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-muted hover:text-ink">
            Ustawienia zaawansowane (opcjonalnie)
            <ChevronDown className={cn('h-4 w-4 transition-transform', advancedOpen && 'rotate-180')} />
          </button>
          {advancedOpen && (
            <div className="space-y-4 border-t border-border px-4 py-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-muted">Slug (adres URL)</label>
                <input className="input font-mono text-sm" value={values.slug} onChange={(e) => { setSlugTouched(true); set('slug', slugifyPl(e.target.value)); }} placeholder="automatycznie-z-tytulu" />
                <p className="mt-1 text-xs text-muted">Generowany automatycznie z tytułu. Zmieniaj tylko, gdy naprawdę potrzebujesz.</p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-muted">Miniatura (URL, opcjonalnie)</label>
                <input className="input" value={values.thumbnail_url} onChange={(e) => set('thumbnail_url', e.target.value)} placeholder="https://..." />
              </div>
              {values.visibility === 'supporter' && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-muted">Tier (dla Klubu)</label>
                  <select className="input" value={values.tier_id || ''} onChange={(e) => set('tier_id', e.target.value || null)}>
                    <option value="">Brak / dowolny wspierający</option>
                    {tiers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose} leftIcon={<X className="h-4 w-4" />}>Anuluj</Button>
          <Button type="submit" loading={loading} leftIcon={<Save className="h-4 w-4" />}>{content ? 'Zapisz zmiany' : 'Opublikuj / zapisz'}</Button>
        </div>
      </form>
    </Modal>
  );
}
