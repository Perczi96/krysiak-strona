import { Home, Search, Video, BookOpen, MessageSquare } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <span className="text-8xl font-bold text-gold/20">404</span>
        </div>
        <h1 className="text-3xl font-serif font-bold text-ink mb-4">Strona nie znaleziona</h1>
        <p className="text-muted mb-8">
          Przepraszamy, ale strona, której szukasz, nie istnieje lub została przeniesiona.
          Sprawdź adres URL lub skorzystaj z wyszukiwania poniżej.
        </p>

        <div className="space-y-4">
          <a href="/" className="btn btn-primary w-full sm:w-auto">
            <Home className="w-4 h-4" /> Wróć na stronę główną
          </a>

          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type="search"
              placeholder="Wyszukaj treści..."
              className="input pl-10"
              autoFocus
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/c/filmy" className="btn btn-secondary">
              <Video className="w-4 h-4" /> Wideo
            </a>
            <a href="/c/tematy" className="btn btn-secondary">
              <BookOpen className="w-4 h-4" /> Tematy
            </a>
            <a href="/c/informator" className="btn btn-secondary">
              <MessageSquare className="w-4 h-4" /> Informator
            </a>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-line">
          <p className="text-xs text-muted">
            Myślisz, że to błąd? <a href="/c/informator" className="text-gold hover:underline">Napisz do nas</a> przez Informatora.
          </p>
        </div>
      </div>
    </div>
  );
}