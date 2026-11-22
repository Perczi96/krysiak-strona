import { Outlet, Link } from '@tanstack/react-router';
import { Header } from './Header';
import { BottomNav, FloatingActionButton } from './BottomNav';
import { InstallBanner } from './InstallBanner';

export function Layout() {
  return (
    <div className="min-h-screen bg-bg font-sans">
      {/* Skip link for accessibility */}
      <a href="#main-content" className="skip-link">
        Przejdź do treści
      </a>

      {/* Header */}
      <Header />

      {/* Main content */}
      <main id="main-content" className="pt-16 pb-24 md:pt-14 md:pb-12">
        <Outlet />
      </main>

      {/* Bottom Navigation (Mobile PWA) */}
      <BottomNav />
      <FloatingActionButton />

      {/* Install Banner */}
      <InstallBanner />

      {/* Footer */}
      <footer className="border-t border-line bg-panel/50">
        <div className="container py-8 md:py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-2 font-serif font-bold text-xl text-ink mb-4">
                <span className="text-gold">▶</span> Bez Maski
              </Link>
              <p className="text-muted text-sm max-w-xs">
                Jedyna oficjalna strona Piotra Krysiaka — dziennikarza śledczego, autora książek i twórcy programu "Bez Maski".
              </p>
            </div>

            <div>
              <h4 className="font-medium text-ink mb-3">Społeczność</h4>
              <nav className="space-y-2 text-sm">
                <Link to="/konto" className="text-muted hover:text-gold block">Wspieraj kanał</Link>
                <Link to="/c/informator" className="text-muted hover:text-gold block">Informator</Link>
                <Link to="/c/kariera" className="text-muted hover:text-gold block">O Piotrze</Link>
                <Link to="/c/tematy" className="text-muted hover:text-gold block">Tematy śledcze</Link>
              </nav>
            </div>

            <div>
              <h4 className="font-medium text-ink mb-3">Zewnętrzne</h4>
              <nav className="space-y-2 text-sm">
                <a href="https://www.youtube.com/@piotr_krysiak" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-gold block flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.166 3.166 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.166 3.166 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.166 3.166 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.166 3.166 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  YouTube
                </a>
                <a href="https://patronite.pl/krysiak" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-gold block flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                  Patronite
                </a>
                <a href="https://x.com/Piotr_T_Krysiak" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-gold block flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 9.72-1.92 1.794-10.034-11.42L0 16.123l8.847-9.896 1.849 1.787zm-11.002 6.815l1.853-2.011-1.886-2.012h-3.282l2.23 2.438zm12.362 1.358l2.604-2.816h-3.312l-2.089 2.271 2.797 3.307zm-14.878-7.666l-.952 1.033h3.298l-2.076-2.298 1.728-1.761zm15.696 6.543l.951 1.034h-3.297l2.077-2.299-1.731-1.76z"/></svg>
                  X (Twitter)
                </a>
                <a href="https://piotrkrysiak.substack.com" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-gold block flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                  Substack
                </a>
              </nav>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-line flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted text-sm">
              © {new Date().getFullYear()} Bez Maski. Wszelkie prawa zastrzeżone.
            </p>
            <nav className="flex items-center gap-6 text-sm">
              <a href="/regulamin" className="text-muted hover:text-gold">Regulamin</a>
              <a href="/polityka-prywatnosci" className="text-muted hover:text-gold">Polityka prywatności</a>
              <a href="/c/informator" className="text-muted hover:text-gold">Kontakt</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}