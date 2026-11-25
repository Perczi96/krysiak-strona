import { Link, useLocation } from '@tanstack/react-router';
import { Crown, LogOut, Menu, Play, Search, Settings, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/features/auth/useAuth';
import { GlobalSearchModal } from '@/components/search/GlobalSearchModal';

const NAV_ITEMS = [
  { href: '/sprawy', label: 'Sprawy' },
  { href: '/kulisy', label: 'Kulisy' },
  { href: '/ksiazki', label: 'Książki' },
  { href: '/sprawy-sadowe', label: 'Sprawy sądowe' },
  { href: '/poznaj-mnie', label: 'Poznaj mnie' },
  { href: '/klub', label: 'Klub' },
];

export function Header() {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const isActive = (href: string) => location.pathname === href || (href !== '/' && location.pathname.startsWith(href));
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-border/80 bg-bg/90 backdrop-blur-md">
        <div className="container">
          <div className="flex h-16 items-center justify-between gap-2 sm:gap-3">
            <Link to="/" className="flex shrink-0 items-center gap-2 font-display font-bold text-ink transition-colors hover:text-gold" aria-label="Bez Maski - Strona główna">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white shadow-[0_0_0_4px_rgba(217,45,32,0.12)]">
                <Play className="h-4 w-4 fill-current" aria-hidden="true" />
              </span>
              <span className="text-lg tracking-tight sm:text-xl">BEZ MASKI</span>
            </Link>

            <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex" aria-label="Główna nawigacja">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'whitespace-nowrap rounded-lg border px-3 py-2 text-sm font-medium transition-all',
                    isActive(item.href)
                      ? 'border-accent/30 bg-accent/10 text-ink'
                      : 'border-transparent text-muted hover:border-border hover:bg-surface hover:text-ink',
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); setUserMenuOpen(false); setSearchOpen(true); }}
                className="hidden items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-muted transition-colors hover:border-border-hover hover:text-ink md:inline-flex"
                aria-label="Szukaj w archiwum (Ctrl+K)"
              >
                <Search className="h-4 w-4" />
                <span>Szukaj w archiwum…</span>
                <span className="ml-1 rounded border border-border bg-bg px-1.5 py-0.5 font-mono text-[10px] text-muted">{isMac ? '⌘K' : 'Ctrl+K'}</span>
              </button>
              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); setUserMenuOpen(false); setSearchOpen(true); }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-muted transition-colors hover:border-border-hover hover:text-ink md:hidden"
                aria-label="Szukaj w archiwum"
              >
                <Search className="h-4 w-4" />
              </button>

              <Link
                to="/informator"
                className={cn(
                  'relative inline-flex items-center gap-2 rounded-lg border border-accent/50 bg-accent/10 px-2.5 py-2 text-sm font-semibold text-accent transition-all hover:bg-accent/20 sm:px-3',
                  'shadow-[0_0_0_0_rgba(217,45,32,0.35)]',
                )}
                aria-label="Informator - wyślij sygnał"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
                </span>
                <span className="hidden sm:inline">Informator</span>
                <span className="sm:hidden">Sygnał</span>
              </Link>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center rounded-full border border-border p-0.5 transition-colors hover:border-gold/50"
                    aria-label="Menu użytkownika"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                  >
                    <Avatar imgSrc={profile?.avatar_url} name={profile?.display_name} size="sm" />
                  </button>
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} aria-hidden="true" />
                      <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-surface shadow-xl" role="menu">
                        <div className="border-b border-border p-3">
                          <p className="truncate font-medium text-ink">{profile?.display_name}</p>
                          <p className="text-xs text-muted">
                            {profile?.role === 'supporter' ? 'Wspierający' : profile?.role === 'admin' ? 'Administrator' : 'Konto'}
                          </p>
                        </div>
                        <div className="p-1">
                          <Link to="/konto" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink hover:bg-surface-hover" onClick={() => setUserMenuOpen(false)} role="menuitem">
                            <User className="h-4 w-4 text-muted" /> Konto i wsparcie
                          </Link>
                          {profile?.role === 'supporter' && (
                            <Link to="/konto" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gold hover:bg-surface-hover" onClick={() => setUserMenuOpen(false)} role="menuitem">
                              <Crown className="h-4 w-4" /> Zarządzaj wsparciem
                            </Link>
                          )}
                          {profile?.role === 'admin' && (
                            <Link to="/admin" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gold hover:bg-surface-hover" onClick={() => setUserMenuOpen(false)} role="menuitem">
                              <Settings className="h-4 w-4" /> Panel Admina
                            </Link>
                          )}
                          <button
                            onClick={async () => { setUserMenuOpen(false); await signOut(); }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-accent hover:bg-accent-dim"
                            role="menuitem"
                          >
                            <LogOut className="h-4 w-4" /> Wyloguj się
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link to="/auth" className="btn btn-primary btn-sm hidden sm:inline-flex">Zaloguj się</Link>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted hover:text-ink lg:hidden"
                aria-label={mobileMenuOpen ? 'Zamknij menu' : 'Otwórz menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-bg/80 backdrop-blur-sm lg:hidden" onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />
          <div className="fixed left-0 right-0 top-16 z-50 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-border bg-bg lg:hidden">
            <div className="container py-4">
              <nav className="space-y-1" aria-label="Nawigacja mobilna">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'block rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                      isActive(item.href) ? 'bg-accent/10 text-accent' : 'text-muted hover:bg-surface hover:text-ink',
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={() => { setMobileMenuOpen(false); setSearchOpen(true); }}
                  className="flex w-full items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-muted hover:bg-surface hover:text-ink"
                >
                  <Search className="h-4 w-4" /> Szukaj w archiwum
                </button>
              </nav>
              <div className="mt-4 border-t border-border pt-4">
                {user ? (
                  <div className="space-y-2">
                    <Link to="/konto" className="btn btn-primary btn-sm w-full" onClick={() => setMobileMenuOpen(false)}>Konto i wsparcie</Link>
                    <button
                      onClick={async () => { await signOut(); setMobileMenuOpen(false); }}
                      className="btn btn-secondary w-full"
                    >
                      Wyloguj się
                    </button>
                  </div>
                ) : (
                  <Link to="/auth" className="btn btn-primary btn-sm w-full" onClick={() => setMobileMenuOpen(false)}>Zaloguj się</Link>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <GlobalSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
