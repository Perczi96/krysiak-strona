import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { RouterProvider } from '@tanstack/react-router';
import { ToasterProvider } from '@/components/ui/Toaster';
import { Providers } from '@/components/layout/Providers';
import { router } from '@/router';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min
      gcTime: 1000 * 60 * 30, // 30 min
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToasterProvider>
        <Providers>
          <RouterProvider router={router} />
          <TanStackRouterDevtools position="bottom-right" />
        </Providers>
      </ToasterProvider>
    </QueryClientProvider>
  </StrictMode>
);