import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { FileText, Inbox, Plus } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { supabase, type Content, type Tier } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toaster';
import { cn } from '@/lib/utils';
import { CONTENT_PRESETS, slugifyPl, type PresetId } from '@/config/contentPresets';
import { AdminContentList } from '@/components/admin/AdminContentList';
import { AdminContentForm, type AdminContentFormValues } from '@/components/admin/AdminContentForm';
import { AdminInformatorTab } from '@/components/admin/AdminInformatorTab';

function toPayload(values: AdminContentFormValues, userId: string) {
  const nowIso = new Date().toISOString();
  const slug = values.slug || slugifyPl(values.title);
  const meta: Record<string, unknown> = {
    preset: values.presetId,
  };
  if (values.presetId === 'kulisy') meta.kulisy_subtype = values.kulisySubtype || 'kulisy-materialu';
  if (values.presetId === 'sprawa-sadowa') {
    meta.case_stage = values.caseStage;
    meta.author_comment = values.authorComment;
  }
  if (values.presetId === 'teczka-sprawy') {
    meta.dossier = values.dossier;
  }
  if (values.presetId === 'od-autora' && values.duration_seconds) {
    // duration stored in column too
  }

  return {
    title: values.title.trim(),
    slug,
    type: values.type,
    visibility: values.visibility,
    tier_id: values.visibility === 'supporter' ? values.tier_id : null,
    excerpt: values.excerpt.trim() || null,
    body_markdown: (values.presetId === 'sprawa-sadowa' ? (values.authorComment || values.body_markdown) : values.body_markdown).trim() || null,
    video_provider: values.video_id ? ('youtube' as const) : null,
    video_id: values.video_id || null,
    thumbnail_url: values.thumbnail_url || (values.video_id ? `https://i.ytimg.com/vi/${values.video_id}/hqdefault.jpg` : null),
    duration_seconds: values.duration_seconds ? parseInt(values.duration_seconds, 10) || null : null,
    is_featured: values.is_featured,
    published_at: values.published ? nowIso : null,
    meta,
    created_by: userId,
  };
}

export function AdminPage() {
  const { profile, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'content' | 'messages'>('content');
  const [contents, setContents] = useState<Content[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editing, setEditing] = useState<Content | null>(null);
  const [initialPreset, setInitialPreset] = useState<PresetId>('dzis');

  const load = async () => {
    setLoading(true);
    const [contentRes, tiersRes] = await Promise.all([
      (supabase as any).from('content').select('*').order('created_at', { ascending: false }).limit(200),
      supabase.from('tiers').select('*').eq('active', true).order('sort_order'),
    ]);
    if (contentRes.error) {
      console.error('load content error', contentRes.error);
      setContents([]);
    } else {
      setContents((contentRes.data || []) as Content[]);
    }
    setTiers((tiersRes.data || []) as Tier[]);
    setLoading(false);
  };

  useEffect(() => {
    if (profile?.role === 'admin') void load();
  }, [profile?.role]);

  const openCreate = (presetId: PresetId) => {
    setEditing(null);
    setInitialPreset(presetId);
    setFormOpen(true);
  };

  const openEdit = (content: Content) => {
    setEditing(content);
    setInitialPreset('dzis');
    setFormOpen(true);
  };

  const handleCreate = async (values: AdminContentFormValues) => {
    if (!profile) return;
    setFormLoading(true);
    const payload = toPayload(values, profile.id);
    const { data, error } = await (supabase as any).from('content').insert(payload).select().single();
    setFormLoading(false);
    if (error) {
      console.error('create error', error);
      toast({ type: 'error', title: 'Błąd', message: error.message || 'Nie udało się zapisać treści.' });
      return;
    }
    setContents((prev) => [data as Content, ...prev]);
    setFormOpen(false);
    toast({ type: 'success', title: 'Zapisano', message: values.published ? 'Materiał został opublikowany.' : 'Szkic został zapisany.' });
  };

  const handleUpdate = async (values: AdminContentFormValues) => {
    if (!profile || !editing) return;
    setFormLoading(true);
    const payload = toPayload(values, profile.id);
    const prevPublished = !!editing.published_at;
    const { data, error } = await (supabase as any).from('content').update({ ...payload, published_at: values.published ? (editing.published_at || new Date().toISOString()) : null }).eq('id', editing.id).select().single();
    setFormLoading(false);
    if (error) {
      console.error('update error', error);
      toast({ type: 'error', title: 'Błąd', message: error.message || 'Nie udało się zapisać zmian.' });
      return;
    }
    setContents((prev) => prev.map((c) => (c.id === editing.id ? (data as Content) : c)));
    setFormOpen(false);
    setEditing(null);
    toast({ type: 'success', title: 'Zapisano', message: !prevPublished && values.published ? 'Materiał został opublikowany.' : 'Zmiany zostały zapisane.' });
  };

  const handleDelete = async (content: Content) => {
    const { error } = await (supabase as any).from('content').delete().eq('id', content.id);
    if (error) {
      console.error('delete error', error);
      toast({ type: 'error', title: 'Błąd', message: 'Nie udało się usunąć materiału.' });
      return;
    }
    setContents((prev) => prev.filter((c) => c.id !== content.id));
    toast({ type: 'success', title: 'Usunięto', message: 'Materiał został usunięty.' });
  };

  if (authLoading) {
    return <div className="container py-8"><div className="h-8 w-48 animate-pulse rounded bg-surface-hover" /></div>;
  }

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="container py-12 text-center">
        <h1 className="mb-4 text-2xl font-display font-bold text-ink">Brak dostępu</h1>
        <p className="mb-6 text-muted">Ta sekcja jest dostępna wyłącznie dla administratorów.</p>
        <Link to="/" className="btn btn-primary">Wróć na stronę główną</Link>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-ink">Panel administratora</h1>
        <p className="mt-2 text-muted">Dodawaj treści szybko i prosto — bez technicznego żargonu.</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button type="button" onClick={() => setActiveTab('content')} className={cn('filter-pill inline-flex items-center gap-2', activeTab === 'content' && 'active')}>
          <FileText className="h-4 w-4" /> Treści
        </button>
        <button type="button" onClick={() => setActiveTab('messages')} className={cn('filter-pill inline-flex items-center gap-2', activeTab === 'messages' && 'active')}>
          <Inbox className="h-4 w-4" /> Zgłoszenia
          {unreadMessages > 0 && <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 py-0.5 text-[11px] font-bold text-white">{unreadMessages}</span>}
        </button>
      </div>

      {activeTab === 'content' ? (
        <>
          <Card className="mb-6 p-5 md:p-6">
            <h2 className="text-lg font-display font-bold text-ink">Co chcesz opublikować?</h2>
            <p className="mt-1 text-sm text-muted">Wybierz typ wpisu. Formularz pokaże tylko potrzebne pola.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {CONTENT_PRESETS.map((preset) => {
                const Icon = preset.icon;
                return (
                  <button key={preset.id} type="button" onClick={() => openCreate(preset.id)}
                    className="flex items-start gap-3 rounded-xl border border-border bg-bg/20 p-4 text-left transition-colors hover:border-gold/40 hover:bg-surface-hover">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold-dim text-gold"><Icon className="h-5 w-5" /></div>
                    <div>
                      <p className="font-semibold text-ink">{preset.label}</p>
                      <p className="mt-1 text-sm text-muted">{preset.shortDescription}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          <AdminContentList
            contents={contents}
            loading={loading}
            onEdit={openEdit}
            onPreview={(c) => window.open(`/c/${c.slug}`, '_blank', 'noopener,noreferrer')}
            onDelete={handleDelete}
          />

          <div className="mt-6 flex justify-end">
            <Button variant="secondary" onClick={() => openCreate('wideo')} leftIcon={<Plus className="h-4 w-4" />}>Szybki nowy wpis</Button>
          </div>
        </>
      ) : (
        <AdminInformatorTab onUnreadChange={setUnreadMessages} />
      )}

      <AdminContentForm
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        content={editing}
        initialPresetId={initialPreset}
        tiers={tiers}
        loading={formLoading}
        onSubmit={editing ? handleUpdate : handleCreate}
      />
    </div>
  );
}
