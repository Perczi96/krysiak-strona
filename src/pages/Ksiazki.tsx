import { BookOpen, ExternalLink, ShoppingCart } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import publikacjeData from '@/data/publikacje.json';

type Publikacja = {
  typ: string;
  tytul: string;
  medium?: string;
  data?: string;
  url?: string;
  doPotwierdzenia?: boolean;
};

const BOOK_DESCRIPTIONS: Record<string, string> = {
  'Dziewczyny z Dubaju 2': 'Kontynuacja reporterskiego bestsellera o świecie, który kusi blaskiem, ale ma bardzo ciemne zaplecze.',
  'Chłopaki z Dubaju': 'Reportażowe spojrzenie na męską stronę tego samego świata — pieniądze, wizerunek i konsekwencje.',
  'Diler gwiazd': 'Historia, która pokazuje kulisy show-biznesu i mechanizmy, o których zwykle mówi się szeptem.',
  'Dziewczyny z Dubaju': 'Bestsellerowy reportaż, który wywołał ogólnopolską debatę. Nakład wyprzedał się błyskawicznie, a historia doczekała się ekranizacji.',
  'Wyspa Ślepców': 'Reportaż śledczy o sprawie ks. Wojciecha Gila i o tym, co dziennikarz zobaczył, gdy pojechał dalej niż inni.',
  'Agent Tomek: Spowiedź': 'Książka oparta na historii agenta Tomka — opowieść o świecie, do którego niewielu ma dostęp.',
  'Edyta Górniak: bez cenzury': 'Biograficzna opowieść o jednej z najbardziej rozpoznawalnych polskich artystek.',
};

const books = (publikacjeData as { pozycje: Publikacja[] }).pozycje
  .filter((p) => p.typ === 'ksiazka' && !p.doPotwierdzenia)
  .sort((a, b) => (b.data || '').localeCompare(a.data || ''));

export function KsiazkiPage() {
  return (
    <div className="container py-8 md:py-12">
      <div className="mb-10 max-w-3xl">
        <Badge variant="gold" dot>Książki</Badge>
        <h1 className="mt-4 text-3xl font-display font-bold text-ink md:text-4xl">Moje książki</h1>
        <p className="mt-3 text-base text-muted md:text-lg">
          Reportaż, śledztwo i historie, które nie mieszczą się w jednym materiale. Prawdziwy katalog książek Piotra Krysiaka — od bestsellerowych reportaży po książki śledcze.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {books.map((book) => {
          const year = (book.data || '').slice(0, 4);
          const desc = BOOK_DESCRIPTIONS[book.tytul] || 'Książka Piotra Krysiaka — szczegóły i dostępność w linku poniżej.';
          return (
            <Card key={`${book.tytul}-${book.data}`} variant="hover" className="flex h-full flex-col p-6">
              <div className="mb-5 flex h-44 items-center justify-center rounded-xl border border-border bg-gradient-to-br from-surface-hover via-surface to-bg">
                <div className="text-center">
                  <BookOpen className="mx-auto h-12 w-12 text-gold" />
                  <p className="mt-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted">{book.medium || 'Wydawnictwo'}</p>
                </div>
              </div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant="gold">{year || 'Książka'}</Badge>
                {book.medium && <span className="text-xs text-muted">{book.medium}</span>}
              </div>
              <h2 className="text-xl font-display font-bold text-ink">{book.tytul}</h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{desc}</p>
              <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
                {book.url ? (
                  <a href={book.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-gold hover:text-gold-light">
                    <ShoppingCart className="h-4 w-4" /> Zobacz / kup
                  </a>
                ) : (
                  <span className="text-sm text-muted">Szczegóły wkrótce</span>
                )}
                {book.url && (
                  <a href={book.url} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-ink" aria-label={`Otwórz ${book.tytul}`}>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="mt-8 p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-display font-bold text-ink">Chcesz być na bieżąco?</h2>
            <p className="mt-1 text-muted">Zapowiedzi książek i kulisy pracy redakcyjnej trafiają też do sekcji Kulisy.</p>
          </div>
          <a href="/kulisy" className="btn btn-secondary inline-flex items-center gap-2">
            Zobacz kulisy <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </Card>
    </div>
  );
}
