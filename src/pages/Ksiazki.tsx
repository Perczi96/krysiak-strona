import { BookOpen, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const BOOKS = [
  {
    title: 'Dzieci fatimy',
    description: 'Reporterska opowieść o sprawach, które nie dają spokoju i wymagają odwagi, by nazwać je po imieniu.',
    status: 'Wydana',
    accent: 'gold' as const,
  },
  {
    title: 'Uprowadzeni',
    description: 'Dziennikarskie śledztwo i historia, która pokazuje, jak cienka jest granica między pozornym spokojem a dramatem.',
    status: 'Wydana',
    accent: 'gold' as const,
  },
  {
    title: 'Nadchodzi kolejna książka',
    description: 'Nowy projekt wydawniczy jest w przygotowaniu. W tej sekcji pojawią się zapowiedzi, kulisy pracy i informacje o premierze.',
    status: 'W przygotowaniu',
    accent: 'new' as const,
  },
];

export function KsiazkiPage() {
  return (
    <div className="container py-8 md:py-12">
      <div className="mb-10 max-w-3xl">
        <Badge variant="gold" dot>Książki</Badge>
        <h1 className="mt-4 text-3xl font-display font-bold text-ink md:text-4xl">Moje książki</h1>
        <p className="mt-3 text-base text-muted md:text-lg">
          Reportaż, śledztwo i historie, które nie mieszczą się w jednym materiale. Tutaj znajdziesz książki Piotra Krysiaka oraz zapowiedzi kolejnych publikacji.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {BOOKS.map((book) => (
          <Card key={book.title} variant="hover" className="flex h-full flex-col p-6">
            <div className="mb-5 flex h-44 items-center justify-center rounded-xl border border-border bg-gradient-to-br from-surface-hover to-bg">
              <BookOpen className="h-14 w-14 text-gold" />
            </div>
            <div className="mb-3">
              <Badge variant={book.accent === 'gold' ? 'gold' : 'new'}>{book.status}</Badge>
            </div>
            <h2 className="text-xl font-display font-bold text-ink">{book.title}</h2>
            <p className="mt-3 flex-1 text-sm text-muted">{book.description}</p>
            <div className="mt-5 border-t border-border pt-4 text-sm text-muted">
              Szczegóły, fragmenty i informacje o dostępności będą pojawiać się w tej sekcji.
            </div>
          </Card>
        ))}
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
