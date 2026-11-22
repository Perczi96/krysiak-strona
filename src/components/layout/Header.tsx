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
    { href: '/', label: 'Strona główna' },
    { href: '/c/wyroznione', label: 'Wyróżnione' },
    { href: '/c/seriale', label: 'Seriale' },
    { href: '/c/filmy', label: 'Filmy' },
    { href: '/c/media', label: 'Media' },
    { href: '/c/teksty', label: 'Teksty' },
    { href: '/c/kariera', label: 'Kariera' },
    { href: '/c/ksiazki', label: 'Książki' },
    { href: '/c/tematy', label: 'Tematy' },
    { href: '/c/dzialalnosc', label: 'Społecznie' },
    { href: '/c/powiedzieli', label: 'Powiedzieli' },
    { href: '/c/o-mnie', label: 'O mnie' },
  ];

  const isActive = (href: string) => location.pathname === href || (href !== '/' && location.pathname.startsWith(href));

  return (
    <>
      <header className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        isScrolled ? 'bg-bg/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      )}>
        <div className="container">
          <div className="flex items-center justify-between h-16 md:h-14">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 font-serif font-bold text-xl text-ink hover:text-gold transition-colors" aria-label="Bez Maski - Strona główna">
              <span className="text-gold">▶</span>
              <span className="hidden sm:inline">Bez Maski</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Główna nawigacja">
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide pb-1">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                        'px-3 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap',
                        isActive(item.href)
                          ? 'text-gold bg-gold/10'
                          : 'text-muted hover:text-ink hover:bg-panel-hover'
                      )}
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
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gold/10 border border-gold/30 rounded-lg text-sm">
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
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-panel-hover transition-colors"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                  >
                    <Avatar imgSrc={avatarUrl as any} name={profile?.display_name || user.email} size="sm" />
                    <span className="hidden sm:inline-block text-sm font-medium">{profile?.display_name || 'Konto'}</span>
                    {profile?.role === 'supporter' && <Crown className="w-4 h-4 text-gold" />}
                    {profile?.role === 'admin' && <Settings className="w-4 h-4 text-blue" />}
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-56 bg-panel border border-line rounded-xl shadow-xl py-2 z-50 animate-slide-down">
                        <div className="px-4 py-3 border-b border-line">
                          <p className="font-medium text-ink">{profile?.display_name || user.email}</p>
                          <p className="text-sm text-muted truncate">{user.email}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={cn(
                                'px-2 py-0.5 rounded-full text-xs font-medium',
                                profile?.role === 'supporter' && 'bg-gold/20 text-gold',
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
                        <Link to="/konto" className="flex items-center gap-3 px-4 py-3 text-sm text-muted hover:text-ink hover:bg-panel-hover" onClick={() => setUserMenuOpen(false)}>
                          <User className="w-5 h-5" /> Konto i wsparcie
                        </Link>
                        <Link to="/c/informator" className="flex items-center gap-3 px-4 py-3 text-sm text-muted hover:text-ink hover:bg-panel-hover" onClick={() => setUserMenuOpen(false)}>
                          <HelpCircle className="w-5 h-5" /> Kontakt / Informator
                        </Link>
                        <hr className="my-2 border-line" />
                        <button
                          onClick={async () => { await signOut(); setUserMenuOpen(false); }}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-red hover:bg-red/10 w-full"
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
                className="md:hidden p-2 rounded-lg text-muted hover:text-ink hover:bg-panel-hover transition-colors"
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
          <div className="fixed top-0 right-0 bottom-0 z-50 w-72 md:w-80 bg-panel border-l border-line shadow-xl md:hidden animate-slide-in">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-line">
                <Link to="/" className="flex items-center gap-2 font-serif font-bold text-xl text-ink">
                  <span className="text-gold">▶</span> Bez Maski
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
                          ? 'bg-gold/10 text-gold'
                          : 'text-muted hover:text-ink hover:bg-panel-hover'
                      )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="p-4 border-t border-line space-y-2">
                {user ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2 bg-panel-hover rounded-lg">
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
          <Link to="/konto" className="flex items-center gap-3 px-3 py-3 rounded-lg text-muted hover:text-ink hover:bg-panel-hover" onClick={() => setUserMenuOpen(false)}>
            <User className="w-5 h-5" /> Konto i wsparcie
          </Link>
          <Link to="/c/informator" className="flex items-center gap-3 px-3 py-3 rounded-lg text-muted hover:text-ink hover:bg-panel-hover" onClick={() => setUserMenuOpen(false)}>
            <HelpCircle className="w-5 h-5" /> Kontakt / Informator
          </Link>
          <hr className="border-line" />
          <button
            onClick={async () => { await signOut(); setUserMenuOpen(false); }}
            className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-red hover:bg-red/10"
          >
            <LogOut className="w-5 h-5" /> Wyloguj się
          </button>
        </div>
      </Modal>
    </>
  );
}