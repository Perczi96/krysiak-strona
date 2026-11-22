import { createRouter, createRootRoute, createRoute } from '@tanstack/react-router';
import { Layout } from '@/components/layout/Layout';
import { IndexPage, loader as indexLoader } from '@/pages/Index';
import { AuthPage } from '@/pages/Auth';
import { ContentDetailPage } from '@/pages/ContentDetail';
import { AccountPage } from '@/pages/Account';
import { AdminPage } from '@/pages/Admin';
import { NotFoundPage } from '@/pages/NotFound';
import { useAuth } from '@/features/auth/useAuth';

// Root route with layout
const rootRoute = createRootRoute({
  component: Layout
});

// Public routes
export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexPage,
  loader: indexLoader
});

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth',
  component: AuthPage
});

// Content detail route (dynamic slug)
const contentDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/c/$slug',
  component: ContentDetailPage,
  validateSearch: () => ({})
});

// Explicit content category routes (for TypeScript route matching)
const contentCategories = [
  'wyroznione', 'seriale', 'filmy', 'media', 'teksty',
  'kariera', 'ksiazki', 'tematy', 'dzialalnosc', 'powiedzieli',
  'o-mnie', 'informator', 'wspierajacy'
];

const contentCategoryRoutes = contentCategories.map(category =>
  createRoute({
    getParentRoute: () => rootRoute,
    path: `/c/${category}`,
    component: ContentDetailPage,
    validateSearch: () => ({})
  })
);

// Protected routes (require auth)
const accountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/konto',
  component: AccountPage,
  beforeLoad: async () => {
    const { user } = useAuth();
    if (!user) {
      throw { redirect: '/auth?redirect=/konto' };
    }
  }
});

// Admin route (require admin role)
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPage,
  beforeLoad: async () => {
    const { profile } = useAuth();
    if (!profile || profile.role !== 'admin') {
      throw { redirect: '/' };
    }
  }
});

// 404
const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/404',
  component: NotFoundPage
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  authRoute,
  contentDetailRoute,
  ...contentCategoryRoutes,
  accountRoute,
  adminRoute,
  notFoundRoute
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}