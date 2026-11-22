-- ============================================
-- BEZ MASKI - Seed Tiers (v3)
-- Domyślne taryfy w PLN (grosze)
-- ============================================

insert into tiers (name, slug, price_monthly_pln, price_yearly_pln, description, benefits, sort_order, active) values
  (
    'Brązowy',
    'bronze',
    1000,          -- 10,00 PLN/mc
    10000,         -- 100,00 PLN/rok (2 mc gratis)
    'Podstawowe wsparcie kanału',
    '{"Dostęp do zamkniętych postów i dokumentów", "Wczesny dostęp do materiałów (24h)", "Odznaka \"Wspierający\" w komentarzach", "Dostęp do archiwum PDF"}',
    10,
    true
  ),
  (
    'Srebrny',
    'silver',
    2500,          -- 25,00 PLN/mc
    25000,         -- 250,00 PLN/rok
    'Rozszerzone wsparcie + materiały audio',
    '{"Wszystko z Brązowego", "Ekskluzywne nagrania audio (podcasty zza kulis)", "Miesięczne Q&A z Piotrem (live lub nagrane)", "Priorytetowe powiadomienia o nowych materiałach", "Dostęp do grup dyskusyjnych"}',
    20,
    true
  ),
  (
    'Złoty',
    'gold',
    5000,          -- 50,00 PLN/mc
    50000,         -- 500,00 PLN/rok
    'Pełny dostęp + kontakt bezpośredni',
    '{"Wszystko z Srebrnego", "Wideo bez reklam i z rozszerzonymi cięciami", "Tygodniowy newsletter \"Z biura\"", "Możliwość zgłaszania tematów do śledztw", "Roczne spotkanie online z Piotrem (grupa do 20 os.)", "Wzmianka w podziękowaniach w filmach"}',
    30,
    true
  )
on conflict (slug) do nothing;

-- Domyślny tier dla testów (gdy nie ma Stripe)
-- Używany przez TEST_MODE_SWITCH w aplikacji
insert into tiers (name, slug, price_monthly_pln, price_yearly_pln, description, benefits, sort_order, active) values
  (
    'Testowy (dev)',
    'test',
    0,
    0,
    'Tymczasowy tier do testów lokalnych bez Stripe',
    '{"Pełny dostęp do treści supporter dla testów"}',
    99,
    true
  )
on conflict (slug) do nothing;