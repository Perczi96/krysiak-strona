import { useEffect, useState } from 'react';
import { X, Share2, Smartphone, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { isIOS, isPWAInstalled } from '@/lib/push';

export function InstallBanner() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [step, setStep] = useState(0);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  // iOS detection
  const iOS = isIOS();
  const installed = isPWAInstalled();

  useEffect(() => {
    // Sprawdź czy już odrzucono
    const dismissedValue = localStorage.getItem('install-banner-dismissed');
    if (dismissedValue === 'true') {
      setDismissed(true);
      return;
    }

    // Nie pokazuj jeśli zainstalowane lub na desktopie (chyba że iOS)
    if (installed || (!iOS && typeof window !== 'undefined' && window.innerWidth >= 768)) {
      return;
    }

    // Android: beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };

    // iOS: pokaż po chwili jeśli nie zainstalowane
    const timer = setTimeout(() => {
      if (iOS && !installed && !dismissed) {
        setShow(true);
      }
    }, 3000);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, [iOS, installed, dismissed]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShow(false);
        setDismissed(true);
        localStorage.setItem('install-banner-dismissed', 'true');
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    localStorage.setItem('install-banner-dismissed', 'true');
  };

  if (!show || dismissed || installed) return null;

  // iOS instructions steps
  const iOSSteps = [
    {
      icon: Share2,
      title: 'Kliknij ikonę Udostępnij',
      description: 'Na dole ekranu (kwadrat ze strzałką w górę)'
    },
    {
      icon: Smartphone,
      title: 'Wybierz "Dodaj do ekranu początkowego"',
      description: 'Możesz zmienić nazwę na "Bez Maski"'
    },
    {
      icon: CheckCircle,
      title: 'Kliknij "Dodaj"',
      description: 'Aplikacja pojawi się na ekranie głównym jak natywna'
    }
  ];

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:bottom-4 md:left-auto md:right-4 md:w-96 animate-slide-up pb-safe">
      <div className="card glass-strong shadow-2xl overflow-hidden">
        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gold/20 rounded-xl">
                  <Smartphone className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-ink">Zainstaluj aplikację</h3>
                  <p className="text-sm text-muted">
                    Mieć Bez Maski zawsze pod ręką — jak natywna aplikacja, bez App Store
                  </p>
                </div>
              </div>

              {iOS && (
                <div className="space-y-3 mb-3" role="list" aria-label="Instrukcja instalacji na iOS">
                  {iOSSteps.map((s, i) => (
                    <div key={i} className={cn(
                        'flex items-start gap-3 p-3 rounded-xl transition-colors',
                        i <= step ? 'bg-gold/5 border border-gold/20' : 'bg-panel-hover'
                      )} role="listitem" aria-current={i === step ? 'step' : undefined}>
                      <div className={cn(
                          'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
                          i <= step ? 'bg-gold text-bg' : 'bg-line text-muted'
                        )}>
                        {i < step ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <s.icon className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-ink">{s.title}</p>
                        <p className="text-sm text-muted">{s.description}</p>
                      </div>
                      {i === step && (
                        <Button variant="ghost" size="sm" onClick={() => setStep(i + 1)}>
                          {i < 2 ? 'Dalej' : 'Gotowe'}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {!iOS && deferredPrompt && (
                <p className="text-sm text-muted mb-3">
                  Lub kliknij przycisk poniżej, aby zainstalować jedną kliknięciem
                </p>
              )}
            </div>

            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 rounded-lg text-muted hover:text-ink hover:bg-panel-hover transition-colors"
              aria-label="Zamknij"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-line">
            {deferredPrompt && (
              <Button onClick={handleInstall} className="flex-1" fullWidth>
                Zainstaluj teraz
              </Button>
            )}
            <Button variant="ghost" onClick={handleDismiss} className="flex-1">
              Później
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Type for beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}