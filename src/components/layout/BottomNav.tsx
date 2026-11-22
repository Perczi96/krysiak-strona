import { Link, useLocation } from '@tanstack/react-router';
import { Home, Video, BookOpen, Crown, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/useAuth';

const navItems = [
  { href: '/', label: 'Start', icon: Home, show: true },
  { href: '/c/filmy', label: 'Wideo', icon: Video, show: true },
  { href: '/c/tematy', label: 'Tematy', icon: BookOpen, show: true },
  { href: '/konto', label: 'Konto', icon: Crown, show: 'auth' },
  { href: '/c/informator', label: 'Kontakt', icon: MessageSquare, show: true },
] as const;

export function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  // Tylko na mobile
  if (typeof window !== 'undefined' && window.innerWidth >= 768) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-panel border-t border-line pb-safe"
      aria-label="Nawigacja dolna"
    >
      <div className="grid grid-cols-5">
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
                  ? 'text-gold'
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

// Floating action button for quick actions
export function FloatingActionButton() {
  if (typeof window !== 'undefined' && window.innerWidth >= 768) {
    return null;
  }

  return (
    <Link
      to="/c/informator"
      className="fixed bottom-20 right-4 z-30 btn btn-primary btn-lg rounded-full shadow-xl animate-pulse-gold pb-safe md:hidden"
      aria-label="Napisz do nas (Informator)"
    >
      <MessageSquare className="w-6 h-6" />
    </Link>
  );
}