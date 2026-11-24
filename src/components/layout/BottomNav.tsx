import { Link, useLocation } from '@tanstack/react-router';
import { BookOpen, Crown, FileText, Home, LogIn, MoreHorizontal, Scale, Search, User, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/useAuth';

export function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  const items = [
    { href: '/', label: 'Dziś', icon: Home },
    { href: '/sprawy', label: 'Sprawy', icon: Search },
    { href: '/kulisy', label: 'Kulisy', icon: FileText },
    { href: '/klub', label: 'Klub', icon: Crown },
  ];

  const isActive = (href: string) => location.pathname === href || (href !== '/' && location.pathname.startsWith(href));
  const moreActive = ['/ksiazki', '/sprawy-sadowe', '/poznaj-mnie', '/informator', '/konto', '/auth'].some((p) => location.pathname === p || location.pathname.startsWith(p));

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface/95 pb-safe backdrop-blur-lg md:hidden"
        aria-label="Nawigacja dolna"
      >
        <div className="grid grid-cols-5">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 px-2 py-2.5 transition-colors',
                  active ? 'text-accent' : 'text-muted hover:text-ink',
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className={cn('h-6 w-6', active && 'fill-current')} aria-hidden="true" />
                <span className="text-[11px] font-medium">{item.label}</span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={cn(
              'flex flex-col items-center justify-center gap-1 px-2 py-2.5 transition-colors',
              moreActive || moreOpen ? 'text-accent' : 'text-muted hover:text-ink',
            )}
            aria-expanded={moreOpen}
            aria-haspopup="dialog"
          >
            <MoreHorizontal className="h-6 w-6" aria-hidden="true" />
            <span className="text-[11px] font-medium">Więcej</span>
          </button>
        </div>
      </nav>

      {moreOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/55 md:hidden" onClick={() => setMoreOpen(false)} />
          <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-border bg-surface p-4 pb-safe shadow-2xl md:hidden animate-slide-up" role="dialog" aria-label="Więcej">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-ink">Więcej</p>
                <p className="text-xs text-muted">Szybki dostęp do sekcji Bez Maski</p>
              </div>
              <button onClick={() => setMoreOpen(false)} className="rounded-lg p-2 text-muted hover:bg-surface-hover hover:text-ink" aria-label="Zamknij">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-2">
              <Link to="/ksiazki" onClick={() => setMoreOpen(false)} className="flex items-center gap-3 rounded-xl border border-border bg-bg/30 px-4 py-3 text-sm font-medium text-ink hover:border-border-hover hover:bg-surface-hover">
                <BookOpen className="h-5 w-5 text-gold" /> Moje książki
              </Link>
              <Link to="/sprawy-sadowe" onClick={() => setMoreOpen(false)} className="flex items-center gap-3 rounded-xl border border-border bg-bg/30 px-4 py-3 text-sm font-medium text-ink hover:border-border-hover hover:bg-surface-hover">
                <Scale className="h-5 w-5 text-gold" /> Moje sprawy sądowe
              </Link>
              <Link to="/poznaj-mnie" onClick={() => setMoreOpen(false)} className="flex items-center gap-3 rounded-xl border border-border bg-bg/30 px-4 py-3 text-sm font-medium text-ink hover:border-border-hover hover:bg-surface-hover">
                <User className="h-5 w-5 text-gold" /> Poznaj mnie
              </Link>
              <Link to="/informator" onClick={() => setMoreOpen(false)} className="flex items-center gap-3 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm font-semibold text-accent hover:bg-accent/20">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
                </span>
                Informator
              </Link>
              {user ? (
                <Link to="/konto" onClick={() => setMoreOpen(false)} className="flex items-center gap-3 rounded-xl border border-border bg-bg/30 px-4 py-3 text-sm font-medium text-ink hover:border-border-hover hover:bg-surface-hover">
                  <User className="h-5 w-5 text-muted" /> Profil
                </Link>
              ) : (
                <Link to="/auth" onClick={() => setMoreOpen(false)} className="flex items-center gap-3 rounded-xl border border-border bg-bg/30 px-4 py-3 text-sm font-medium text-ink hover:border-border-hover hover:bg-surface-hover">
                  <LogIn className="h-5 w-5 text-muted" /> Zaloguj
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
