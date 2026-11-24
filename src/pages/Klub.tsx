import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { CheckCircle, Crown, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { getActiveTiers, getContentList, type Content, type Tier } from '@/lib/supabase';
import { formatPricePLN } from '@/lib/stripe';
import { cn, formatRelativePL, getYouTubeThumbnail } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export function KlubPage() {
  const { profile, isLoading: authLoading } = useAuth();
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [supporterContent, setSupporterContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [tierData, contentData] = await Promise.all([
        getActiveTiers(),
        getContentList({ visibility: 'supporter', limit: 6 }),
      ]);
      setTiers(tierData.filter((t) => t.slug !== 'test'));
      setSupporterContent(contentData);
      setLoading(false);
    };
    void load();
  }, []);

  const isSupporter = profile?.role === 'supporter' && profile?.subscription_status === 'active';

  return (
    <div className="container py-8 md:py-12">
      <div className="mb-10 max-w-3xl">
        <Badge variant="gold" dot>Klub</Badge>
        <h1 className="mt-4 text-3xl font-display font-bold text-ink md:text-4xl">Klub Bez Maski</h1>
        <p className="mt-3 text-base text-muted md:text-lg">
          Wspieraj niezależne dziennikarstwo śledcze i uzyskaj dostęp do materiałów dla wspierających, wcześniejszych publikacji i zamkniętej społeczności.
        </p>
        {!authLoading && !profile && (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a href="/auth?redirect=/klub" className="btn btn-primary">Zaloguj się, aby dołączyć</a>
            <a href="/auth?mode=register&redirect=/klub" className="btn btn-secondary">Załóż konto</a>
          </div>
        )}
        {!authLoading && profile && !isSupporter && (
          <div className="mt-6">
            <Link to="/konto" className="btn btn-gold inline-flex items-center gap-2"><Crown className="h-4 w-4" /> Wybierz plan wsparcia</Link>
          </div>
        )}
        {isSupporter && (
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold-dim px-4 py-2 text-sm font-medium text-gold">
            <Crown className="h-4 w-4" /> Masz aktywny dostęp do Klubu
          </div>
        )}
      </div>

      <section className="mb-12">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-display font-bold text-ink">Progi wsparcia</h2>
          <Link to="/konto" className="text-sm font-medium text-gold hover:text-gold-light">Zarządzaj wsparciem →</Link>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <div className="h-8 w-1/2 animate-pulse rounded bg-surface-hover" />
                <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-surface-hover" />
                <div className="mt-2 h-4 w-full animate-pulse rounded bg-surface-hover" />
                <div className="mt-6 h-10 w-full animate-pulse rounded bg-surface-hover" />
              </Card>
            ))}
          </div>
        ) : tiers.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tiers.map((tier) => {
              const isCurrent = profile?.tier_id === tier.id;
              return (
                <Card key={tier.id} className={cn('p-6', isCurrent && 'border-gold/40 bg-gold/5 ring-1 ring-gold/20')}>
                  {isCurrent && <Badge variant="gold" className="mb-4">Twój plan</Badge>}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-display font-bold text-ink">{formatPricePLN(tier.price_monthly_pln)}</span>
                      <span className="text-muted">/ miesiąc</span>
                    </div>
                    {tier.price_yearly_pln && (
                      <p className="mt-1 text-sm text-muted">lub {formatPricePLN(tier.price_yearly_pln)} rocznie</p>
                    )}
                  </div>
                  <h3 className="text-xl font-display font-bold text-ink">{tier.name}</h3>
                  <p className="mt-2 text-sm text-muted">{tier.description}</p>
                  <ul className="mt-5 space-y-2">
                    {(tier.benefits || []).map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted">
                        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    {profile ? (
                      <Link
                        to="/konto"
                        className={cn('btn w-full', isCurrent ? 'btn-secondary' : 'btn-gold')}
                      >
                        {isCurrent ? 'Zarządzaj planem' : 'Dołącz do Klubu'}
                      </Link>
                    ) : (
                      <a
                        href="/auth?redirect=/klub"
                        className={cn('btn w-full', isCurrent ? 'btn-secondary' : 'btn-gold')}
                      >
                        Zaloguj się i dołącz
                      </a>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <Crown className="mx-auto mb-3 h-10 w-10 text-gold" />
            <h3 className="text-xl font-display font-bold text-ink">Progi wsparcia pojawią się wkrótce</h3>
            <p className="mt-2 text-muted">Konfigurujemy teraz opcje wsparcia. W międzyczasie możesz założyć konto lub wrócić na stronę główną.</p>
            <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
              <a href="/auth?redirect=/klub" className="btn btn-primary">Zaloguj się</a>
              <Link to="/" className="btn btn-secondary">Strona główna</Link>
            </div>
          </Card>
        )}
      </section>

      <section>
        <div className="mb-5 flex items-center gap-2">
          <Lock className="h-5 w-5 text-gold" />
          <h2 className="text-2xl font-display font-bold text-ink">Materiały dla wspierających</h2>
        </div>
        {supporterContent.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {supporterContent.map((item) => {
              const thumb = item.thumbnail_url || (item.video_id ? getYouTubeThumbnail(item.video_id) : null);
              return (
                <Link key={item.id} to="/c/$slug" params={{ slug: item.slug }} className="group block">
                  <Card variant="hover" className="h-full overflow-hidden p-0">
                    <div className="relative aspect-video bg-surface">
                      {thumb && <img src={thumb} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />}
                      <div className="absolute inset-0 bg-gradient-to-t from-bg/60 to-transparent" />
                      <span className="premium-badge"><Lock className="h-3 w-3" /> Dla Patronów</span>
                    </div>
                    <div className="p-5">
                      <p className="text-xs text-muted">{formatRelativePL(item.published_at || item.created_at)}</p>
                      <h3 className="mt-2 line-clamp-2 font-display font-bold text-ink transition-colors group-hover:text-gold">{item.title}</h3>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted">Ekskluzywne materiały dla wspierających będą pojawiać się tutaj. Dołącz do Klubu, aby mieć do nich dostęp jako pierwszy.</p>
            {profile ? (
              <Link to="/konto" className="btn btn-primary mt-5 inline-flex items-center gap-2">
                Zobacz opcje wsparcia <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <a href="/auth?redirect=/klub" className="btn btn-primary mt-5 inline-flex items-center gap-2">
                Zaloguj się <ArrowRight className="h-4 w-4" />
              </a>
            )}
          </Card>
        )}
      </section>
    </div>
  );
}
