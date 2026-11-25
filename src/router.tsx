import { createRouter, createRootRoute, createRoute, redirect } from '@tanstack/react-router';
import { Layout } from '@/components/layout/Layout';
import { IndexPage, loader as indexLoader } from '@/pages/Index';
import { AuthPage } from '@/pages/Auth';
import { ContentDetailPage } from '@/pages/ContentDetail';
import { AccountPage } from '@/pages/Account';
import { AdminPage } from '@/pages/Admin';
import { NotFoundPage } from '@/pages/NotFound';
import { SprawyPage } from '@/pages/Sprawy';
import { KulisyPage } from '@/pages/Kulisy';
import { KsiazkiPage } from '@/pages/Ksiazki';
import { SprawySadowePage } from '@/pages/SprawySadowe';
import { PoznajMniePage } from '@/pages/PoznajMnie';
import { KlubPage } from '@/pages/Klub';
import { InformatorPage } from '@/pages/Informator';
import { RegulaminPage } from '@/pages/Regulamin';
import { PolitykaPrywatnosciPage } from '@/pages/PolitykaPrywatnosci';

const rootRoute = createRootRoute({
  component: Layout,
});

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexPage,
  loader: indexLoader,
});

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth',
  component: AuthPage,
});

const contentDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/c/$slug',
  component: ContentDetailPage,
  validateSearch: () => ({}),
});

const sprawyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sprawy',
  component: SprawyPage,
});

const kulisyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/kulisy',
  component: KulisyPage,
});

const ksiazkiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ksiazki',
  component: KsiazkiPage,
});

const sprawySadoweRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sprawy-sadowe',
  component: SprawySadowePage,
});

const poznajMnieRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/poznaj-mnie',
  component: PoznajMniePage,
});

const klubRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/klub',
  component: KlubPage,
});

const informatorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/informator',
  component: InformatorPage,
});

// Legacy aliases
const karieraAliasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/c/kariera',
  beforeLoad: () => {
    throw redirect({ to: '/poznaj-mnie' });
  },
  component: () => null,
});

const oMnieAliasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/c/o-mnie',
  beforeLoad: () => {
    throw redirect({ to: '/poznaj-mnie' });
  },
  component: () => null,
});

const informatorAliasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/c/informator',
  beforeLoad: () => {
    throw redirect({ to: '/informator' });
  },
  component: () => null,
});

const ksiazkiAliasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/c/ksiazki',
  beforeLoad: () => {
    throw redirect({ to: '/ksiazki' });
  },
  component: () => null,
});

const wspierajacyAliasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/c/wspierajacy',
  beforeLoad: () => {
    throw redirect({ to: '/klub' });
  },
  component: () => null,
});

const accountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/konto',
  component: AccountPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPage,
});

const regulaminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/regulamin',
  component: RegulaminPage,
});

const politykaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/polityka-prywatnosci',
  component: PolitykaPrywatnosciPage,
});

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/404',
  component: NotFoundPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  authRoute,
  contentDetailRoute,
  sprawyRoute,
  kulisyRoute,
  ksiazkiRoute,
  sprawySadoweRoute,
  poznajMnieRoute,
  klubRoute,
  informatorRoute,
  regulaminRoute,
  politykaRoute,
  karieraAliasRoute,
  oMnieAliasRoute,
  informatorAliasRoute,
  ksiazkiAliasRoute,
  wspierajacyAliasRoute,
  accountRoute,
  adminRoute,
  notFoundRoute,
]);

export const router = createRouter({ routeTree, defaultNotFoundComponent: NotFoundPage });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
