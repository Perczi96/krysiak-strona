import { Link, useLocation } from '@tanstack/react-router';
import { Home, Search, User, Crown, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/useAuth';

const navItems = [
  { href: '/', label: 'Strona główna', icon: Home, show: true },
  { href: '/c/filmy', label: 'Szukaj', icon: Search, show: true },
  { href: '/c/wspierajacy', label: 'Progi', icon: Crown, show: true },
] as const;

export function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-surface/95 backdrop-blur-lg border-t border-border pb-safe"
      aria-label="Nawigacja dolna"
    >
      <div className="grid grid-cols-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href ||
            (item.href !== '/' && location.pathname.startsWith(item.href));

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-2 py-2.5 transition-colors',
                isActive
                  ? 'text-accent'
                  : 'text-muted hover:text-ink'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className={cn('w-6 h-6', isActive && 'fill-current')} aria-hidden="true" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* 4th column - always visible: Profil when logged in, Zaloguj when not */}
        {user ? (
          <Link
            to="/konto"
            className={cn(
              'flex flex-col items-center justify-center gap-1 px-2 py-2.5 transition-colors',
              location.pathname === '/konto' || location.pathname.startsWith('/konto')
                ? 'text-accent'
                : 'text-muted hover:text-ink'
            )}
            aria-current={location.pathname === '/konto' ? 'page' : undefined}
          >
            <User className={cn('w-6 h-6', (location.pathname === '/konto' || location.pathname.startsWith('/konto')) && 'fill-current')} aria-hidden="true" />
            <span className="text-xs font-medium">Profil</span>
          </Link>
        ) : (
          <Link
            to="/auth"
            className={cn(
              'flex flex-col items-center justify-center gap-1 px-2 py-2.5 transition-colors',
              location.pathname === '/auth' || location.pathname.startsWith('/auth')
                ? 'text-accent'
                : 'text-muted hover:text-ink'
            )}
            aria-current={location.pathname === '/auth' ? 'page' : undefined}
          >
            <LogIn className={cn('w-6 h-6', (location.pathname === '/auth' || location.pathname.startsWith('/auth')) && 'fill-current')} aria-hidden="true" />
            <span className="text-xs font-medium">Zaloguj</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
