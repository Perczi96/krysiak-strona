import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'gold' | 'red' | 'green' | 'blue' | 'muted';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ children, variant = 'default', size = 'md', dot = false, className, ...props }, ref) => {
    const variants = {
      default: 'bg-line text-muted',
      gold: 'bg-gold/20 text-gold border border-gold/30',
      red: 'bg-red/20 text-red border border-red/30',
      green: 'bg-green/20 text-green border border-green/30',
      blue: 'bg-blue/20 text-blue border border-blue/30',
      muted: 'bg-line text-muted'
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm'
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full font-medium',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {dot && <span className={cn('w-1.5 h-1.5 rounded-full', {
          'bg-gold': variant === 'gold',
          'bg-red': variant === 'red',
          'bg-green': variant === 'green',
          'bg-blue': variant === 'blue',
          'bg-muted': variant === 'muted' || variant === 'default'
        })} />}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

// Visibility badge
export const VisibilityBadge = ({ visibility }: { visibility: 'public' | 'subscriber' | 'supporter' }) => {
  const configs = {
    public: { label: 'Publiczne', icon: '🌐', variant: 'green' as const },
    subscriber: { label: 'Zalogowani', icon: '🔓', variant: 'blue' as const },
    supporter: { label: 'Wspierający', icon: '👑', variant: 'gold' as const }
  };

  const config = configs[visibility];

  return (
    <Badge variant={config.variant} dot>
      {config.icon} {config.label}
    </Badge>
  );
};

// Tier badge
export const TierBadge = ({ tier }: { tier: { name: string; slug: string; sort_order: number } | null }) => {
  if (!tier) return null;

  const variants: Record<string, 'gold' | 'red' | 'green' | 'blue' | 'muted'> = {
    bronze: 'blue',
    silver: 'green',
    gold: 'gold',
    test: 'muted'
  };

  return (
    <Badge variant={variants[tier.slug] || 'default'} dot>
      {tier.name}
    </Badge>
  );
};

// Role badge
export const RoleBadge = ({ role }: { role: 'guest' | 'subscriber' | 'supporter' | 'admin' }) => {
  const configs = {
    guest: { label: 'Gość', variant: 'muted' as const, icon: '👤' },
    subscriber: { label: 'Subskrybent', variant: 'blue' as const, icon: '🔔' },
    supporter: { label: 'Wspierający', variant: 'gold' as const, icon: '👑' },
    admin: { label: 'Admin', variant: 'red' as const, icon: '⚙️' }
  };

  const config = configs[role];

  return (
    <Badge variant={config.variant} dot>
      {config.icon} {config.label}
    </Badge>
  );
};