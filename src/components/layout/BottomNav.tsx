import { Link, useLocation } from '@tanstack/react-router';
import { Home, Search, User, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/useAuth';

const navItems = [
  { href: '/', label: 'Strona główna', icon: Home, show: true },
  { href: '/c/filmy', label: 'Szukaj', icon: Search, show: true },
  { href: '/c/wspierajacy', label: 'Progi', icon: Crown, show: true },
  { href: '/konto', label: 'Profil', icon: User, show: 'auth' },
] as const;

export function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  // Only on mobile
  if (typeof window !== 'undefined' && window.innerWidth >= 768) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border pb-safe glass-strong"
      aria-label="Nawigacja dolna"
    >
      <div className="grid grid-cols-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href ||
            (item.href !== '/' && location.pathname.startsWith(item.href));

          const shouldShow = item.show === true ||
            (item.show === 'auth' && user);

          if (!shouldShow) return null;

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
      </div>
    </nav>
  );
}

// Floating action button removed per new design
