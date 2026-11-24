import { useEffect, useState } from 'react';
import { Archive, CheckCircle2, Inbox, Lock, Mail, RotateCcw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toaster';
import { cn, formatDatePL } from '@/lib/utils';

type InformatorStatus = 'new' | 'read' | 'archived';
interface InformatorMessage {
  id: string;
  subject: string;
  message: string;
  contact: string | null;
  status: InformatorStatus;
  created_at: string;
}

export function AdminInformatorTab({ onUnreadChange }: { onUnreadChange?: (n: number) => void }) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<InformatorMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | InformatorStatus>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from('informator_messages')
      .select('id, subject, message, contact, status, created_at')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('loadMessages error', error);
      toast({ type: 'error', title: 'Błąd', message: 'Nie udało się pobrać zgłoszeń.' });
      setMessages([]);
    } else {
      const list = (data || []) as InformatorMessage[];
      setMessages(list);
      onUnreadChange?.(list.filter((m) => m.status === 'new').length);
    }
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const updateStatus = async (id: string, status: InformatorStatus) => {
    setUpdatingId(id);
    const { error } = await (supabase as any).from('informator_messages').update({ status }).eq('id', id);
    setUpdatingId(null);
    if (error) {
      console.error('updateMessageStatus error', error);
      toast({ type: 'error', title: 'Błąd', message: 'Nie udało się zmienić statusu zgłoszenia.' });
      return;
    }
    setMessages((prev) => {
      const next = prev.map((m) => (m.id === id ? { ...m, status } : m));
      onUnreadChange?.(next.filter((m) => m.status === 'new').length);
      return next;
    });
  };

  const filtered = filter === 'all' ? messages : messages.filter((m) => m.status === filter);
  const statusBadge = (status: InformatorStatus) => {
    if (status === 'new') return <Badge variant="red" dot>Nowe</Badge>;
    if (status === 'read') return <Badge variant="green">Przeczytane</Badge>;
    return <Badge variant="gold">Archiwum</Badge>;
  };

  return (
    <>
      <Card className="mb-6 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-display font-bold text-ink">Zgłoszenia (Informator)</h2>
            <p className="text-sm text-muted">Wiadomości z formularza `/informator`. Najnowsze na górze.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {([['all', 'Wszystkie'], ['new', 'Nowe'], ['read', 'Przeczytane'], ['archived', 'Archiwum']] as const).map(([value, label]) => (
              <button key={value} type="button" onClick={() => setFilter(value)} className={cn('filter-pill', filter === value && 'active')}>{label}</button>
            ))}
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6"><div className="h-5 w-1/3 animate-pulse rounded bg-surface-hover" /><div className="mt-3 h-4 w-full animate-pulse rounded bg-surface-hover" /><div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-surface-hover" /></Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <Inbox className="mx-auto mb-3 h-10 w-10 text-muted" />
          <h3 className="text-lg font-display font-bold text-ink">Brak zgłoszeń</h3>
          <p className="mt-2 text-sm text-muted">{filter === 'all' ? 'Nie ma jeszcze żadnych wiadomości z Informatora.' : 'Brak zgłoszeń w wybranym filtrze.'}</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((msg) => (
            <Card key={msg.id} className="p-5 md:p-6">
              <div className="flex flex-wrap items-center gap-2">
                {statusBadge(msg.status)}
                <span className="text-xs text-muted">{formatDatePL(msg.created_at, 'd MMMM yyyy, HH:mm')}</span>
              </div>
              <h3 className="mt-2 break-words text-lg font-display font-bold text-ink">{msg.subject}</h3>
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
                  {msg.status !== 'read' && <Button variant="secondary" size="sm" onClick={() => void updateStatus(msg.id, 'read')} loading={updatingId === msg.id} leftIcon={<CheckCircle2 className="h-4 w-4" />}>Oznacz jako przeczytane</Button>}
                  {msg.status !== 'archived' && <Button variant="secondary" size="sm" onClick={() => void updateStatus(msg.id, 'archived')} loading={updatingId === msg.id} leftIcon={<Archive className="h-4 w-4" />}>Archiwizuj</Button>}
                  {msg.status !== 'new' && <Button variant="ghost" size="sm" onClick={() => void updateStatus(msg.id, 'new')} loading={updatingId === msg.id} leftIcon={<RotateCcw className="h-4 w-4" />}>Przywróć jako nowe</Button>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
