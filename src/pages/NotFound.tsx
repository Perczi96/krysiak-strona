import { Link } from '@tanstack/react-router';
import { Home, Search, FileText, ShieldAlert } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="container flex min-h-[calc(100vh-10rem)] items-center justify-center py-12">
      <div className="w-full max-w-2xl text-center">
        <div className="mb-6 inline-flex rounded-2xl border border-border bg-surface px-5 py-2 font-mono text-sm tracking-[0.25em] text-gold">404</div>
        <h1 className="text-3xl font-display font-bold text-ink md:text-5xl">Nie znaleziono strony</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted">
          Ta strona nie istnieje, została przeniesiona albo adres został wpisany niepoprawnie. Wróć do strony głównej lub przejdź do jednej z głównych sekcji Bez Maski.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/" className="btn btn-primary"><Home className="h-4 w-4" /> Strona główna</Link>
          <Link to="/sprawy" className="btn btn-secondary"><Search className="h-4 w-4" /> Sprawy</Link>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <Link to="/sprawy" className="rounded-xl border border-border bg-surface p-4 text-left transition-colors hover:border-gold/30 hover:bg-surface-hover">
            <FileText className="mb-2 h-5 w-5 text-gold" />
            <p className="font-medium text-ink">Sprawy</p>
            <p className="text-sm text-muted">Śledztwa i materiały</p>
          </Link>
          <Link to="/informator" className="rounded-xl border border-border bg-surface p-4 text-left transition-colors hover:border-gold/30 hover:bg-surface-hover">
            <ShieldAlert className="mb-2 h-5 w-5 text-accent" />
            <p className="font-medium text-ink">Informator</p>
            <p className="text-sm text-muted">Przekaż sygnał</p>
          </Link>
          <Link to="/poznaj-mnie" className="rounded-xl border border-border bg-surface p-4 text-left transition-colors hover:border-gold/30 hover:bg-surface-hover">
            <Search className="mb-2 h-5 w-5 text-gold" />
            <p className="font-medium text-ink">Poznaj mnie</p>
            <p className="text-sm text-muted">O Piotrze Krysiaku</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
