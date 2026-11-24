import { Link, useLocation } from '@tanstack/react-router';
import { Crown, LogOut, Menu, Play, Settings, User, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/features/auth/useAuth';

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

  const isActive = (href: string) => location.pathname === href || (href !== '/' && location.pathname.startsWith(href));

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-border/80 bg-bg/90 backdrop-blur-md">
        <div className="container">
          <div className="flex h-16 items-center justify-between gap-3">
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

            <div className="flex items-center gap-2">
              <Link
                to="/informator"
                className={cn(
                  'relative inline-flex items-center gap-2 rounded-lg border border-accent/50 bg-accent/10 px-3 py-2 text-sm font-semibold text-accent transition-all hover:bg-accent/20',
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
                    className="flex items-center gap-2 rounded-lg border border-transparent p-1 transition-colors hover:border-border hover:bg-surface"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                    aria-label="Menu użytkownika"
                  >
                    <Avatar imgSrc={profile?.avatar_url as any} name={profile?.display_name || user.email} size="sm" />
                    <span className="hidden text-sm font-medium text-ink xl:inline-block">{profile?.display_name || 'Konto'}</span>
                    {profile?.role === 'supporter' && <Crown className="hidden h-4 w-4 text-gold xl:block" />}
                    {profile?.role === 'admin' && <Settings className="hidden h-4 w-4 text-blue xl:block" />}
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-xl border border-border bg-surface py-2 shadow-xl animate-slide-down">
                        <div className="border-b border-border px-4 py-3">
                          <p className="font-medium text-ink">{profile?.display_name || user.email}</p>
                          <p className="truncate text-sm text-muted">{user.email}</p>
                        </div>
                        <Link to="/konto" className="flex items-center gap-3 px-4 py-3 text-sm text-muted hover:bg-surface-hover hover:text-ink" onClick={() => setUserMenuOpen(false)}>
                          <User className="h-5 w-5" /> Konto i wsparcie
                        </Link>
                        {profile?.role === 'admin' && (
                          <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-sm text-muted hover:bg-surface-hover hover:text-ink" onClick={() => setUserMenuOpen(false)}>
                            <Settings className="h-5 w-5" /> Panel admina
                          </Link>
                        )}
                        <hr className="my-2 border-border" />
                        <button
                          onClick={async () => { await signOut(); setUserMenuOpen(false); }}
                          className="flex w-full items-center gap-3 px-4 py-3 text-sm text-accent hover:bg-accent/10"
                        >
                          <LogOut className="h-5 w-5" /> Wyloguj się
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link to="/auth" className="btn btn-secondary btn-sm hidden md:inline-flex">
                  Zaloguj się
                </Link>
              )}

              <button
                className="rounded-lg p-2 text-muted transition-colors hover:bg-surface hover:text-ink lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? 'Zamknij menu' : 'Otwórz menu'}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed bottom-0 right-0 top-0 z-50 w-80 max-w-[calc(100vw-2rem)] border-l border-border bg-surface shadow-xl lg:hidden animate-slide-up">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-border p-4">
                <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl text-ink" onClick={() => setMobileMenuOpen(false)}>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white"><Play className="h-4 w-4 fill-current" /></span>
                  BEZ MASKI
                </Link>
                <button onClick={() => setMobileMenuOpen(false)} className="rounded-lg p-2 text-muted hover:bg-surface-hover hover:text-ink" aria-label="Zamknij menu">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto p-4 space-y-1" aria-label="Nawigacja mobilna">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'flex items-center rounded-lg border px-3 py-3 text-base transition-colors',
                      isActive(item.href)
                        ? 'border-accent/20 bg-accent/10 text-accent'
                        : 'border-transparent text-muted hover:border-border hover:bg-surface-hover hover:text-ink',
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  to="/informator"
                  className="mt-2 flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-3 py-3 text-base font-semibold text-accent"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
                  </span>
                  Informator
                </Link>
              </nav>
              <div className="border-t border-border p-4">
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
    </>
  );
}
