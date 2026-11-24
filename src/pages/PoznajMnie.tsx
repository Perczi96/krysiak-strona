import { BookOpen, Quote, Users, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const QUOTES = [
  {
    name: 'Tomasz Sygut',
    role: 'szef TVP Info i TAI w latach 2013–2016',
    quote: 'Piotr jest jednym z ostatnich Mohikaninów w tym zawodzie.',
  },
  {
    name: 'Jacek Harłukowicz',
    role: 'dziennikarz śledczy portalu Onet',
    quote: 'Jestem przekonany, że jest rzetelnym dziennikarzem.',
  },
  {
    name: 'Robert Zieliński',
    role: 'dziennikarz śledczy TVN24',
    quote: 'Był i ambitny i pomysłowy, zawsze zdeterminowany, by dowieźć temat do końca.',
  },
];

export function PoznajMniePage() {
  return (
    <div className="container py-8 md:py-12">
      <div className="mb-10 max-w-3xl">
        <Badge variant="gold" dot>Poznaj mnie</Badge>
        <h1 className="mt-4 text-3xl font-display font-bold text-ink md:text-4xl">Piotr Krysiak</h1>
        <p className="mt-3 text-base text-muted md:text-lg">
          Dziennikarz śledczy, autor książek i twórca programu „Bez Maski”. Zajmuję się sprawami, które wymagają cierpliwości, dokumentów i gotowości, by zadawać niewygodne pytania.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="p-6 md:p-8 lg:col-span-7">
          <h2 className="text-2xl font-display font-bold text-ink">Biogram</h2>
          <div className="mt-4 space-y-4 text-muted">
            <p>
              Od lat pracuję w dziennikarstwie śledczym, łącząc reportaż, dokumenty i rozmowy ze świadkami. „Bez Maski” to miejsce, w którym publikuję materiały, które mają sens dopiero wtedy, gdy są doprowadzone do końca.
            </p>
            <p>
              Na tej stronie znajdziesz sprawy, kulisy pracy, książki, sprawy sądowe dotyczące mojej działalności oraz bezpieczny kanał dla informatorów.
            </p>
          </div>
        </Card>

        <Card className="p-6 md:p-8 lg:col-span-5">
          <div className="mb-4 flex items-center gap-2 text-gold">
            <BookOpen className="h-5 w-5" />
            <h2 className="text-xl font-display font-bold text-ink">Moja droga dziennikarska</h2>
          </div>
          <div className="space-y-4 border-l border-border pl-4">
            <div>
              <p className="text-sm font-semibold text-gold">Od tego się zaczęło</p>
              <p className="mt-1 text-sm text-muted">
                Miejsce na pierwszy tekst i początki drogi dziennikarskiej — historia, która ułożyła fundament pod późniejsze śledztwa i reportaże.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Reportaż i śledztwa</p>
              <p className="mt-1 text-sm text-muted">Praca nad sprawami, które wymagają czasu, dokumentów i rozmów z ludźmi, którzy często ryzykują najwięcej.</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Bez Maski</p>
              <p className="mt-1 text-sm text-muted">Niezależna platforma, na której publikacje, książki i kulisy pracy spotykają się w jednym miejscu.</p>
            </div>
          </div>
        </Card>
      </div>

      <section className="mt-10">
        <div className="mb-5 flex items-center gap-2">
          <Users className="h-5 w-5 text-gold" />
          <h2 className="text-2xl font-display font-bold text-ink">Działalność społeczna</h2>
        </div>
        <Card className="p-6 md:p-8">
          <h3 className="text-xl font-display font-bold text-ink">Majdan, 2004</h3>
          <p className="mt-3 max-w-3xl text-muted">
            Współorganizacja koncertu polskich artystów na Majdanie podczas Pomarańczowej rewolucji. W materiale Wirtualnemedia wymienieni są Edyta Górniak, Paweł Kukiz i Grzegorz Markowski z zespołu Perfect; transmisja w TVP1; Piotr Krysiak zapowiadał koncert.
          </p>
          <p className="mt-4 text-sm text-muted">Źródło: Wirtualnemedia, 17.07.2023</p>
        </Card>
      </section>

      <section className="mt-10">
        <div className="mb-5 flex items-center gap-2">
          <Quote className="h-5 w-5 text-gold" />
          <h2 className="text-2xl font-display font-bold text-ink">O Piotrze powiedzieli</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {QUOTES.map((item) => (
            <Card key={item.name} className="p-6">
              <Quote className="h-5 w-5 text-gold" />
              <p className="mt-4 text-base text-ink">„{item.quote}”</p>
              <div className="mt-5 border-t border-border pt-4">
                <p className="font-semibold text-ink">{item.name}</p>
                <p className="text-sm text-muted">{item.role}</p>
              </div>
            </Card>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted">Źródło: Wirtualnemedia, 17.07.2023</p>
      </section>

      <section className="mt-10">
        <h2 className="mb-5 text-2xl font-display font-bold text-ink">Napisali o mnie</h2>
        <Card className="p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-gold">Wirtualnemedia.pl</p>
              <h3 className="mt-2 text-xl font-display font-bold text-ink">Materiał o pracy i działalności Piotra Krysiaka</h3>
              <p className="mt-2 max-w-2xl text-muted">
                Miejsce na odnośnik do artykułu w Wirtualnemedia.pl. Możesz tu dodać bezpośredni link do wybranego materiału.
              </p>
            </div>
            <a
              href="https://www.wirtualnemedia.pl/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary inline-flex items-center gap-2"
            >
              Przeczytaj <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </Card>
      </section>
    </div>
  );
}
