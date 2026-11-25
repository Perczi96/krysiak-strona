import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-3">
    <h2 className="text-xl font-display font-bold text-ink">{title}</h2>
    <div className="space-y-3 text-sm leading-relaxed text-muted">{children}</div>
  </section>
);

export function PolitykaPrywatnosciPage() {
  return (
    <div className="container py-8 md:py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <Badge variant="gold" dot>RODO i prywatność</Badge>
          <h1 className="mt-4 text-3xl font-display font-bold text-ink md:text-4xl">Polityka prywatności</h1>
          <p className="mt-3 text-muted">Informacje o przetwarzaniu danych osobowych w serwisie Bez Maski, w tym w Informatorze, koncie użytkownika, płatnościach i cookies/PWA.</p>
          <Card className="mt-4 border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-200">
            <strong className="text-ink">Miejsce do uzupełnienia przed startem:</strong> [DO UZUPEŁNIENIA PRZED STARTEM: administrator danych (nazwa podmiotu, adres, NIP, e-mail kontaktowy/RODO)]
          </Card>
        </div>

        <Card className="space-y-8 p-6 md:p-8">
          <Section title="1. Administrator danych">
            <p>1.1. Administratorem danych osobowych jest [DO UZUPEŁNIENIA PRZED STARTEM: nazwa podmiotu, adres, NIP, dane kontaktowe].</p>
            <p>1.2. W sprawach związanych z danymi osobowymi można kontaktować się pod adresem: [DO UZUPEŁNIENIA PRZED STARTEM: e-mail RODO/kontaktowy].</p>
          </Section>

          <Section title="2. Zakres przetwarzanych danych">
            <p>2.1. <span className="text-ink font-medium">Konto i logowanie (Supabase/Auth):</span> adres e-mail, identyfikator użytkownika, dane profilu podane dobrowolnie, dane techniczne logowania.</p>
            <p>2.2. <span className="text-ink font-medium">Informator:</span> treść zgłoszenia, temat, oraz opcjonalnie dane kontaktowe podane dobrowolnie przez zgłaszającego. Zgłoszenie może być anonimowe.</p>
            <p>2.3. <span className="text-ink font-medium">Płatności i wsparcie (Stripe):</span> dane potrzebne do obsługi płatności, status subskrypcji, identyfikatory transakcji. Dane kart płatniczych są przetwarzane przez operatora płatności zgodnie z jego politykami.</p>
            <p>2.4. <span className="text-ink font-medium">Dane techniczne/cookies/PWA:</span> adres IP, logi serwera, dane urządzenia/przeglądarki, pliki cookie lub podobne technologie potrzebne do działania serwisu, bezpieczeństwa, sesji i funkcji PWA.</p>
          </Section>

          <Section title="3. Cele i podstawy przetwarzania">
            <p>3.1. Świadczenie usług i obsługa konta — wykonanie umowy lub działania przed jej zawarciem (art. 6 ust. 1 lit. b RODO).</p>
            <p>3.2. Obsługa płatności i wsparcia — wykonanie umowy, obowiązek prawny, prawnie uzasadniony interes (art. 6 ust. 1 lit. b, c, f RODO).</p>
            <p>3.3. Obsługa zgłoszeń Informatora i weryfikacja dziennikarska — prawnie uzasadniony interes administratora/redakcji (art. 6 ust. 1 lit. f RODO), a w razie potrzeby obrona praw lub obowiązek prawny.</p>
            <p>3.4. Bezpieczeństwo, zapobieganie nadużyciom, dochodzenie roszczeń — prawnie uzasadniony interes (art. 6 ust. 1 lit. f RODO).</p>
            <p>3.5. Zgoda — tam, gdzie jest wymagana (np. wybrane cookies/komunikacja marketingowa, jeśli zostanie wdrożona).</p>
          </Section>

          <Section title="4. Odbiorcy danych">
            <p>Dane mogą być przekazywane dostawcom infrastruktury i usług niezbędnych do działania Serwisu, w szczególności: dostawcy hostingu/infrastruktury, Supabase (konto/auth/baza), Stripe (płatności), dostawcom narzędzi analitycznych lub komunikacyjnych — jeśli zostaną wdrożeni. [DO UZUPEŁNIENIA PRZED STARTEM: lista podmiotów/powierzeń].</p>
          </Section>

          <Section title="5. Transfer danych poza EOG">
            <p>Jeśli dostawcy usług przetwarzają dane poza Europejskim Obszarem Gospodarczym, transfer odbywa się na podstawie odpowiednich mechanizmów prawnych, np. standardowych klauzul umownych lub decyzji adekwatności, zgodnie z przepisami RODO.</p>
          </Section>

          <Section title="6. Okres przechowywania">
            <p>6.1. Dane konta — przez okres posiadania konta oraz okres niezbędny do rozliczeń/roszczeń/bezpieczeństwa.</p>
            <p>6.2. Dane płatności — przez okres wymagany przepisami podatkowymi/rachunkowymi i do dochodzenia roszczeń.</p>
            <p>6.3. Zgłoszenia Informatora — przez okres potrzebny do analizy redakcyjnej, weryfikacji, zabezpieczenia materiału lub obrony praw, z uwzględnieniem zasad minimalizacji danych.</p>
          </Section>

          <Section title="7. Prawa użytkownika">
            <p>Masz prawo do: dostępu do danych, sprostowania, usunięcia (w przypadkach przewidzianych prawem), ograniczenia przetwarzania, przenoszenia danych, sprzeciwu wobec przetwarzania opartego na prawnie uzasadnionym interesie, cofnięcia zgody (jeśli dotyczy), oraz złożenia skargi do Prezesa UODO.</p>
          </Section>

          <Section title="8. Cookies i PWA">
            <p>8.1. Serwis może wykorzystywać cookies/technologie podobne niezbędne do działania, utrzymania sesji, bezpieczeństwa i preferencji.</p>
            <p>8.2. Aplikacja PWA/service worker może przechowywać lokalnie zasoby techniczne w celu poprawy działania i obsługi offline. Możesz zarządzać tym w ustawieniach przeglądarki/urządzenia.</p>
            <p>8.3. Jeśli zostaną wdrożone dodatkowe cookies analityczne lub marketingowe, przed ich użyciem zostanie uzyskana odpowiednia zgoda, o ile prawo tego wymaga. [DO UZUPEŁNIENIA PRZED STARTEM: polityka cookies/baner zgód].</p>
          </Section>

          <Section title="9. Informator — ważna informacja">
            <p>Formularz Informator jest przeznaczony do przekazywania sygnałów redakcji. Nie podawaj w nim danych wrażliwych, chyba że jest to absolutnie konieczne. Jeśli chcesz pozostać anonimowy, nie wpisuj danych kontaktowych. Mimo stosowania środków bezpieczeństwa, żaden kanał internetowy nie daje absolutnej gwarancji poufności.</p>
            <p className="text-xs text-muted pt-2">Wersja szablonowa — do przeglądu prawnego przed publicznym uruchomieniem.</p>
          </Section>
        </Card>
      </div>
    </div>
  );
}
