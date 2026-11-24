import { Link } from '@tanstack/react-router';
import { Crown, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { Content } from '@/lib/supabase';
import { formatRelativePL } from '@/lib/utils';

export function ClubBannerSection({ isSupporter, supporterItems }: { isSupporter: boolean; supporterItems: Content[] }) {
  const latestClub = supporterItems[0];

  if (isSupporter) {
    return (
      <section className="container">
        <Card className="bg-surface-hover border-gold/20 p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gold-dim">
                <Crown className="h-5 w-5 text-gold" />
              </div>
              <h2 className="text-xl font-display font-bold text-ink md:text-2xl">Dziękujemy, że jesteś w Klubie Bez Maski</h2>
              <p className="mt-2 text-muted">
                {latestClub
                  ? `Najnowszy materiał dla Klubu: ${latestClub.title} (${formatRelativePL(latestClub.published_at || latestClub.created_at)}).`
                  : 'Masz dostęp do materiałów dla wspierających. Nowe treści klubowe pojawią się tutaj automatycznie.'}
              </p>
            </div>
            {latestClub ? (
              <Link to="/c/$slug" params={{ slug: latestClub.slug }} className="btn btn-primary inline-flex shrink-0 items-center gap-2">
                Otwórz materiał <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link to="/klub" className="btn btn-primary inline-flex shrink-0 items-center gap-2">
                Przejdź do Klubu <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </Card>
      </section>
    );
  }

  return (
    <section className="container">
      <Card className="bg-surface-hover border-gold/20 p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gold-dim">
              <Crown className="h-5 w-5 text-gold" />
            </div>
            <h2 className="text-xl font-display font-bold text-ink md:text-2xl">Klub Bez Maski</h2>
            <p className="mt-2 text-muted">Wspieraj niezależne dziennikarstwo i uzyskaj dostęp do ekskluzywnych materiałów, nagrań i zamkniętej społeczności.</p>
          </div>
          <Link to="/klub" className="btn btn-primary inline-flex shrink-0 items-center gap-2">
            Poznaj klub <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Card>
    </section>
  );
}
