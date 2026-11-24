import { ExternalLink, Quote, Shield, BookOpen, Scale, Radio } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import mediaData from '@/data/media.json';

type MediaItem = {
  tytul: string;
  url: string;
  medium: string;
  kanalUrl?: string;
  kategoria?: string;
  etykieta: string;
  typ?: string;
  data?: string;
  wyrozniony?: boolean;
};

const mediaItems = (mediaData as { pozycje: MediaItem[] }).pozycje;

const QUOTES = [
  {
    name: 'Tomasz Sygut',
    role: 'były szef TVP Info i TAI',
    quote: 'Jest przedstawicielem gatunku dziennikarstwa, które dzisiaj w zasadzie nie istnieje. Dziennikarstwo śledcze było kiedyś solą tego zawodu. Piotr jest jednym z ostatnich Mohikaninów.',
  },
  {
    name: 'Jacek Harłukowicz',
    role: 'dziennikarz śledczy Onetu',
    quote: 'Jestem przekonany, że jest rzetelnym dziennikarzem.',
  },
  {
    name: 'Robert Zieliński',
    role: 'dziennikarz śledczy TVN24',
    quote: 'Był i ambitny i pomysłowy, zawsze zdeterminowany, by dowieźć temat do końca.',
  },
];

const FACTS = [
  { value: 'Od 1998', label: 'w dziennikarstwie' },
  { value: '430 tys.+', label: 'sprzedanych egz. „Dziewczyn z Dubaju”' },
  { value: '2×', label: 'policyjna ochrona w związku z publikacjami' },
  { value: 'Majdan 2004', label: 'współorganizacja koncertu dla miliona osób' },
];

function ytThumb(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|shorts\/)([A-Za-z0-9_-]{6,})/);
  return m ? `https://i.ytimg.com/vi/${m[1]}/hqdefault.jpg` : null;
}

export function PoznajMniePage() {
  return (
    <div className="container py-8 md:py-12">
      {/* Hero */}
      <section className="mb-12 md:mb-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">DZIENNIKARZ ŚLEDCZY · AUTOR KSIĄŻEK · BEZ MASKI</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-display font-bold text-ink md:text-6xl">Piotr Krysiak</h1>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted md:text-xl">
          Dziennikarz śledczy i autor bestsellerowych książek reportażowych, który rzadko mówi o sobie — woli, gdy mówią jego publikacje.
          Z dystansem powtarza, że „zawsze zajmował się patologią i tak mu zostało do dzisiaj”.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FACTS.map((f) => (
            <Card key={f.label} className="p-5">
              <p className="text-2xl font-display font-bold text-gold md:text-3xl">{f.value}</p>
              <p className="mt-2 text-sm text-muted">{f.label}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Kim jest */}
      <section className="mb-12 md:mb-16">
        <div className="mb-6">
          <Badge variant="gold" dot>Kim jest Piotr Krysiak</Badge>
          <h2 className="mt-4 text-2xl font-display font-bold text-ink md:text-3xl">Konkretne rozdziały, nie oś czasu</h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="p-6 md:p-7">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-accent-dim text-accent">
              <Radio className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-display font-bold text-ink">Szkoła twardego dziennikarstwa</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Zaczynał w 1998 r. w dziale stołecznym „Trybuny”, później pracował w „Życiu Warszawy”, „Super Expressie” i dziale krajowym tygodnika „Wprost”.
              Przez lata współtworzył TVP Info — od budowy portalu i reportaży m.in. o sprawach Krzysztofa Olewnika i Andrzeja Leppera, po rolę producenta, szefa serwisów,
              wydawcy „Minęła 20” oraz szefa publicystyki i współtwórcy „Woronicza 17”. Z TVP odszedł w 2016 r.
            </p>
          </Card>

          <Card className="p-6 md:p-7">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-gold-dim text-gold">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-display font-bold text-ink">Cena za tematy śledcze</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Dwa razy w życiu otrzymywał policyjną ochronę — po raz pierwszy po groźbach związanych z publikacją o detektywie Krzysztofie Rutkowskim.
              W trakcie pracy w „Życiu Warszawy” trafił nawet na noc do policyjnej izby zatrzymań przez policyjną pomyłkę w numerze służbowego telefonu;
              sprawa zakończyła się oficjalnymi przeprosinami komendanta stołecznego policji.
            </p>
          </Card>

          <Card className="p-6 md:p-7">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-surface-hover text-ink border border-border">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-display font-bold text-ink">Głośne wywiady i książki</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Jako pierwszy w telewizji ujawnił twarz „agenta Tomka” i napisał <em>„Agent Tomek. Spowiedź”</em> (2010). Jako jedyny dziennikarz przeprowadził wywiad z ks. Wojciechem Gilem
              (skazanym później na 7 lat więzienia), a po powrocie na Dominikanę i rozmowach z ofiarami wydał <em>„Wyspę ślepców”</em> (2017).
              W 2018 r. opublikował <em>„Dziewczyny z Dubaju”</em> — nakład wyprzedał się w 3 dni, przekraczając 430 tys. egzemplarzy i doczekując się ekranizacji.
            </p>
          </Card>
        </div>
      </section>

      {/* Majdan */}
      <section className="mb-12 md:mb-16">
        <div className="mb-6 flex items-center gap-2">
          <Scale className="h-5 w-5 text-gold" />
          <h2 className="text-2xl font-display font-bold text-ink md:text-3xl">Działalność społeczna — Majdan, 2004</h2>
        </div>
        <Card className="overflow-hidden p-0">
          <div className="grid gap-0 md:grid-cols-12">
            <div className="bg-gradient-to-br from-accent-dim/40 via-surface to-bg p-6 md:col-span-4 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-accent">Pomarańczowa rewolucja</p>
              <p className="mt-3 text-3xl font-display font-bold text-ink">Kijów, Majdan</p>
              <p className="mt-2 text-sm text-muted">Koncert dla blisko miliona osób pod sceną, transmisja TVP1.</p>
            </div>
            <div className="p-6 md:col-span-8 md:p-8">
              <p className="text-base leading-relaxed text-muted">
                Podczas Pomarańczowej rewolucji na Ukrainie współorganizował koncert polskich artystów na kijowskim Majdanie.
                Na scenie wystąpili m.in. <span className="text-ink">Edyta Górniak, Paweł Kukiz oraz Grzegorz Markowski</span> z zespołu Perfect
                (większość artystów zagrała charytatywnie). Koncert dla blisko miliona osób pod sceną transmitowała TVP1, a Piotr Krysiak go zapowiadał.
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* Cytaty */}
      <section className="mb-12 md:mb-16">
        <div className="mb-6 flex items-center gap-2">
          <Quote className="h-5 w-5 text-gold" />
          <h2 className="text-2xl font-display font-bold text-ink md:text-3xl">O Piotrze powiedzieli</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {QUOTES.map((item) => (
            <Card key={item.name} className="flex h-full flex-col p-6">
              <Quote className="h-5 w-5 text-gold" />
              <p className="mt-4 flex-1 text-base leading-relaxed text-ink">„{item.quote}”</p>
              <div className="mt-6 border-t border-border pt-4">
                <p className="font-semibold text-ink">{item.name}</p>
                <p className="text-sm text-muted">{item.role}</p>
              </div>
            </Card>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted">Źródło: Wirtualnemedia.pl, 17.07.2023</p>
      </section>

      {/* Napisali o mnie */}
      <section className="mb-12 md:mb-16">
        <h2 className="mb-6 text-2xl font-display font-bold text-ink md:text-3xl">Napisali o mnie</h2>
        <Card className="p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-gold">Beata Czuma · Wirtualnemedia.pl · 17.07.2023</p>
              <h3 className="mt-3 text-xl font-display font-bold text-ink md:text-2xl">
                „Zasłynął «Dziewczynami z Dubaju», miał policyjną ochronę, spędził noc na dołku. Kim jest Piotr Krysiak?”
              </h3>
              <p className="mt-3 text-muted">
                Obszerny portret dziennikarza śledczego — o początkach w prasie, pracy w TVP, książkach, ochronie policyjnej i kulisach reportaży.
              </p>
            </div>
            <a
              href="https://www.wirtualnemedia.pl/piotr-krysiak-dziewczyny-z-dubaju-mial-policyjna-ochrone-spedzil-kiedys-noc-na-dolku-edyta-gorniak-omenaa-mensah-senator-pozew,7169503207396993a"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary inline-flex shrink-0 items-center gap-2"
            >
              Przeczytaj pełny artykuł na Wirtualnemedia.pl <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </Card>
      </section>

      {/* Piotr w mediach */}
      <section className="mb-12 md:mb-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <Badge variant="new" dot>Archiwum</Badge>
            <h2 className="mt-4 text-2xl font-display font-bold text-ink md:text-3xl">Piotr w mediach</h2>
            <p className="mt-2 text-muted">Wybrane wywiady, komentarze i rozmowy z udziałem Piotra Krysiaka.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mediaItems.map((item) => {
            const thumb = ytThumb(item.url);
            return (
              <a
                key={item.url}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <Card variant="hover" className="h-full overflow-hidden p-0">
                  {thumb && (
                    <div className="relative aspect-video overflow-hidden bg-surface">
                      <img src={thumb} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                      <div className="absolute left-3 top-3">
                        <span className="rounded-full bg-bg/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink backdrop-blur">{item.etykieta}</span>
                      </div>
                    </div>
                  )}
                  <div className="p-4">
                    {!thumb && <span className="mb-2 inline-block rounded-full bg-surface-hover px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted">{item.etykieta}</span>}
                    <h3 className="line-clamp-3 text-sm font-semibold text-ink transition-colors group-hover:text-gold">{item.tytul}</h3>
                    <p className="mt-2 text-xs text-muted">{item.medium}{item.data ? ` · ${item.data}` : ''}</p>
                  </div>
                </Card>
              </a>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section>
        <Card className="border-accent/30 bg-accent-dim/20 p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-display font-bold text-ink md:text-2xl">Masz sprawę dla dziennikarza śledczego?</h2>
              <p className="mt-2 text-muted">Jeśli posiadasz informację, dokument lub trop — przejdź do bezpiecznego Informatora.</p>
            </div>
            <Link to="/informator" className="btn btn-primary inline-flex shrink-0 items-center gap-2">
              Przejdź do Informatora
            </Link>
          </div>
        </Card>
      </section>

    </div>
  );
}
