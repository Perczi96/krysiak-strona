import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-3">
    <h2 className="text-xl font-display font-bold text-ink">{title}</h2>
    <div className="space-y-3 text-sm leading-relaxed text-muted">{children}</div>
  </section>
);

export function RegulaminPage() {
  return (
    <div className="container py-8 md:py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <Badge variant="gold" dot>Dokument prawny</Badge>
          <h1 className="mt-4 text-3xl font-display font-bold text-ink md:text-4xl">Regulamin serwisu Bez Maski</h1>
          <p className="mt-3 text-muted">Regulamin korzystania z serwisu internetowego, treści medialnych oraz Klubu wspierających.</p>
          <Card className="mt-4 border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-200">
            <strong className="text-ink">Miejsce do uzupełnienia przed startem:</strong> [DO UZUPEŁNIENIA PRZED STARTEM: nazwa podmiotu, adres, NIP, e-mail kontaktowy]
          </Card>
        </div>

        <Card className="space-y-8 p-6 md:p-8">
          <Section title="1. Postanowienia ogólne">
            <p>1.1. Niniejszy regulamin określa zasady korzystania z serwisu internetowego Bez Maski, dostępnego pod adresem [DO UZUPEŁNIENIA PRZED STARTEM: adres domeny].</p>
            <p>1.2. Właścicielem i administratorem serwisu jest [DO UZUPEŁNIENIA PRZED STARTEM: nazwa podmiotu, forma prawna, adres siedziby, NIP/REGON, e-mail kontaktowy].</p>
            <p>1.3. Serwis ma charakter informacyjno-medialny i może oferować treści publiczne, treści dla zalogowanych oraz treści dla wspierających (Klub Bez Maski).</p>
          </Section>

          <Section title="2. Definicje">
            <p><span className="text-ink font-medium">Serwis</span> — platforma internetowa Bez Maski.</p>
            <p><span className="text-ink font-medium">Użytkownik</span> — osoba korzystająca z Serwisu.</p>
            <p><span className="text-ink font-medium">Konto</span> — indywidualne konto Użytkownika utworzone w Serwisie.</p>
            <p><span className="text-ink font-medium">Klub / Wsparcie</span> — płatna lub deklarowana forma wsparcia zapewniająca dostęp do wskazanych treści lub korzyści.</p>
            <p><span className="text-ink font-medium">Treści</span> — materiały publikowane w Serwisie, w tym artykuły, wideo, audio, teczki spraw, dokumenty i komentarze.</p>
          </Section>

          <Section title="3. Zasady korzystania z Serwisu">
            <p>3.1. Korzystanie z publicznych części Serwisu nie wymaga założenia Konta, o ile dana funkcja nie stanowi inaczej.</p>
            <p>3.2. Użytkownik zobowiązuje się korzystać z Serwisu zgodnie z prawem, dobrymi obyczajami i niniejszym Regulaminem.</p>
            <p>3.3. Zabronione jest dostarczanie treści bezprawnych, naruszanie praw osób trzecich, próby zakłócania działania Serwisu, omijania zabezpieczeń lub nieuprawnionego dostępu do treści płatnych/ograniczonych.</p>
          </Section>

          <Section title="4. Konto użytkownika">
            <p>4.1. Do utworzenia Konta mogą być wymagane dane takie jak adres e-mail i hasło lub logowanie przez dostawcę zewnętrznego, jeśli jest dostępne.</p>
            <p>4.2. Użytkownik odpowiada za zachowanie poufności danych logowania i za działania wykonane w ramach Konta.</p>
            <p>4.3. Administrator może tymczasowo zablokować lub usunąć Konto w przypadku naruszenia Regulaminu lub przepisów prawa.</p>
          </Section>

          <Section title="5. Klub wspierających i płatności">
            <p>5.1. Serwis może oferować płatne wsparcie lub subskrypcję. Szczegóły zakresu, ceny, częstotliwości i korzyści są prezentowane w Serwisie przed dokonaniem płatności.</p>
            <p>5.2. Płatności mogą być obsługiwane przez zewnętrznego operatora płatności (np. Stripe). Warunki płatności i przetwarzania danych płatniczych mogą podlegać także regulaminom i politykom tego operatora.</p>
            <p>5.3. Dostęp do treści dla wspierających jest przyznawany zgodnie z aktywnym statusem wsparcia/subskrypcji.</p>
            <p>5.4. W sprawach zwrotów, odstąpienia od umowy lub reklamacji płatności obowiązują przepisy prawa oraz informacje przedstawione w procesie zakupu. [DO UZUPEŁNIENIA PRZED STARTEM: polityka zwrotów/reklamacji i dane kontaktowe].</p>
          </Section>

          <Section title="6. Treści, prawa autorskie i odpowiedzialność">
            <p>6.1. Treści publikowane w Serwisie są chronione prawem autorskim lub innymi przepisami prawa, chyba że wskazano inaczej.</p>
            <p>6.2. Użytkownik nie może kopiować, rozpowszechniać lub wykorzystywać komercyjnie Treści bez odpowiedniej zgody, poza dozwolonym użytkiem przewidzianym przez prawo.</p>
            <p>6.3. Publikacje śledcze mają charakter informacyjny i redakcyjny. Serwis dokłada staranności w weryfikacji informacji, jednak Użytkownik powinien uwzględniać aktualizacje, stanowiska stron i dokumenty źródłowe.</p>
          </Section>

          <Section title="7. Informator i zgłoszenia">
            <p>7.1. Formularz Informator służy do przekazywania sygnałów, informacji i materiałów redakcji.</p>
            <p>7.2. Użytkownik powinien przekazywać informacje zgodne z prawdą w najlepszej wierze i nie nadużywać formularza.</p>
            <p>7.3. Przekazanie zgłoszenia nie oznacza zobowiązania do publikacji ani gwarancji odpowiedzi.</p>
          </Section>

          <Section title="8. Reklamacje i kontakt">
            <p>8.1. Zgłoszenia dotyczące działania Serwisu można kierować na adres: [DO UZUPEŁNIENIA PRZED STARTEM: e-mail kontaktowy/reklamacyjny].</p>
            <p>8.2. Administrator odpowiada w rozsądnym terminie, o ile jest to możliwe, nie później niż w terminach wynikających z przepisów prawa.</p>
          </Section>

          <Section title="9. Postanowienia końcowe">
            <p>9.1. Administrator może zmieniać Regulamin z ważnych przyczyn (np. zmiany prawne, technologiczne, organizacyjne). Aktualna wersja jest publikowana w Serwisie.</p>
            <p>9.2. W sprawach nieuregulowanych zastosowanie mają przepisy prawa polskiego oraz właściwe przepisy prawa Unii Europejskiej.</p>
            <p className="text-xs text-muted pt-2">Wersja szablonowa — do przeglądu prawnego przed publicznym uruchomieniem.</p>
          </Section>
        </Card>
      </div>
    </div>
  );
}
