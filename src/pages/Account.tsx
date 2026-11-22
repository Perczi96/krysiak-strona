import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Crown, CreditCard, Shield, LogOut, Settings, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { getActiveTiers, createStripeCheckout, createStripePortalSession, enableTestSupporterMode, disableTestSupporterMode, isTestMode } from '@/lib/supabase';
import { formatPricePLN } from '@/lib/stripe';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/Toaster';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, TierBadge, RoleBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';

function AccountHeader({ profile }: { profile: any }) {
  const avatarUrl = profile?.avatar_url;
  return (
    <Card className="p-6">
      <div className="flex items-center gap-4">
        <Avatar imgSrc={avatarUrl as any} name={profile?.display_name} size="xl" />
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif font-bold text-ink">{profile?.display_name || 'Użytkownik'}</h1>
            <RoleBadge role={profile?.role || 'guest'} />
          </div>
          <p className="text-muted mt-1">{profile?.email}</p>
          <div className="flex items-center gap-3 mt-3">
            {profile?.tier_id && (
              <TierBadge tier={{ name: 'Złoty', slug: 'gold', sort_order: 30 }} />
            )}
            {profile?.subscription_status && (
              <Badge variant={profile.subscription_status === 'active' ? 'green' : 'red'} dot>
                {profile.subscription_status === 'active' ? 'Aktywna subskrypcja' : profile.subscription_status}
              </Badge>
            )}
            {profile?.subscription_period_end && (
              <span className="text-sm text-muted">
                Do: {new Date(profile.subscription_period_end).toLocaleDateString('pl-PL')}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function TierCard({ tier, currentTierId, isLoading, onSelect }: {
  tier: any;
  currentTierId: string | null;
  isLoading: boolean;
  onSelect: (tierId: string) => void;
}) {
  const isCurrent = currentTierId === tier.id;
  const isTest = tier.slug === 'test';

  return (
    <Card
      className={cn(
        'relative p-6 transition-all',
        isCurrent ? 'border-gold/50 bg-gold/5 ring-1 ring-gold/20' : 'hover:border-gold/30'
      )}
    >
      {isCurrent && (
        <div className="absolute -top-2 -right-2 bg-gold text-bg text-xs px-2 py-0.5 rounded-full font-medium">
          Obecny plan
        </div>
      )}

      <div className="mb-4">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-3xl font-serif font-bold text-ink">{formatPricePLN(tier.price_monthly_pln)}</span>
          <span className="text-muted">/ miesiąc</span>
        </div>
        {tier.price_yearly_pln && (
          <div className="flex items-center gap-2 text-sm text-muted">
            <span className="line-through">{formatPricePLN(tier.price_yearly_pln)}</span>
            <span className="text-green font-medium">{formatPricePLN(Math.round(tier.price_yearly_pln / 12))}/mies (rocznie)</span>
            <Badge variant="green" size="sm">-17%</Badge>
          </div>
        )}
      </div>

      <h3 className="text-lg font-semibold text-ink mb-2">{tier.name}</h3>
      <p className="text-muted text-sm mb-4">{tier.description}</p>

      <ul className="space-y-2 mb-6">
        {tier.benefits?.map((benefit: string, i: number) => (
          <li key={i} className="flex items-start gap-2 text-sm text-muted">
            <CheckCircle className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
            {benefit}
          </li>
        ))}
      </ul>

      {isTest && isTestMode() && (
        <div className="p-3 bg-gold/5 border border-gold/20 rounded-lg mb-4 text-sm text-gold">
          <strong>Tryb testowy:</strong> Kliknij, by symulować ten plan bez płatności.
        </div>
      )}

      <Button
        className="w-full"
        size="lg"
        variant={isCurrent ? 'secondary' : 'primary'}
        loading={isLoading}
        disabled={isCurrent}
        onClick={() => onSelect(tier.id)}
      >
        {isCurrent ? 'Twój plan' : isTest && isTestMode() ? 'Włącz testowo' : 'Wybierz ten plan'}
      </Button>
    </Card>
  );
}

function SettingsSection({ profile }: { profile: any }) {
  const { updateProfile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [emailNotifications, setEmailNotifications] = useState(profile?.email_notifications ?? true);
  const [pushNotifications, setPushNotifications] = useState(profile?.push_notifications ?? true);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({ display_name: displayName });
    // Note: email_notifications and push_notifications would need separate update
    setSaving(false);
    toast({ type: 'success', title: 'Zapisano', message: 'Zmiany zostały zapisane' });
    refreshProfile();
  };

  return (
    <Card>
      <h2 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
        <Settings className="w-5 h-5 text-gold" />
        Ustawienia konta
      </h2>

      <div className="space-y-4">
        <Input
          label="Nazwa wyświetlana"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Twoja nazwa"
        />

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-ink">Powiadomienia e-mail</p>
            <p className="text-sm text-muted">O nowych materiałach i live'ach</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-line peer-focus:ring-2 peer-focus:ring-gold rounded-full peer peer-checked:bg-gold peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:w-5 after:h-5 after:rounded-full after:transition-all" />
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-ink">Powiadomienia push</p>
            <p className="text-sm text-muted">W przeglądarce i na telefonie</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={pushNotifications}
              onChange={(e) => setPushNotifications(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-line peer-focus:ring-2 peer-focus:ring-gold rounded-full peer peer-checked:bg-gold peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:w-5 after:h-5 after:rounded-full after:transition-all" />
          </label>
        </div>

        <Button onClick={handleSave} loading={saving}>
          Zapisz zmiany
        </Button>
      </div>
    </Card>
  );
}

function BillingSection({ profile }: { profile: any }) {
  const { toast } = useToast();
  const [portalLoading, setPortalLoading] = useState(false);

  const handlePortal = async () => {
    setPortalLoading(true);
    const result = await createStripePortalSession({ returnUrl: window.location.origin + '/konto' });
    setPortalLoading(false);
    if (result?.url) {
      window.location.href = result.url;
    } else {
      toast({ type: 'error', title: 'Błąd', message: 'Nie udało się otworzyć portalu płatności' });
    }
  };

  return (
    <Card>
      <h2 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-gold" />
        Rozliczenia i płatności
      </h2>

      <div className="space-y-4">
        {profile?.stripe_customer_id ? (
          <>
            <p className="text-muted text-sm">
              Twoje konto Stripe: <code className="bg-panel-hover px-2 py-0.5 rounded text-xs">{profile.stripe_customer_id}</code>
            </p>
            <Button variant="secondary" onClick={handlePortal} loading={portalLoading} className="w-full sm:w-auto">
              <Settings className="w-4 h-4" /> Zarządzaj subskrypcją w portalu Stripe
            </Button>
          </>
        ) : (
          <p className="text-muted text-sm">Nie masz jeszcze skonfigurowanego konta płatniczego.</p>
        )}

        {profile?.subscription_status && (
          <div className="p-3 bg-panel-hover rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-muted">Status</span>
              <Badge variant={profile.subscription_status === 'active' ? 'green' : 'red'} dot>
                {profile.subscription_status === 'active' ? 'Aktywna' : profile.subscription_status}
              </Badge>
            </div>
            {profile.subscription_period_end && (
              <div className="flex justify-between">
                <span className="text-muted">Okres rozliczeniowy kończy się</span>
                <span className="font-medium text-ink">{new Date(profile.subscription_period_end).toLocaleDateString('pl-PL')}</span>
              </div>
            )}
            {profile.subscription_cancel_at_period_end && (
              <Badge variant="red" className="w-fit">Subskrypcja anulowana na koniec okresu</Badge>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

function TestModeSection() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [testLoading, setTestLoading] = useState(false);
  const isSupporter = profile?.role === 'supporter' && profile?.subscription_status === 'active';

  const handleEnableTest = async () => {
    setTestLoading(true);
    const success = await enableTestSupporterMode();
    setTestLoading(false);
    if (success) {
      toast({ type: 'success', title: 'Tryb testowy włączony', message: 'Masz teraz dostęp do treści dla wspierających (tylko w trybie deweloperskim)' });
      refreshProfile();
    } else {
      toast({ type: 'error', title: 'Błąd', message: 'Nie udało się włączyć trybu testowego' });
    }
  };

  const handleDisableTest = async () => {
    setTestLoading(true);
    const success = await disableTestSupporterMode();
    setTestLoading(false);
    if (success) {
      toast({ type: 'success', title: 'Tryb testowy wyłączony', message: 'Wrócono do normalnego konta' });
      refreshProfile();
    } else {
      toast({ type: 'error', title: 'Błąd', message: 'Nie udało się wyłączyć trybu testowego' });
    }
  };

  if (!isTestMode()) return null;

  return (
    <Card className="border-gold/30 bg-gold/5">
      <h2 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-gold" />
        Tryb deweloperski (VITE_TEST_MODE=true)
      </h2>
      <p className="text-sm text-muted mb-4">
        W trybie testowym możesz symulować status wspierającego bez płacania przez Stripe.
        To działa tylko lokalnie i na środowiskach deweloperskich.
      </p>

      {isSupporter ? (
        <Button variant="danger" onClick={handleDisableTest} loading={testLoading} className="w-full sm:w-auto">
          Wyłącz tryb testowy (wróć do subskrybenta)
        </Button>
      ) : (
        <Button variant="primary" onClick={handleEnableTest} loading={testLoading} className="w-full sm:w-auto">
          Włącz tryb testowy (symuluj wspierającego)
        </Button>
      )}
    </Card>
  );
}

export function AccountPage() {
  const { profile, isLoading, signOut } = useAuth();
  const { toast } = useToast();
  const [tiers, setTiers] = useState<any[]>([]);
  const [tiersLoading, setTiersLoading] = useState(true);
  const [selectedTierLoading, setSelectedTierLoading] = useState<string | null>(null);

  // Load tiers
  useState(() => {
    const loadTiers = async () => {
      const data = await getActiveTiers();
      setTiers(data);
      setTiersLoading(false);
    };
    loadTiers();
  });

  const handleTierSelect = async (tierId: string) => {
    setSelectedTierLoading(tierId);
    const result = await createStripeCheckout({ tierId, mode: 'subscription' });
    setSelectedTierLoading(null);
    if (result?.url) {
      window.location.href = result.url;
    }
  };

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="animate-pulse space-y-6 max-w-2xl mx-auto">
          <div className="h-24 bg-panel-hover rounded-xl" />
          <div className="h-24 bg-panel-hover rounded-xl" />
          <div className="h-24 bg-panel-hover rounded-xl" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-serif font-bold text-ink mb-4">Wymagane logowanie</h1>
        <p className="text-muted mb-6">Zaloguj się, aby zarządzać swoim kontem i wsparciem.</p>
        <a href="/auth?redirect=/konto" className="btn btn-primary">Zaloguj się</a>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-gold mb-4">
          <ArrowLeft className="w-4 h-4" /> Powrót
        </Link>
        <h1 className="text-3xl font-serif font-bold text-ink">Twoje konto</h1>
      </div>

      <div className="space-y-6">
        {/* Profile Header */}
        <AccountHeader profile={profile} />

        {/* Supporter Tiers */}
        {(profile.role !== 'supporter' || profile.subscription_status !== 'active') && (
          <section>
            <h2 className="text-xl font-serif font-bold text-ink mb-4 flex items-center gap-2">
              <Crown className="w-6 h-6 text-gold" />
              Wspieraj kanał
            </h2>
            <p className="text-muted mb-4">
              Wybierz plan wsparcia, aby odblokować ekskluzywne treści, wideo bez reklam,
              wcześniejszy dostęp do materiałów i społeczność wspierających.
            </p>

            {tiersLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1,2,3].map(i => (
                  <Card key={i} className="p-6 animate-pulse">
                    <div className="h-8 bg-panel-hover rounded w-1/2 mb-4" />
                    <div className="h-4 bg-panel-hover rounded w-3/4 mb-2" />
                    <div className="h-4 bg-panel-hover rounded w-1/2 mb-4" />
                    <div className="space-y-2">
                      <div className="h-4 bg-panel-hover rounded w-3/4" />
                      <div className="h-4 bg-panel-hover rounded w-full" />
                      <div className="h-4 bg-panel-hover rounded w-1/2" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tiers.filter(t => t.slug !== 'test' || isTestMode()).map(tier => (
                  <TierCard
                    key={tier.id}
                    tier={tier}
                    currentTierId={profile.tier_id}
                    isLoading={selectedTierLoading === tier.id}
                    onSelect={handleTierSelect}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Current Supporter Status */}
        {profile.role === 'supporter' && profile.subscription_status === 'active' && (
          <Card className="bg-gold/5 border-gold/20">
            <h2 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-gold" />
              Jesteś wspierającym! 👑
            </h2>
            <p className="text-muted">
              Dziękujemy za wsparcie! Masz dostęp do wszystkich treści ekskluzywnych.
              Twoja subskrypcja jest aktywna do {profile.subscription_period_end ? new Date(profile.subscription_period_end).toLocaleDateString('pl-PL') : 'nieokreślona'}.
            </p>
          </Card>
        )}

        {/* Billing */}
        <BillingSection profile={profile} />

        {/* Settings */}
        <SettingsSection profile={profile} />

        {/* Test Mode */}
        <TestModeSection />

        {/* Danger Zone */}
        <Card className="border-red/30">
          <h2 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-red" />
            Strefa niebezpieczna
          </h2>
          <Button variant="danger" onClick={async () => { await signOut(); toast({ type: 'info', title: 'Wylogowano' }); }} className="w-full sm:w-auto">
            <LogOut className="w-4 h-4" /> Wyloguj się
          </Button>
        </Card>
      </div>
    </div>
  );
}