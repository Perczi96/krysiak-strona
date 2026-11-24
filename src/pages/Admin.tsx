import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { Plus, Search, Edit, Trash2, Eye, Save, Image, Video, FileText, Music, Radio, Globe, Lock, Crown, ArrowLeft, Inbox, Archive, RotateCcw, CheckCircle2, Mail } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { supabase, getContentList, type Content } from '@/lib/supabase';
import { formatDatePL, formatRelativePL, CONTENT_TYPE_CONFIG, slugify, cn } from '@/lib/utils';
import { formatPricePLN } from '@/lib/stripe';
import { useToast } from '@/components/ui/Toaster';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, VisibilityBadge } from '@/components/ui/Badge';
import { Input, Textarea, Label } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const contentSchema = z.object({
  title: z.string().min(3, 'Tytuł musi mieć co najmniej 3 znaki').max(200),
  slug: z.string().min(1, 'Slug jest wymagany').regex(/^[a-z0-9-]+$/, 'Slug może zawierać tylko małe litery, cyfry i myślniki'),
  type: z.enum(['video', 'audio', 'pdf', 'post', 'live']),
  visibility: z.enum(['public', 'subscriber', 'supporter']),
  tier_id: z.string().optional().nullable(),
  excerpt: z.string().max(500).optional().nullable(),
  body_markdown: z.string().optional().nullable(),
  video_provider: z.enum(['youtube', 'bunny', 'vimeo']).optional().nullable(),
  video_id: z.string().optional().nullable(),
  thumbnail_url: z.string().url().optional().nullable(),
  duration_seconds: z.number().int().positive().optional().nullable(),
  file_url: z.string().url().optional().nullable(),
  is_featured: z.boolean().default(false),
  published_at: z.string().optional().nullable(),
  scheduled_at: z.string().optional().nullable(),
  meta: z.record(z.unknown()).optional().nullable(),
});

type ContentFormData = z.infer<typeof contentSchema>;

type InformatorStatus = 'new' | 'read' | 'archived';
interface InformatorMessage {
  id: string;
  subject: string;
  message: string;
  contact: string | null;
  status: InformatorStatus;
  created_at: string;
}

const TYPE_OPTIONS = [
  { value: 'video', label: 'Wideo', icon: Video },
  { value: 'audio', label: 'Audio', icon: Music },
  { value: 'pdf', label: 'PDF', icon: FileText },
  { value: 'post', label: 'Artykuł/Post', icon: Image },
  { value: 'live', label: 'Na żywo', icon: Radio },
];

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Publiczne', icon: Globe },
  { value: 'subscriber', label: 'Zalogowani', icon: Lock },
  { value: 'supporter', label: 'Wspierający', icon: Crown },
];

function AdminHeader() {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-gold mb-2">
          <ArrowLeft className="w-4 h-4" /> Powrót do strony
        </Link>
        <h1 className="text-3xl font-display font-bold text-ink">Panel administracyjny</h1>
        <p className="text-muted mt-1">Zarządzaj treściami, kategoriami i ustawieniami</p>
      </div>
    </div>
  );
}

function ContentTable({ contents, onEdit, onDelete, onView, loading }: {
  contents: Content[];
  onEdit: (content: Content) => void;
  onDelete: (content: Content) => void;
  onView: (content: Content) => void;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-3 font-medium text-muted">Tytuł</th>
              <th className="text-left p-3 font-medium text-muted">Typ</th>
              <th className="text-left p-3 font-medium text-muted">Dostęp</th>
              <th className="text-left p-3 font-medium text-muted">Status</th>
              <th className="text-left p-3 font-medium text-muted">Data</th>
              <th className="text-right p-3 font-medium text-muted">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {[1,2,3,4,5].map(i => (
              <tr key={i} className="border-b border-border animate-pulse">
                <td className="p-3"><div className="h-5 bg-surface-hover rounded w-3/4" /></td>
                <td className="p-3"><div className="h-5 bg-surface-hover rounded w-1/2" /></td>
                <td className="p-3"><div className="h-5 bg-surface-hover rounded w-1/3" /></td>
                <td className="p-3"><div className="h-5 bg-surface-hover rounded w-1/4" /></td>
                <td className="p-3"><div className="h-5 bg-surface-hover rounded w-1/2" /></td>
                <td className="p-3 text-right"><div className="h-5 bg-surface-hover rounded w-24 mx-auto" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (contents.length === 0) {
    return (
      <Card className="py-12 text-center">
        <p className="text-muted">Brak treści. Kliknij "Dodaj treść", aby rozpocząć.</p>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left p-3 font-medium text-muted">Tytuł</th>
            <th className="text-left p-3 font-medium text-muted">Typ</th>
            <th className="text-left p-3 font-medium text-muted">Dostęp</th>
            <th className="text-left p-3 font-medium text-muted">Status</th>
            <th className="text-left p-3 font-medium text-muted">Data</th>
            <th className="text-right p-3 font-medium text-muted">Akcje</th>
          </tr>
        </thead>
        <tbody>
          {contents.map(content => {
            const typeConfig = CONTENT_TYPE_CONFIG[content.type];
            const isPublished = content.published_at && new Date(content.published_at) <= new Date();
            const isScheduled = content.scheduled_at && new Date(content.scheduled_at) > new Date();

            return (
              <tr key={content.id} className="border-b border-border hover:bg-surface-hover/50 transition-colors">
                <td className="p-3">
                  <div className="max-w-xs">
                    <p className="font-medium text-ink truncate">{content.title}</p>
                    <p className="text-xs text-muted truncate">{content.slug}</p>
                  </div>
                </td>
                <td className="p-3">
                  <Badge variant="gold" dot size="sm">
                    {typeConfig.icon} {typeConfig.label}
                  </Badge>
                </td>
                <td className="p-3">
                  <VisibilityBadge visibility={content.visibility} />
                </td>
                <td className="p-3">
                  {isScheduled ? (
                    <Badge variant="blue" size="sm">Zaplanowane</Badge>
                  ) : isPublished ? (
                    <Badge variant="green" size="sm" dot>Opublikowane</Badge>
                  ) : (
                    <Badge variant="muted" size="sm" dot>Wersja robocza</Badge>
                  )}
                  {content.is_featured && <Badge variant="gold" size="sm" className="ml-1">Polecane</Badge>}
                </td>
                <td className="p-3 text-sm text-muted">
                  {content.published_at ? formatDatePL(content.published_at) : formatRelativePL(content.created_at)}
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => onView(content)} aria-label="Podgląd">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onEdit(content)} aria-label="Edytuj">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(content)} aria-label="Usuń">
                      <Trash2 className="w-4 h-4 text-red" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ContentFormModal({ isOpen, onClose, content, onSubmit, loading, tiers }: {
  isOpen: boolean;
  onClose: () => void;
  content: Content | null;
  onSubmit: (data: ContentFormData) => void;
  loading: boolean;
  tiers: any[];
}) {
  const form = useForm<ContentFormData>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      title: '',
      slug: '',
      type: 'post',
      visibility: 'public',
      tier_id: null,
      excerpt: '',
      body_markdown: '',
      video_provider: 'youtube',
      video_id: '',
      thumbnail_url: '',
      duration_seconds: null,
      file_url: '',
      is_featured: false,
      published_at: null,
      scheduled_at: null,
      meta: {},
    },
  });

  useEffect(() => {
    if (content) {
      // Transform meta from DB type to form type
      const metaForForm = content.meta && typeof content.meta === 'object' && !Array.isArray(content.meta)
        ? content.meta as Record<string, unknown>
        : {};
      
      form.reset({
        title: content.title,
        slug: content.slug,
        type: content.type,
        visibility: content.visibility,
        tier_id: content.tier_id,
        excerpt: content.excerpt || '',
        body_markdown: content.body_markdown || '',
        video_provider: content.video_provider || 'youtube',
        video_id: content.video_id || '',
        thumbnail_url: content.thumbnail_url || '',
        duration_seconds: content.duration_seconds,
        file_url: content.file_url || '',
        is_featured: content.is_featured,
        published_at: content.published_at,
        scheduled_at: content.scheduled_at,
        meta: metaForForm,
      });
    } else {
      form.reset({
        title: '',
        slug: '',
        type: 'post',
        visibility: 'public',
        tier_id: null,
        excerpt: '',
        body_markdown: '',
        video_provider: 'youtube',
        video_id: '',
        thumbnail_url: '',
        duration_seconds: null,
        file_url: '',
        is_featured: false,
        published_at: null,
        scheduled_at: null,
        meta: {},
      });
    }
  }, [content, form]);

  const handleSubmit = (data: ContentFormData) => {
    // Auto-generate slug from title if empty
    if (!data.slug && data.title) {
      data.slug = slugify(data.title);
    }
    onSubmit(data);
  };

  const watchedType = form.watch('type');
  const watchedVisibility = form.watch('visibility');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={content ? 'Edytuj treść' : 'Dodaj nową treść'}
      size="full"
      showCloseButton
    >
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto pr-4">
        {/* Row 1: Title & Slug */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Tytuł *"
            value={form.watch('title')}
            onChange={(e) => form.setValue('title', e.target.value)}
            error={form.formState.errors.title?.message}
            placeholder="Tytuł materiału"
          />
          <Input
            label="Slug *"
            value={form.watch('slug')}
            onChange={(e) => form.setValue('slug', e.target.value)}
            error={form.formState.errors.slug?.message}
            placeholder="slug-url"
            hint="Unikalny identyfikator w URL (tylko małe litery, cyfry, myślniki)"
          />
        </div>

        {/* Row 2: Type & Visibility */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Typ treści *</Label>
            <div className="grid grid-cols-3 gap-2">
              {TYPE_OPTIONS.map(opt => {
                const Icon = opt.icon;
                const checked = watchedType === opt.value;
                return (
                  <label key={opt.value} className={cn(
                    'relative cursor-pointer p-3 rounded-lg border-2 transition-all',
                    checked ? 'border-gold bg-gold/5' : 'border-border hover:border-gold/30'
                  )}>
                    <input
                      type="radio"
                      value={opt.value}
                      checked={checked}
                      onChange={(e) => form.setValue('type', e.target.value as any)}
                      className="sr-only"
                    />
                    <div className="flex flex-col items-center gap-2">
                      <Icon className={cn('w-6 h-6', checked ? 'text-gold' : 'text-muted')} />
                      <span className={cn('text-sm font-medium', checked ? 'text-gold' : 'text-ink')}>{opt.label}</span>
                    </div>
                  </label>
                );
              })}
            </div>
            {form.formState.errors.type && <p className="mt-1 text-sm text-red">{form.formState.errors.type.message}</p>}
          </div>

          <div>
            <Label>Dostępność *</Label>
            <div className="grid grid-cols-3 gap-2">
              {VISIBILITY_OPTIONS.map(opt => {
                const Icon = opt.icon;
                const checked = watchedVisibility === opt.value;
                return (
                  <label key={opt.value} className={cn(
                    'relative cursor-pointer p-3 rounded-lg border-2 transition-all',
                    checked ? 'border-gold bg-gold/5' : 'border-border hover:border-gold/30'
                  )}>
                    <input
                      type="radio"
                      value={opt.value}
                      checked={checked}
                      onChange={(e) => form.setValue('visibility', e.target.value as any)}
                      className="sr-only"
                    />
                    <div className="flex flex-col items-center gap-2">
                      <Icon className={cn('w-6 h-6', checked ? 'text-gold' : 'text-muted')} />
                      <span className={cn('text-sm font-medium', checked ? 'text-gold' : 'text-ink')}>{opt.label}</span>
                    </div>
                  </label>
                );
              })}
            </div>
            {form.formState.errors.visibility && <p className="mt-1 text-sm text-red">{form.formState.errors.visibility.message}</p>}
          </div>
        </div>

        {/* Tier selection (only for supporter content) */}
        {watchedVisibility === 'supporter' && tiers.length > 0 && (
          <div>
            <Label>Wymagany tier</Label>
            <select
              {...form.register('tier_id')}
              className="input"
            >
              <option value="">Wybierz tier (opcjonalnie)</option>
              {tiers.map(tier => (
                <option key={tier.id} value={tier.id}>{tier.name} ({formatPricePLN(tier.price_monthly_pln)}/mies)</option>
              ))}
            </select>
          </div>
        )}

        {/* Excerpt */}
        <Textarea
          label="Krótki opis (excerpt)"
          value={form.watch('excerpt') ?? ''}
          onChange={(e) => form.setValue('excerpt', e.target.value)}
          placeholder="Krótki opis widoczny na karcie i w SEO (max 500 znaków)"
          rows={3}
        />

        {/* Video fields */}
        {(watchedType === 'video' || watchedType === 'live') && (
          <div className="space-y-4 border-t border-border pt-6">
            <h3 className="font-medium text-ink">Ustawienia wideo</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Dostawca wideo</Label>
                <select {...form.register('video_provider')} className="input">
                  <option value="youtube">YouTube (unlisted)</option>
                  <option value="bunny">Bunny Stream</option>
                  <option value="vimeo">Vimeo</option>
                </select>
              </div>
              <Input
                label="ID wideo *"
                {...form.register('video_id')}
                placeholder="np. dQw4w9WgXcQ (dla YouTube)"
              />
              <Input
                label="URL miniatury"
                {...form.register('thumbnail_url')}
                placeholder="https://example.com/thumb.jpg"
              />
              <Input
                label="Czas trwania (sekundy)"
                type="number"
                {...form.register('duration_seconds', { valueAsNumber: true })}
                placeholder="3600"
              />
            </div>
          </div>
        )}

        {/* File fields for audio/pdf */}
        {(watchedType === 'audio' || watchedType === 'pdf') && (
          <div className="space-y-4 border-t border-border pt-6">
            <h3 className="font-medium text-ink">Plik</h3>
            <Input
              label="URL pliku *"
              {...form.register('file_url')}
              placeholder="https://example.com/file.mp3 lub .pdf"
            />
            <Input
              label="Czas trwania (sekundy, tylko audio)"
              type="number"
              {...form.register('duration_seconds', { valueAsNumber: true })}
              placeholder="3600"
            />
          </div>
        )}

        {/* Markdown body for posts */}
        {watchedType === 'post' && (
          <div className="border-t border-border pt-6">
            <Label>Treść (Markdown) *</Label>
            <Textarea
              {...form.register('body_markdown')}
              placeholder="Napisz treść w Markdown...\n\n## Nagłówek\n\nTreść artykułu..."
              rows={15}
            />
            <p className="text-xs text-muted mt-1">Obsługiwany: Markdown, tabele, cytaty, listy, linki, obrazy.</p>
          </div>
        )}

        {/* Publishing options */}
        <div className="grid gap-4 sm:grid-cols-3 border-t border-border pt-6">
          <div>
            <Label>Data publikacji</Label>
            <input
              type="datetime-local"
              {...form.register('published_at')}
              className="input"
            />
            <p className="text-xs text-muted mt-1">Puste = wersja robocza. Przeszłość = opublikuj teraz.</p>
          </div>
          <div>
            <Label>Zaplanuj na</Label>
            <input
              type="datetime-local"
              {...form.register('scheduled_at')}
              className="input"
            />
            <p className="text-xs text-muted mt-1">Przyszłość = zaplanuj publikację.</p>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer w-full">
              <input
                type="checkbox"
                {...form.register('is_featured')}
                className="w-4 h-4 rounded border-border bg-panel text-gold focus:ring-gold"
              />
              <span className="text-sm font-medium text-ink">Oznacz jako polecane</span>
            </label>
          </div>
        </div>

        {/* Meta JSON (advanced) */}
        <details className="border-t border-border pt-4">
          <summary className="cursor-pointer font-medium text-muted">Metadane JSON (zaawansowane)</summary>
          <Textarea
            value={form.watch('meta') ? JSON.stringify(form.watch('meta'), null, 2) : ''}
            onChange={(e) => {
              try {
                form.setValue('meta', e.target.value ? JSON.parse(e.target.value) : {}, { shouldValidate: true });
              } catch {
                // Invalid JSON, keep previous value
              }
            }}
            placeholder='{"series_id": "uuid", "episode": 1, "tags": ["tag1", "tag2"]}'
            rows={6}
            className="font-mono text-sm mt-2"
          />
        </details>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Anuluj</Button>
          <Button type="submit" loading={loading}>
            <Save className="w-4 h-4" /> {content ? 'Zapisz zmiany' : 'Utwórz'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function DeleteConfirmModal({ isOpen, onClose, content, onConfirm, loading }: {
  isOpen: boolean;
  onClose: () => void;
  content: Content | null;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Usuń treść"
      description={`Czy na pewno chcesz usunąć "${content?.title}"? Tej operacji nie można cofnąć.`}
      size="sm"
      variant="danger"
    >
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={loading}>Anuluj</Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>Usuń na zawsze</Button>
      </div>
    </Modal>
  );
}

export function AdminPage() {
  const { profile, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('all');
  const [tiers, setTiers] = useState<any[]>([]);

  // Form modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Delete modal state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingContent, setDeletingContent] = useState<Content | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Informator messages
  const [activeTab, setActiveTab] = useState<'content' | 'messages'>('content');
  const [messages, setMessages] = useState<InformatorMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [messageFilter, setMessageFilter] = useState<'all' | InformatorStatus>('all');
  const [updatingMessageId, setUpdatingMessageId] = useState<string | null>(null);

  const loadMessages = async () => {
    setMessagesLoading(true);
    const { data, error } = await (supabase as any)
      .from('informator_messages')
      .select('id, subject, message, contact, status, created_at')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('loadMessages error', error);
      toast({ type: 'error', title: 'Błąd', message: 'Nie udało się pobrać zgłoszeń.' });
      setMessages([]);
    } else {
      setMessages((data || []) as InformatorMessage[]);
    }
    setMessagesLoading(false);
  };

  // Load data
  useEffect(() => {
    const loadData = async () => {
      const [contentData, tierData] = await Promise.all([
        getContentList({ limit: 100 }),
        supabase.from('tiers').select('*').eq('active', true).order('sort_order')
      ]);
      setContents(contentData);
      setTiers(tierData.data || []);
      setLoading(false);
    };
    void loadData();
    void loadMessages();
  }, []);

  const unreadMessagesCount = messages.filter((m) => m.status === 'new').length;
  const filteredMessages = messageFilter === 'all' ? messages : messages.filter((m) => m.status === messageFilter);

  const updateMessageStatus = async (id: string, status: InformatorStatus) => {
    setUpdatingMessageId(id);
    const { error } = await (supabase as any)
      .from('informator_messages')
      .update({ status })
      .eq('id', id);
    setUpdatingMessageId(null);
    if (error) {
      console.error('updateMessageStatus error', error);
      toast({ type: 'error', title: 'Błąd', message: 'Nie udało się zmienić statusu zgłoszenia.' });
      return;
    }
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
  };

  const filteredContents = contents.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || c.type === typeFilter;
    const matchesVisibility = visibilityFilter === 'all' || c.visibility === visibilityFilter;
    return matchesSearch && matchesType && matchesVisibility;
  });

  const handleCreate = async (data: ContentFormData) => {
    setFormLoading(true);
    // Transform data for Supabase
    const insertData = {
      ...data,
      meta: data.meta as any,
    } as any;
    const { error } = await supabase.from('content').insert(insertData);
    setFormLoading(false);
    if (error) {
      toast({ type: 'error', title: 'Błąd', message: error.message });
    } else {
      toast({ type: 'success', title: 'Utworzono', message: 'Treść została dodana' });
      setFormOpen(false);
      setEditingContent(null);
      const newData = await getContentList({ limit: 100 });
      setContents(newData);
    }
  };

  const handleUpdate = async (data: ContentFormData) => {
    if (!editingContent) return;
    setFormLoading(true);
    // Transform data for Supabase
    const updateData = {
      ...data,
      meta: data.meta as any,
    } as any;
    const { error } = await (supabase as any).from('content').update(updateData).eq('id', editingContent.id);
    setFormLoading(false);
    if (error) {
      toast({ type: 'error', title: 'Błąd', message: error.message });
    } else {
      toast({ type: 'success', title: 'Zapisano', message: 'Zmiany zostały zapisane' });
      setFormOpen(false);
      setEditingContent(null);
      const newData = await getContentList({ limit: 100 });
      setContents(newData);
    }
  };

  const handleDelete = async () => {
    if (!deletingContent) return;
    setDeleteLoading(true);
    const { error } = await (supabase as any).from('content').delete().eq('id', deletingContent.id);
    setDeleteLoading(false);
    if (error) {
      toast({ type: 'error', title: 'Błąd', message: error.message });
    } else {
      toast({ type: 'success', title: 'Usunięto', message: 'Treść została usunięta' });
      setDeleteOpen(false);
      setDeletingContent(null);
      setContents(prev => prev.filter(c => c.id !== deletingContent!.id));
    }
  };

  const openEdit = (content: Content) => {
    setEditingContent(content);
    setFormOpen(true);
  };

  const openDelete = (content: Content) => {
    setDeletingContent(content);
    setDeleteOpen(true);
  };

  const openView = (content: Content) => {
    window.open(`/c/${content.slug}`, '_blank');
  };

  const openCreate = () => {
    setEditingContent(null);
    setFormOpen(true);
  };

  if (authLoading) {
    return (
      <div className="container py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-surface-hover rounded" />
          <div className="h-64 bg-surface-hover rounded" />
        </div>
      </div>
    );
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

  const statusBadge = (status: InformatorStatus) => {
    if (status === 'new') return <Badge variant="red" dot>Nowe</Badge>;
    if (status === 'read') return <Badge variant="green">Przeczytane</Badge>;
    return <Badge variant="gold">Archiwum</Badge>;
  };

  return (
    <div className="container py-8">
      <AdminHeader />

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('content')}
          className={cn('filter-pill', activeTab === 'content' && 'active')}
        >
          <FileText className="h-4 w-4" /> Treści
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('messages')}
          className={cn('filter-pill inline-flex items-center gap-2', activeTab === 'messages' && 'active')}
        >
          <Inbox className="h-4 w-4" /> Zgłoszenia
          {unreadMessagesCount > 0 && (
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 py-0.5 text-[11px] font-bold text-white">
              {unreadMessagesCount}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'content' ? (
        <>
          <Card className="mb-6 p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <Button onClick={openCreate} leftIcon={<Plus className="w-4 h-4" />}>
                Dodaj treść
              </Button>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="text"
                    placeholder="Szukaj po tytule lub slugu..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input pl-10"
                  />
                </div>
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input w-auto">
                  <option value="all">Wszystkie typy</option>
                  {TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                <select value={visibilityFilter} onChange={(e) => setVisibilityFilter(e.target.value)} className="input w-auto">
                  <option value="all">Wszystkie dostępności</option>
                  {VISIBILITY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </div>
          </Card>

          <Card>
            <ContentTable
              contents={filteredContents}
              onEdit={openEdit}
              onDelete={openDelete}
              onView={openView}
              loading={loading}
            />
          </Card>

          <div className="mt-4 text-sm text-muted text-center">
            Wyświetlano {filteredContents.length} z {contents.length} treści
          </div>
        </>
      ) : (
        <>
          <Card className="mb-6 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-display font-bold text-ink">Zgłoszenia (Informator)</h2>
                <p className="text-sm text-muted">Wiadomości z formularza `/informator`. Najnowsze na górze.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {([
                  ['all', 'Wszystkie'],
                  ['new', 'Nowe'],
                  ['read', 'Przeczytane'],
                  ['archived', 'Archiwum'],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMessageFilter(value)}
                    className={cn('filter-pill', messageFilter === value && 'active')}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {messagesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6">
                  <div className="h-5 w-1/3 animate-pulse rounded bg-surface-hover" />
                  <div className="mt-3 h-4 w-full animate-pulse rounded bg-surface-hover" />
                  <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-surface-hover" />
                </Card>
              ))}
            </div>
          ) : filteredMessages.length === 0 ? (
            <Card className="p-8 text-center">
              <Inbox className="mx-auto mb-3 h-10 w-10 text-muted" />
              <h3 className="text-lg font-display font-bold text-ink">Brak zgłoszeń</h3>
              <p className="mt-2 text-sm text-muted">
                {messageFilter === 'all'
                  ? 'Nie ma jeszcze żadnych wiadomości z Informatora.'
                  : 'Brak zgłoszeń w wybranym filtrze.'}
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredMessages.map((msg) => (
                <Card key={msg.id} className="p-5 md:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {statusBadge(msg.status)}
                        <span className="text-xs text-muted">{formatDatePL(msg.created_at, 'd MMMM yyyy, HH:mm')}</span>
                      </div>
                      <h3 className="mt-2 break-words text-lg font-display font-bold text-ink">{msg.subject}</h3>
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg border border-border bg-bg/30 p-4">
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-muted">{msg.message}</p>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-muted">
                      {msg.contact ? (
                        <span className="inline-flex items-center gap-2 break-all"><Mail className="h-4 w-4 text-gold" /> {msg.contact}</span>
                      ) : (
                        <span className="inline-flex items-center gap-2"><Lock className="h-4 w-4 text-muted" /> Zgłoszenie anonimowe</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {msg.status !== 'read' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => void updateMessageStatus(msg.id, 'read')}
                          loading={updatingMessageId === msg.id}
                          leftIcon={<CheckCircle2 className="h-4 w-4" />}
                        >
                          Oznacz jako przeczytane
                        </Button>
                      )}
                      {msg.status !== 'archived' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => void updateMessageStatus(msg.id, 'archived')}
                          loading={updatingMessageId === msg.id}
                          leftIcon={<Archive className="h-4 w-4" />}
                        >
                          Archiwizuj
                        </Button>
                      )}
                      {msg.status !== 'new' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void updateMessageStatus(msg.id, 'new')}
                          loading={updatingMessageId === msg.id}
                          leftIcon={<RotateCcw className="h-4 w-4" />}
                        >
                          Przywróć jako nowe
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <ContentFormModal
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditingContent(null); }}
        content={editingContent}
        onSubmit={editingContent ? handleUpdate : handleCreate}
        loading={formLoading}
        tiers={tiers}
      />

      <DeleteConfirmModal
        isOpen={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeletingContent(null); }}
        content={deletingContent}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </div>
  );
}