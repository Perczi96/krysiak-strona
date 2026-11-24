import { FileText, Gavel, Scale } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const CASES = [
  {
    title: 'Postępowania w toku i zakończone',
    stage: 'Aktualizacja w przygotowaniu',
    description: 'W tym miejscu będą pojawiać się sprawy dotyczące publikacji i działalności dziennikarskiej, wraz z etapami postępowania i dokumentami.',
  },
  {
    title: 'Dokumenty i etapy spraw',
    stage: 'Archiwum spraw',
    description: 'Każda sprawa będzie prezentowana przejrzyście: co wydarzyło się w sądzie, jakie są dokumenty i jaki jest komentarz autora.',
  },
];

export function SprawySadowePage() {
  return (
    <div className="container py-8 md:py-12">
      <div className="mb-10 max-w-3xl">
        <Badge variant="new" dot>Transparentność</Badge>
        <h1 className="mt-4 text-3xl font-display font-bold text-ink md:text-4xl">Moje sprawy sądowe</h1>
        <p className="mt-3 text-base text-muted md:text-lg">
          Postępowania dotyczące moich publikacji i działalności dziennikarskiej.
        </p>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <Scale className="mb-3 h-6 w-6 text-accent" />
          <h2 className="font-display font-bold text-ink">Dokument</h2>
          <p className="mt-2 text-sm text-muted">Pisma, orzeczenia i najważniejsze etapy postępowania.</p>
        </Card>
        <Card className="p-5">
          <Gavel className="mb-3 h-6 w-6 text-gold" />
          <h2 className="font-display font-bold text-ink">Etap sprawy</h2>
          <p className="mt-2 text-sm text-muted">Co się dzieje teraz, co już się wydarzyło i jaki jest kolejny krok.</p>
        </Card>
        <Card className="p-5">
          <FileText className="mb-3 h-6 w-6 text-muted" />
          <h2 className="font-display font-bold text-ink">Komentarz autora</h2>
          <p className="mt-2 text-sm text-muted">Kontekst i wyjaśnienie, oddzielone od samej dokumentacji sprawy.</p>
        </Card>
      </div>

      <div className="space-y-6">
        {CASES.map((item) => (
          <Card key={item.title} className="overflow-hidden p-0">
            <div className="grid gap-0 md:grid-cols-12">
              <div className="border-b border-border p-6 md:col-span-5 md:border-b-0 md:border-r">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Dokument / etap sprawy</p>
                <h2 className="mt-2 text-xl font-display font-bold text-ink">{item.title}</h2>
                <div className="mt-4 inline-flex rounded-full border border-border bg-surface-hover px-3 py-1 text-xs font-medium text-muted">
                  {item.stage}
                </div>
                <div className="mt-6 rounded-lg border border-dashed border-border bg-bg/40 p-4 text-sm text-muted">
                  Miejsce na dokumenty, daty rozpraw, pisma procesowe lub linki do materiałów źródłowych.
                </div>
              </div>
              <div className="p-6 md:col-span-7">
                <p className="text-xs font-semibold uppercase tracking-wider text-gold">Komentarz autora</p>
                <p className="mt-3 text-muted">{item.description}</p>
                <p className="mt-4 text-sm text-muted">
                  Gdy konkretne sprawy zostaną uzupełnione, ta sekcja pokaże je w czytelnym układzie: po lewej fakty i dokumenty, po prawej komentarz i kontekst.
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
