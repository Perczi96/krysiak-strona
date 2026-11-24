# Bez Maski — Official PWA

Oficjalna aplikacja PWA dla kanału YouTube "Bez Maski" (Piotr Krysiak).

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite 6
- **Routing**: TanStack Router (file-based, type-safe)
- **State/Data**: TanStack React Query + Supabase Realtime
- **Styling**: Tailwind CSS v4 (custom gold/black theme)
- **Forms**: React Hook Form + Zod
- **Auth**: Supabase Auth (email/password + Magic Link, Google OAuth ready)
- **Payments**: Stripe Checkout + Billing + Customer Portal + Webhooks
- **Video**: YouTube embeds (free) → Bunny Stream/Vimeo (paid, ready)
- **Push**: Web Push VAPID via Supabase Edge Functions (Deno)
- **Hosting**: Cloudflare Pages (unlimited bandwidth, commercial OK)
- **Analytics**: Cloudflare Web Analytics (free, privacy-friendly)

## 📁 Project Structure

```
bezmaski-app/
├── public/                 # Static assets
│   ├── icons/             # PWA icons (generated from SVG)
│   ├── screenshots/       # Store screenshots
│   ├── manifest.json      # PWA manifest
│   ├── sw.js              # Service Worker (Workbox generates at build)
│   └── favicon.svg
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # Base components (Button, Input, Card, etc.)
│   │   ├── layout/       # Layout components (Header, BottomNav, etc.)
│   │   └── content/      # Content-specific (VideoPlayer, MarkdownRenderer)
│   ├── features/         # Feature modules
│   │   └── auth/         # Authentication (useAuth, forms)
│   ├── lib/              # Utilities & clients
│   │   ├── supabase.ts   # Supabase client + helpers
│   │   ├── database.types.ts  # TypeScript types from Supabase
│   │   ├── stripe.ts     # Stripe frontend helpers
│   │   ├── push.ts       # Web Push helpers
│   │   └── utils.ts      # Common utilities
│   ├── pages/            # Page components (routed)
│   ├── router.tsx        # TanStack Router config
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles + Tailwind v4
├── supabase/
│   ├── migrations/       # SQL migrations (run in order)
│   ├── functions/        # Edge Functions (Deno)
│   │   ├── stripe-create-checkout/
│   │   ├── stripe-webhook/
│   │   ├── stripe-create-portal/
│   │   └── send-push/
│   └── config.toml       # Local dev config
├── scripts/
│   └── generate-icons.js # PWA icon generator (sharp)
├── .github/workflows/    # CI/CD
└── package.json
```

## 🛠️ Development Setup

### Prerequisites

- Node.js 20+
- npm 10+
- Supabase CLI (optional, for local dev): `npm i -g supabase`
- Docker (optional, for local Supabase)

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env
# Edytuj .env i wpisz swoje klucze
```

**Wymagane zmienne:**
- `VITE_SUPABASE_URL` — z Supabase Dashboard → Settings → API
- `VITE_SUPABASE_ANON_KEY` — z Supabase Dashboard → Settings → API
- `VITE_STRIPE_PUBLISHABLE_KEY` — z Stripe Dashboard → Developers → API keys (test: `pk_test_...`)
- `VITE_VAPID_PUBLIC_KEY` — wygeneruj: `npx web-push generate-vapid-keys`

### 3. Generate PWA Icons

```bash
npm run generate:icons
```

### 4. Supabase Setup (Cloud - Recommended)

1. Stwórz projekt na [supabase.com](https://supabase.com) (Free tier)
2. W SQL Editor uruchom migracje z `supabase/migrations/` **w kolejności**
3. Skonfiguruj Edge Functions (Deploy → Functions)
4. Dodaj sekrety w Supabase Vault / Settings → Edge Functions:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT`
   - `SUPABASE_SERVICE_ROLE_KEY` (automatycznie)
   - `SITE_URL` (np. `https://twoja-strona.pages.dev`)

### 5. Stripe Setup (Test Mode)

1. Stwórz konto na [stripe.com](https://stripe.com)
2. W Dashboard → Developers → API keys skopiuj klucze testowe
3. Stwórz Produkty i Ceny (Products → Add product):
   - Bronze: 10 PLN/mies (monthly) + 100 PLN/rok (yearly, -17%)
   - Silver: 25 PLN/mies + 250 PLN/rok
   - Gold: 50 PLN/mies + 500 PLN/rok
   - Test: 0 PLN (sort_order: 99, dla developmentu)
4. Skopiuj Price IDs do tabeli `tiers` w Supabase
5. Skonfiguruj Webhook: `https://your-project.supabase.co/functions/v1/stripe-webhook`
   - Events: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_*`

### 6. Run Development Server

```bash
npm run dev
```

Otwórz http://localhost:5173

### 7. Build for Production

```bash
npm run build
npm run preview  # Test build locally
```

## 🌐 Deployment

### Cloudflare Pages (Recommended - Free)

1. Push do GitHub (main branch)
2. W Cloudflare Dashboard → Pages → Connect to Git
3. Build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Root directory: `/`
4. Environment Variables (w Cloudflare Pages Settings):
   - Wszystkie `VITE_*` z `.env`
5. Deploy!

### Supabase Edge Functions Deploy

```bash
supabase functions deploy stripe-create-checkout
supabase functions deploy stripe-webhook
supabase functions deploy stripe-create-portal
supabase functions deploy send-push
```

## 💰 Zero-Cost Development

| Service | Free Tier Limits |
|---------|------------------|
| **Cloudflare Pages** | Unlimited bandwidth, 500 builds/month |
| **Supabase** | 500MB DB, 2GB bandwidth, 50MB file storage |
| **Stripe** | Test mode unlimited, no card needed |
| **Cloudflare Analytics** | Unlimited, privacy-friendly |

**Przełącz na płatne tylko gdy zaczniesz zarabiać!**

## 🔐 RLS Policies (Row Level Security)

Zdefiniowane w `supabase/migrations/002_rls_policies.sql`:

- **Public content**: Dostępne wszystkim
- **Subscriber content**: Tylko zalogowani (role: subscriber, supporter, admin)
- **Supporter content**: Tylko aktywni wspierający (role: supporter, subscription_status: active)
  - Hierarchia tierów: wyższy `sort_order` daje dostęp do niższych (Gold → Silver → Bronze)
- **Admin**: Pełny dostęp do wszystkiego
- **Service Role**: Dla Edge Functions (pomiń RLS)

## 📱 PWA Features

- **Installable**: Android (beforeinstallprompt) + iOS (instrukcja "Dodaj do ekranu początkowego")
- **Offline**: Service Worker cache (Workbox)
- **Push Notifications**: VAPID via Edge Functions
- **Bottom Navigation**: Mobile-first UX
- **App Shortcuts**: Wideo, Tematy, Konto, Kontakt

## 🏗️ Architecture Decisions

1. **Single Supabase DB** — Ready for future React Native app
2. **PLN currency** — BLIK/Przelewy24 as one-time payments only
3. **Test mode** — `VITE_TEST_MODE=true` simulates supporter access without Stripe
4. **Deno Edge Functions** — Native TypeScript, web-push works in Deno
5. **Tier hierarchy in RLS** — Efficient, no client-side logic needed


## 📝 License

MIT — Free for personal and commercial use.

## 🙏 Credits

- Piotr Krysiak — Content creator
- Built with ❤️ using modern web stack
