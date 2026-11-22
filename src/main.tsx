import { Component, StrictMode, type ReactNode } from 'react';
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

class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    console.error('React ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          padding: 24,
          margin: 16,
          borderRadius: 12,
          background: '#1a1a1a',
          color: '#fff',
          font: '16px/1.5 system-ui, sans-serif',
          border: '1px solid #c8102e',
          maxWidth: 960,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}>
          <h1 style={{ margin: '0 0 12px', fontSize: 24, color: '#f4f1ea' }}>Błąd aplikacji</h1>
          <div style={{ color: '#ff6b6b', marginBottom: 12 }}>{this.state.error.message}</div>
          <pre style={{ margin: 0, fontSize: 12, color: '#9a948c', overflow: 'auto' }}>
            {this.state.error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToasterProvider>
          <Providers>
            <RouterProvider router={router} />
            {import.meta.env.DEV && (
              <TanStackRouterDevtools router={router} position="bottom-right" />
            )}
          </Providers>
        </ToasterProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);
