import { useMemo, useState } from 'react';
import { Edit, Eye, Search, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, VisibilityBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { cn, formatDatePL } from '@/lib/utils';
import type { Content } from '@/lib/supabase';
import { CONTENT_PRESETS, detectPreset } from '@/config/contentPresets';

type StatusFilter = 'all' | 'published' | 'draft';

export function AdminContentList({
  contents,
  loading,
  onEdit,
  onDelete,
  onPreview,
}: {
  contents: Content[];
  loading: boolean;
  onEdit: (c: Content) => void;
  onDelete: (c: Content) => Promise<void>;
  onPreview: (c: Content) => void;
}) {
  const [search, setSearch] = useState('');
  const [presetFilter, setPresetFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [confirm, setConfirm] = useState<Content | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return contents.filter((c) => {
      const preset = detectPreset(c);
      const isPublished = !!c.published_at;
      if (q && !c.title.toLowerCase().includes(q) && !c.slug.toLowerCase().includes(q)) return false;
      if (presetFilter !== 'all' && preset.id !== presetFilter) return false;
      if (statusFilter === 'published' && !isPublished) return false;
      if (statusFilter === 'draft' && isPublished) return false;
      return true;
    });
  }, [contents, search, presetFilter, statusFilter]);

  const confirmDelete = async () => {
    if (!confirm) return;
    setDeleting(true);
    await onDelete(confirm);
    setDeleting(false);
    setConfirm(null);
  };

  return (
    <>
      <Card className="mb-6 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input className="input pl-10" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Szukaj po tytule lub slugu..." />
          </div>
          <select className="input w-full lg:w-auto" value={presetFilter} onChange={(e) => setPresetFilter(e.target.value)}>
            <option value="all">Wszystkie typy</option>
            {CONTENT_PRESETS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
          <div className="flex flex-wrap gap-2">
            {([['all', 'Wszystkie'], ['published', 'Opublikowane'], ['draft', 'Szkice']] as const).map(([v, label]) => (
              <button key={v} type="button" onClick={() => setStatusFilter(v)} className={cn('filter-pill', statusFilter === v && 'active')}>{label}</button>
            ))}
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map((i) => <Card key={i} className="p-5"><div className="h-5 w-1/2 animate-pulse rounded bg-surface-hover" /><div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-surface-hover" /></Card>)}</div>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center"><h3 className="text-lg font-display font-bold text-ink">Brak treści</h3><p className="mt-2 text-sm text-muted">Nie znaleziono treści dla wybranych filtrów.</p></Card>
      ) : (
        <>
          <div className="hidden md:block">
            <Card className="overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="border-b border-border bg-bg/30 text-muted">
                    <tr>
                      <th className="px-4 py-3 font-medium">Tytuł</th>
                      <th className="px-4 py-3 font-medium">Typ</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Dostęp</th>
                      <th className="px-4 py-3 font-medium">Data</th>
                      <th className="px-4 py-3 font-medium">Akcje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c) => {
                      const preset = detectPreset(c);
                      const isPublished = !!c.published_at;
                      return (
                        <tr key={c.id} className="border-b border-border/60 align-top last:border-0">
                          <td className="px-4 py-4">
                            <p className="font-semibold text-ink">{c.title}</p>
                            <p className="mt-1 font-mono text-xs text-muted">{c.slug}</p>
                          </td>
                          <td className="px-4 py-4"><span className="text-muted">{preset.label}</span></td>
                          <td className="px-4 py-4">{isPublished ? <Badge variant="green">Opublikowane</Badge> : <Badge variant="gold">Szkic</Badge>}</td>
                          <td className="px-4 py-4"><VisibilityBadge visibility={c.visibility} /></td>
                          <td className="px-4 py-4 text-muted">{formatDatePL(c.published_at || c.created_at, 'd MMM yyyy')}</td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-2">
                              <Button variant="secondary" size="sm" onClick={() => onPreview(c)} leftIcon={<Eye className="h-4 w-4" />}>Podgląd</Button>
                              <Button variant="secondary" size="sm" onClick={() => onEdit(c)} leftIcon={<Edit className="h-4 w-4" />}>Edytuj</Button>
                              <Button variant="ghost" size="sm" onClick={() => setConfirm(c)} leftIcon={<Trash2 className="h-4 w-4" />}>Usuń</Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <div className="space-y-4 md:hidden">
            {filtered.map((c) => {
              const preset = detectPreset(c);
              const isPublished = !!c.published_at;
              return (
                <Card key={c.id} className="p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {isPublished ? <Badge variant="green">Opublikowane</Badge> : <Badge variant="gold">Szkic</Badge>}
                    <VisibilityBadge visibility={c.visibility} />
                    <span className="text-xs text-muted">{preset.label}</span>
                  </div>
                  <h3 className="mt-3 text-base font-display font-bold text-ink">{c.title}</h3>
                  <p className="mt-1 text-xs text-muted">{formatDatePL(c.published_at || c.created_at, 'd MMM yyyy, HH:mm')}</p>
                  <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <Button variant="secondary" size="sm" onClick={() => onPreview(c)} leftIcon={<Eye className="h-4 w-4" />}>Podgląd</Button>
                    <Button variant="secondary" size="sm" onClick={() => onEdit(c)} leftIcon={<Edit className="h-4 w-4" />}>Edytuj</Button>
                    <Button variant="ghost" size="sm" onClick={() => setConfirm(c)} leftIcon={<Trash2 className="h-4 w-4" />}>Usuń</Button>
                  </div>
                </Card>
              );
            })}
          </div>
          <p className="mt-4 text-center text-sm text-muted">Wyświetlano {filtered.length} z {contents.length} treści</p>
        </>
      )}

      <Modal isOpen={!!confirm} onClose={() => setConfirm(null)} title="Na pewno usunąć?" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-muted">Ta akcja usunie materiał: <span className="font-semibold text-ink">{confirm?.title}</span>. Tej operacji nie da się cofnąć.</p>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setConfirm(null)}>Anuluj</Button>
            <Button variant="primary" className="!bg-accent hover:!bg-accent-hover" loading={deleting} onClick={() => void confirmDelete()} leftIcon={<Trash2 className="h-4 w-4" />}>Usuń materiał</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
