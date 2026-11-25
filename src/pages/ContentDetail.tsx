import { Link, useParams } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Eye, Crown, Flag, MessageSquare, ChevronDown, Shield } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { getContentBySlug, getComments, addComment, subscribeToComments, incrementViewCount, type Content, type Comment } from '@/lib/supabase';
import { formatDatePL, formatDateTimePL, formatRelativePL, formatDuration, getYouTubeEmbedUrl, CONTENT_TYPE_CONFIG, cn } from '@/lib/utils';
import { useToast } from '@/components/ui/Toaster';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, VisibilityBadge, TierBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { MarkdownRenderer } from '@/components/content/MarkdownRenderer';
import { DossierView } from '@/components/dossier/DossierView';
import { isDossierContent } from '@/types/dossier';
import { ReadingProgressBar } from '@/components/ui/ReadingProgressBar';

interface CommentWithUser extends Comment {
  user?: { display_name: string | null; avatar_url: string | null; role: 'guest' | 'subscriber' | 'supporter' | 'admin'; };
}

function ContentHeader({ content }: { content: Content }) {
  const { profile } = useAuth();
  const isSupporter = profile?.role === 'supporter' && profile?.subscription_status === 'active';
  const isSubscriber = profile?.role === 'subscriber' || isSupporter;
  const typeConfig = CONTENT_TYPE_CONFIG[content.type];
  const hasAccess = content.visibility === 'public' || (content.visibility === 'subscriber' && isSubscriber) || (content.visibility === 'supporter' && isSupporter);

  return (
    <article className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="gold" dot>{typeConfig.label}</Badge>
        <VisibilityBadge visibility={content.visibility} />
        {content.tier_id && <TierBadge tier={{ name: 'Wspierający', slug: 'gold', sort_order: 30 }} />}
      </div>
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-ink leading-tight">{content.title}</h1>
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
        <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{content.published_at ? formatDatePL(content.published_at!) : formatRelativePL(content.created_at)}</span>
        {content.duration_seconds && <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{formatDuration(content.duration_seconds)}</span>}
        {content.view_count !== undefined && <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{content.view_count.toLocaleString('pl-PL')} wyświetleń</span>}
      </div>
      {!hasAccess && content.visibility !== 'public' && (
        <Card className="bg-gold-dim border-gold/30 p-6 text-center">
          <Crown className="w-12 h-12 text-gold mx-auto mb-3" />
          <h3 className="text-xl font-display font-bold text-ink mb-2">Treść dla wspierających</h3>
          <p className="text-muted mb-4">Ta treść jest dostępna tylko dla wspierających kanał.</p>
          <Link to="/konto" className="btn btn-gold inline-block">Zostań wspierającym</Link>
        </Card>
      )}
    </article>
  );
}

function VideoPlayerWrapper({ content }: { content: Content }) {
  const videoId = content.video_id;
  const provider = content.video_provider || 'youtube';
  if (!videoId) return null;
  if (provider === 'youtube') {
    return (
      <div className="aspect-video rounded-xl overflow-hidden bg-surface">
        <iframe src={getYouTubeEmbedUrl(videoId, { autoplay: '0' })} title={content.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen className="w-full h-full" />
      </div>
    );
  }
  return <div className="aspect-video rounded-xl bg-surface flex items-center justify-center"><p className="text-muted">Odtwarzacz {provider} - wymaga konfiguracji</p></div>;
}

function ContentBody({ content }: { content: Content }) {
  if (content.type === 'video' || content.type === 'live') return <VideoPlayerWrapper content={content} />;
  if (content.type === 'post' && content.body_markdown) return <MarkdownRenderer content={content.body_markdown} />;
  if (content.type === 'pdf' && content.file_url) return <div className="aspect-video rounded-xl bg-surface flex items-center justify-center"><iframe src={`https://docs.google.com/viewer?url=${encodeURIComponent(content.file_url)}&embedded=true`} className="w-full h-full rounded-xl" title={content.title} /></div>;
  if (content.type === 'audio') return <div className="bg-surface rounded-xl p-4"><audio controls className="w-full" src={content.file_url ?? ''} /></div>;
  return <Card className="prose"><p className="text-muted">Brak treści do wyświetlenia.</p></Card>;
}

function CommentsSection({ contentId }: { contentId: string }) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [replies, setReplies] = useState<Record<string, CommentWithUser[]>>({});
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => { const data = await getComments(contentId); setComments(data as CommentWithUser[]); };
    void load();
    const channel = subscribeToComments(contentId, (newCommentRow) => {
      const comment = newCommentRow as CommentWithUser;
      if (!comment.parent_id) setComments(prev => [comment, ...prev]);
      else { const parentId = comment.parent_id; setReplies(prev => ({ ...prev, [parentId]: [...(prev[parentId] || []), comment] })); }
    });
    return () => { channel.unsubscribe(); };
  }, [contentId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || loading) return;
    if (!profile) { toast({ type: 'error', title: 'Wymagane logowanie', message: 'Zaloguj się, aby dodać komentarz' }); return; }
    setLoading(true);
    const comment = await addComment(contentId, newComment.trim()) as CommentWithUser | null;
    setLoading(false);
    if (comment) { setNewComment(''); toast({ type: 'success', title: 'Komentarz dodany' }); }
    else toast({ type: 'error', title: 'Błąd', message: 'Nie udało się dodać komentarza' });
  };

  const handleReply = async (parentId: string) => {
    if (!replyText.trim() || loading || !profile) return;
    setLoading(true);
    const { supabase } = await import('@/lib/supabase');
    const { data, error } = await (supabase as any).from('comments').insert({ content_id: contentId, user_id: profile.id, parent_id: parentId, body: replyText.trim() }).select().single();
    setLoading(false);
    if (!error && data) { setReplies(prev => ({ ...prev, [parentId]: [...(prev[parentId] || []), data as CommentWithUser] })); setReplyText(''); setReplyingTo(null); }
  };

  const CommentItem = ({ comment, depth = 0 }: { comment: CommentWithUser; depth?: number }) => {
    const commentReplies = replies[comment.id] || [];
    const hasReplies = commentReplies.length > 0;
    const isExpanded = expandedReplies.has(comment.id);
    return (
      <div className={cn('flex gap-3', depth > 0 && 'ml-8 border-l-2 border-border pl-4')}>
        <Avatar imgSrc={comment.user?.avatar_url} name={comment.user?.display_name} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-ink">{comment.user?.display_name || 'Użytkownik'}</span>
            <span className="text-xs text-muted">{formatRelativePL(comment.created_at)}</span>
            {comment.user?.role === 'supporter' && <Crown className="w-4 h-4 text-gold" />}
            {comment.user?.role === 'admin' && <Badge variant="red" size="sm">Admin</Badge>}
          </div>
          <p className="text-muted mb-2">{comment.body}</p>
          <div className="flex items-center gap-3 text-xs text-muted">
            {hasReplies && <button onClick={() => setExpandedReplies(prev => { const n = new Set(prev); n.has(comment.id) ? n.delete(comment.id) : n.add(comment.id); return n; })} className="flex items-center gap-1 hover:text-gold transition-colors"><ChevronDown className={cn('w-4 h-4', isExpanded && 'rotate-180')} />{isExpanded ? 'Zwiń' : 'Rozwiń'} odpowiedzi ({commentReplies.length})</button>}
            {!replyingTo && <button onClick={() => setReplyingTo(comment.id)} className="hover:text-gold transition-colors">Odpowiedz</button>}
          </div>
          {replyingTo === comment.id && (
            <form onSubmit={(e) => { e.preventDefault(); void handleReply(comment.id); }} className="mt-2 flex gap-2">
              <input type="text" value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Napisz odpowiedź..." className="flex-1 input py-2 text-sm" autoFocus />
              <Button type="submit" size="sm" loading={loading}>Wyślij</Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => { setReplyingTo(null); setReplyText(''); }}>Anuluj</Button>
            </form>
          )}
          {isExpanded && hasReplies && <div className="mt-3 space-y-3">{commentReplies.map(reply => <CommentItem key={reply.id} comment={reply} depth={depth + 1} />)}</div>}
        </div>
      </div>
    );
  };

  return (
    <section className="space-y-6" aria-labelledby="comments-title">
      <h2 id="comments-title" className="text-xl font-display font-bold text-ink flex items-center gap-2"><MessageSquare className="w-6 h-6 text-gold" />Komentarze ({comments.length})</h2>
      {profile && (
        <Card className="p-4">
          <form onSubmit={handleSubmitComment} className="flex gap-3">
            <Avatar imgSrc={profile.avatar_url} name={profile.display_name} size="sm" />
            <div className="flex-1">
              <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Napisz komentarz..." className="input min-h-[80px] resize-y mb-2" rows={3} />
              <div className="flex justify-end"><Button type="submit" size="sm" loading={loading}>Komentuj</Button></div>
            </div>
          </form>
        </Card>
      )}
      {comments.length === 0 ? (
        <Card className="py-8 text-center"><MessageSquare className="w-12 h-12 text-muted mx-auto mb-3" /><h3 className="text-lg font-medium text-ink mb-1">Brak komentarzy</h3><p className="text-muted">Bądź pierwszy, kto skomentuje ten materiał!</p></Card>
      ) : (
        <div className="space-y-6">{comments.map(comment => <CommentItem key={comment.id} comment={comment} />)}</div>
      )}
    </section>
  );
}

function ShareButtons({ content }: { content: Content }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/c/${content.slug}`;
  const handleShare = async (platform: 'twitter' | 'facebook' | 'linkedin' | 'copy') => {
    if (platform === 'twitter') window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(content.title)}&url=${encodeURIComponent(url)}`, '_blank', 'width=550,height=420');
    else if (platform === 'facebook') window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'width=550,height=420');
    else if (platform === 'linkedin') window.open(`https://www.linkedin.com/sharing/share-offsite/?u=${encodeURIComponent(url)}`, '_blank', 'width=550,height=420');
    else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted">Udostępnij:</span>
      <Button variant="ghost" size="sm" onClick={() => handleShare('twitter')} aria-label="Udostępnij na X"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></Button>
      <Button variant="ghost" size="sm" onClick={() => handleShare('facebook')} aria-label="Udostępnij na Facebook"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></Button>
      <Button variant="ghost" size="sm" onClick={() => handleShare('copy')} aria-label="Skopiuj link">{copied ? <ChevronDown className="w-5 h-5 text-green" /> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>}{copied && <span className="text-xs text-green">Skopiowano!</span>}</Button>
    </div>
  );
}

export function ContentDetailPage() {
  const { slug } = useParams({ strict: false });
  const { toast } = useToast();
  const { profile } = useAuth();
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');

  useEffect(() => {
    const loadContent = async () => {
      if (!slug) return;
      setLoading(true);
      const data = await getContentBySlug(slug);
      setContent(data);
      if (data?.published_at) await incrementViewCount(data.id);
      setLoading(false);
    };
    void loadContent();
  }, [slug]);

  if (loading) {
    return <div className="container py-12"><div className="animate-pulse space-y-6"><div className="h-8 bg-surface-hover rounded w-1/3" /><div className="aspect-video bg-surface-hover rounded-xl" /></div></div>;
  }

  const isAdmin = profile?.role === 'admin';
  const isDraft = !!content && !content.published_at;
  if (!content || (isDraft && !isAdmin)) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-display font-bold text-ink mb-4">Nie znaleziono materiału</h1>
        <p className="text-muted mb-6">Ten materiał nie istnieje lub został usunięty.</p>
        <Link to="/" className="btn btn-primary">Wróć na stronę główną</Link>
      </div>
    );
  }

  const isSupporter = profile?.role === 'supporter' && profile?.subscription_status === 'active';
  const isSubscriber = profile?.role === 'subscriber' || isSupporter;
  const hasAccess = content.visibility === 'public' || (content.visibility === 'subscriber' && isSubscriber) || (content.visibility === 'supporter' && isSupporter);
  const dossier = isDossierContent(content);

  if (dossier) {
    return (
      <div className="container py-6 md:py-10">
        <ReadingProgressBar />
        {isDraft && isAdmin && (
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2"><Shield className="h-4 w-4" /><span className="font-semibold">TRYB PODGLĄDU SZKICU — widoczny tylko dla administratora</span></div>
            <Link to="/admin" className="btn btn-secondary btn-sm">Wróć do /admin</Link>
          </div>
        )}
        <DossierView content={content} hasFullAccess={hasAccess || isAdmin} />
      </div>
    );
  }

  return (
    <div className="container">
      <ReadingProgressBar />
      {isDraft && isAdmin && (
        <div className="mb-6 mt-6 flex flex-col gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2"><Shield className="h-4 w-4" /><span className="font-semibold">TRYB PODGLĄDU SZKICU — widoczny tylko dla administratora</span></div>
          <Link to="/admin" className="btn btn-secondary btn-sm">Wróć do /admin</Link>
        </div>
      )}
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-gold mb-6"><ArrowLeft className="w-4 h-4" /> Powrót</Link>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <ContentHeader content={content} />
          {(content.type === 'video' || content.type === 'live') && hasAccess && <VideoPlayerWrapper content={content} />}
          <ContentBody content={content} />
          <Card className="flex items-center justify-between p-4"><div className="flex items-center gap-4 text-sm text-muted">{content.excerpt && <span className="line-clamp-2 max-w-xs">{content.excerpt}</span>}</div><ShareButtons content={content} /></Card>
          {content.visibility !== 'supporter' || hasAccess ? <CommentsSection contentId={content.id} /> : (
            <Card className="bg-gold-dim border-gold/30 p-6 text-center"><MessageSquare className="w-12 h-12 text-gold mx-auto mb-3" /><h3 className="text-xl font-display font-bold text-ink mb-2">Komentarze dla wspierających</h3><p className="text-muted mb-4">Zostań wspierającym, aby uczestniczyć w dyskusji.</p><Link to="/konto" className="btn btn-gold">Wybierz plan wsparcia</Link></Card>
          )}
        </div>
        <div className="space-y-6">
          <Card>
            <h3 className="font-semibold text-ink mb-4">Informacje</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Typ</dt><dd className="text-ink font-medium">{CONTENT_TYPE_CONFIG[content.type].label}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Dostępność</dt><dd className="flex items-center gap-1"><VisibilityBadge visibility={content.visibility} /></dd></div>
              {content.published_at && <div className="flex justify-between"><dt className="text-muted">Opublikowano</dt><dd className="text-ink">{formatDateTimePL(content.published_at!)}</dd></div>}
              {content.duration_seconds && <div className="flex justify-between"><dt className="text-muted">Czas trwania</dt><dd className="text-ink">{formatDuration(content.duration_seconds)}</dd></div>}
              {content.view_count !== undefined && <div className="flex justify-between"><dt className="text-muted">Wyświetleń</dt><dd className="text-ink">{content.view_count.toLocaleString('pl-PL')}</dd></div>}
            </dl>
          </Card>
          <Button variant="ghost" className="w-full justify-start" onClick={() => setReportModalOpen(true)} leftIcon={<Flag className="w-4 h-4" />}>Zgłoś problem</Button>
          <Card><h3 className="font-semibold text-ink mb-4">Podobne materiały</h3><p className="text-sm text-muted text-center py-4">Sekcja w budowie</p></Card>
        </div>
      </div>
      <Modal isOpen={reportModalOpen} onClose={() => { setReportModalOpen(false); setReportReason(''); }} title="Zgłoś problem" description="Pomóż nam utrzymać jakość treści" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-muted">Wybierz powód zgłoszenia:</p>
          <select value={reportReason} onChange={(e) => setReportReason(e.target.value)} className="input">
            <option value="">Wybierz powód</option>
            <option value="spam">Spam / reklama</option>
            <option value="inappropriate">Niewłaściwa treść</option>
            <option value="copyright">Naruszenie praw autorskich</option>
            <option value="misinformation">Dezinformacja</option>
            <option value="technical">Problem techniczny (nie działa odtwarzacz)</option>
            <option value="other">Inne</option>
          </select>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => { setReportModalOpen(false); setReportReason(''); }}>Anuluj</Button>
            <Button onClick={() => { toast({ type: 'success', title: 'Zgłoszenie wysłane', message: 'Dziękujemy za dbałość o społeczność' }); setReportModalOpen(false); setReportReason(''); }} disabled={!reportReason}>Wyślij zgłoszenie</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export async function loader({ params }: { params: { slug: string } }) {
  const content = await getContentBySlug(params.slug);
  return { content };
}
