import { Link, useLocation } from '@tanstack/react-router';
import { Menu, X, Crown, User, LogOut, Settings, HelpCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/features/auth/useAuth';
import { Modal } from '@/components/ui/Modal';

export function Header() {
  const { user, profile, signOut } = useAuth();
  const avatarUrl = profile?.avatar_url;
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [installPromptOpen, setInstallPromptOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { href: '/c/wyroznione', label: 'Śledztwa' },
    { href: '/c/filmy', label: 'Wideo' },
    { href: '/c/podcasty', label: 'Podcasty' },
    { href: '/konto', label: 'Wspieraj' },
  ];

  const isActive = (href: string) => location.pathname === href || (href !== '/' && location.pathname.startsWith(href));

  return (
    <>
      <header className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        isScrolled ? 'bg-surface/95 backdrop-blur-md border-b border-border' : 'bg-transparent'
      )}>
        <div className="container">
          <div className="flex items-center justify-between h-16 md:h-14">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl text-ink hover:text-gold transition-colors" aria-label="Bez Maski - Strona główna">
              <span className="relative">
                <span className="text-accent">▶</span>
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-accent/50 rounded-full" aria-hidden="true" />
              </span>
              <span className="hidden sm:inline tracking-tight">BEZ MASKI</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Główna nawigacja">
              <div className="flex items-center gap-1">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                        'px-3 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap',
                        isActive(item.href)
                          ? 'text-ink bg-accent/10 border border-accent/20'
                          : 'text-muted hover:text-ink hover:bg-surface hover:border-border'
                      )}
                    style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: 'transparent' }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {/* Install PWA button (mobile only) */}
              {installPromptOpen && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-surface border border-border rounded-lg text-sm">
                  <span className="text-muted">Zainstaluj aplikację</span>
                  <Button variant="primary" size="sm" onClick={() => { /* beforeinstallprompt */ }}>
                    Zainstaluj
                  </Button>
                  <button onClick={() => setInstallPromptOpen(false)} className="text-muted hover:text-ink p-1" aria-label="Zamknij">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Auth / User menu */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-lg hover:bg-surface transition-colors border border-transparent hover:border-border"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                  >
                    <Avatar imgSrc={avatarUrl as any} name={profile?.display_name || user.email} size="sm" />
                    <span className="hidden sm:inline-block text-sm font-medium text-ink">{profile?.display_name || 'Konto'}</span>
                    {profile?.role === 'supporter' && <Crown className="w-4 h-4 text-gold" />}
                    {profile?.role === 'admin' && <Settings className="w-4 h-4 text-blue" />}
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-xl shadow-xl py-2 z-50 animate-slide-down">
                        <div className="px-4 py-3 border-b border-border">
                          <p className="font-medium text-ink">{profile?.display_name || user.email}</p>
                          <p className="text-sm text-muted truncate">{user.email}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={cn(
                                'px-2 py-0.5 rounded-full text-xs font-medium',
                                profile?.role === 'supporter' && 'bg-gold-dim text-gold border border-gold/30',
                                profile?.role === 'subscriber' && 'bg-blue/20 text-blue',
                                profile?.role === 'admin' && 'bg-red/20 text-red',
                                profile?.role === 'guest' && 'bg-muted/20 text-muted'
                              )}>
                              {profile?.role === 'supporter' && '👑 Wspierający'}
                              {profile?.role === 'subscriber' && '🔔 Subskrybent'}
                              {profile?.role === 'admin' && '⚙️ Admin'}
                              {profile?.role === 'guest' && '👤 Gość'}
                            </span>
                          </div>
                        </div>
                        <Link to="/konto" className="flex items-center gap-3 px-4 py-3 text-sm text-muted hover:text-ink hover:bg-surface-hover" onClick={() => setUserMenuOpen(false)}>
                          <User className="w-5 h-5" /> Konto i wsparcie
                        </Link>
                        <Link to="/c/informator" className="flex items-center gap-3 px-4 py-3 text-sm text-muted hover:text-ink hover:bg-surface-hover" onClick={() => setUserMenuOpen(false)}>
                          <HelpCircle className="w-5 h-5" /> Kontakt / Informator
                        </Link>
                        <hr className="my-2 border-border" />
                        <button
                          onClick={async () => { await signOut(); setUserMenuOpen(false); }}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-accent hover:bg-accent/10 w-full"
                        >
                          <LogOut className="w-5 h-5" /> Wyloguj się
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link to="/auth" className="btn btn-primary btn-sm hidden sm:inline-flex">
                  Zaloguj / Zarejestruj
                </Link>
              )}

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-lg text-muted hover:text-ink hover:bg-surface transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? 'Zamknij menu' : 'Otwórz menu'}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed top-0 right-0 bottom-0 z-50 w-72 md:w-80 bg-surface border-l border-border shadow-xl md:hidden animate-slide-in">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-border">
                <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl text-ink">
                  <span className="text-accent">▶</span> BEZ MASKI
                </Link>
              </div>
              <nav className="flex-1 overflow-y-auto p-4 space-y-1" aria-label="Nawigacja mobilna">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                        'flex items-center gap-3 px-3 py-3 rounded-lg text-base transition-colors',
                        isActive(item.href)
                          ? 'bg-accent/10 text-accent border border-accent/20'
                          : 'text-muted hover:text-ink hover:bg-surface hover:border-border'
                      )}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: 'transparent' }}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="p-4 border-t border-border space-y-2">
                {user ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2 bg-surface-hover rounded-lg border border-border">
                      <p className="font-medium text-ink">{profile?.display_name || 'Użytkownik'}</p>
                      <p className="text-sm text-muted truncate">{user.email}</p>
                    </div>
                    <Link to="/konto" className="btn btn-primary btn-sm w-full" onClick={() => setMobileMenuOpen(false)}>
                      Konto i wsparcie
                    </Link>
                    <button
                      onClick={async () => { await signOut(); setMobileMenuOpen(false); }}
                      className="btn btn-secondary w-full"
                    >
                      Wyloguj się
                    </button>
                  </div>
                ) : (
                  <Link to="/auth" className="btn btn-primary btn-sm w-full" onClick={() => setMobileMenuOpen(false)}>
                    Zaloguj / Zarejestruj
                  </Link>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* User Menu Modal for desktop (alternative to dropdown) */}
      <Modal
        isOpen={userMenuOpen}
        onClose={() => setUserMenuOpen(false)}
        size="sm"
        closeOnOverlayClick
        showCloseButton={false}
      >
        <div className="space-y-2">
          <Link to="/konto" className="flex items-center gap-3 px-3 py-3 rounded-lg text-muted hover:text-ink hover:bg-surface-hover" onClick={() => setUserMenuOpen(false)}>
            <User className="w-5 h-5" /> Konto i wsparcie
          </Link>
          <Link to="/c/informator" className="flex items-center gap-3 px-3 py-3 rounded-lg text-muted hover:text-ink hover:bg-surface-hover" onClick={() => setUserMenuOpen(false)}>
            <HelpCircle className="w-5 h-5" /> Kontakt / Informator
          </Link>
          <hr className="border-border" />
          <button
            onClick={async () => { await signOut(); setUserMenuOpen(false); }}
            className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-accent hover:bg-accent/10"
          >
            <LogOut className="w-5 h-5" /> Wyloguj się
          </button>
        </div>
      </Modal>
    </>
  );
}
