import { useEffect, useState } from 'react';
import { AlertTriangle, Lock, Send, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toaster';

export function InformatorPage() {
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const temat = params.get('temat');
    if (temat && !subject) setSubject(temat.slice(0, 140));
  }, []);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (subject.trim().length < 3) {
      setErrorMsg('Podaj krótki temat (minimum 3 znaki).');
      return;
    }
    if (message.trim().length < 10) {
      setErrorMsg('Wiadomość jest zbyt krótka. Opisz sprawę możliwie konkretnie.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await (supabase as any).from('informator_messages').insert({
        subject: subject.trim(),
        message: message.trim(),
        contact: contact.trim() || null,
        status: 'new',
      });

      if (error) {
        console.error('informator insert error', error);
        setErrorMsg('Nie udało się zapisać zgłoszenia w bazie. Jeśli migracja 005_informator_messages.sql nie została jeszcze uruchomiona w Supabase, uruchom ją i spróbuj ponownie. Możesz też skontaktować się innym bezpiecznym kanałem.');
        toast({ type: 'error', title: 'Nie wysłano zgłoszenia', message: 'Sprawdź połączenie lub konfigurację bazy.' });
        return;
      }

      setSent(true);
      setSubject('');
      setMessage('');
      setContact('');
      toast({ type: 'success', title: 'Zgłoszenie wysłane', message: 'Dziękujemy za wiadomość.' });
    } catch (err) {
      console.error('informator submit error', err);
      setErrorMsg('Wystąpił błąd sieci lub konfiguracji. Spróbuj ponownie za chwilę. Twoja wiadomość nie została zapisana automatycznie.');
      toast({ type: 'error', title: 'Błąd wysyłki', message: 'Nie udało się wysłać zgłoszenia.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8 md:py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent-dim px-3 py-1.5 text-xs font-bold tracking-wide text-accent">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
            </span>
            SYGNAŁ · INFORMATOR
          </div>
          <h1 className="mt-4 text-3xl font-display font-bold text-ink md:text-5xl">Masz gorący temat albo breaking news? Napisz do mnie.</h1>
          <p className="mt-4 max-w-2xl text-base text-muted md:text-lg">
            Ta strona służy do bezpiecznego przekazywania informacji. Możesz opisać sprawę anonimowo — podawanie danych osobowych nie jest wymagane.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
            <Card className="p-6">
              <div className="mb-4 flex items-center gap-2 text-gold">
                <ShieldCheck className="h-5 w-5" />
                <h2 className="text-lg font-display font-bold text-ink">Zasady bezpiecznego kontaktu</h2>
              </div>
              <ul className="space-y-3 text-sm text-muted">
                <li className="flex gap-3"><Lock className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold" /><span>Możesz wysłać zgłoszenie anonimowo. Pole kontaktu jest opcjonalne.</span></li>
                <li className="flex gap-3"><Lock className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold" /><span>Podaj tylko tyle informacji, ile chcesz ujawnić. Nie wpisuj danych, które mogłyby Cię niepotrzebnie zidentyfikować.</span></li>
                <li className="flex gap-3"><Lock className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold" /><span>Jeśli sprawa jest bardzo wrażliwa, rozważ kontakt przez bezpieczny kanał i unikaj opisywania jej z urządzenia służbowego.</span></li>
                <li className="flex gap-3"><Lock className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold" /><span>Każde zgłoszenie traktuję poważnie i sprawdzam je dziennikarsko.</span></li>
              </ul>
            </Card>

            <Card className="p-6 border-accent/20 bg-accent-dim/30">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" />
                <div>
                  <h3 className="font-display font-bold text-ink">Ważne</h3>
                  <p className="mt-2 text-sm text-muted">
                    Formularz nie zastępuje kontaktu alarmowego. W sytuacji bezpośredniego zagrożenia życia lub zdrowia skontaktuj się z odpowiednimi służbami.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6 md:p-8 lg:col-span-7">
            {sent ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green/15 text-green">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <h2 className="text-2xl font-display font-bold text-ink">Zgłoszenie zostało przyjęte</h2>
                <p className="mt-3 text-muted">Dziękuję za kontakt. Jeśli zostawiłeś kontakt zwrotny, odezwę się, gdy będzie to możliwe i bezpieczne.</p>
                <Button className="mt-6" variant="secondary" onClick={() => { setSent(false); setErrorMsg(null); }}>
                  Wyślij kolejne zgłoszenie
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h2 className="text-xl font-display font-bold text-ink">Wyślij sygnał</h2>
                  <p className="mt-1 text-sm text-muted">Opisz sprawę konkretnie. Im więcej faktów, tym łatwiej zweryfikować informację.</p>
                </div>

                <Input
                  label="Temat *"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Np. nieprawidłowości w..."
                  maxLength={200}
                  required
                />

                <Textarea
                  label="Treść wiadomości *"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Opisz co się stało, gdzie, kiedy, kto może potwierdzić informacje. Nie musisz podawać swojego imienia i nazwiska."
                  rows={8}
                  required
                />

                <Input
                  label="Opcjonalny kontakt zwrotny"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="E-mail / telefon / Signal (opcjonalnie)"
                  hint="Zostaw puste, jeśli chcesz pozostać anonimowy."
                />

                {errorMsg && (
                  <div className="rounded-lg border border-accent/30 bg-accent-dim p-4 text-sm text-ink">
                    {errorMsg}
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button type="submit" loading={loading} leftIcon={<Send className="h-4 w-4" />}>
                    Wyślij zgłoszenie
                  </Button>
                  <p className="text-xs text-muted">Wysyłając, akceptujesz, że wiadomość zostanie zapisana w celu weryfikacji dziennikarskiej.</p>
                </div>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
