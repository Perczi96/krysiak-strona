import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'gold' | 'red' | 'green' | 'blue' | 'muted' | 'new' | 'live' | 'premium' | 'public' | 'subscriber' | 'supporter';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ children, variant = 'default', size = 'md', dot = false, className, ...props }, ref) => {
    const variants = {
      default: 'bg-border text-muted',
      gold: 'bg-gold-dim text-gold border border-gold/30',
      red: 'bg-red/20 text-red border border-red/30',
      green: 'bg-green/20 text-green border border-green/30',
      blue: 'bg-blue/20 text-blue border border-blue/30',
      muted: 'bg-border text-muted',
      new: 'badge-new',
      live: 'badge-live',
      premium: 'badge-premium',
      public: 'badge-public',
      subscriber: 'badge-subscriber',
      supporter: 'badge-supporter',
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
          'bg-gold': variant === 'gold' || variant === 'supporter' || variant === 'premium',
          'bg-red': variant === 'red',
          'bg-green': variant === 'green' || variant === 'public',
          'bg-blue': variant === 'blue' || variant === 'subscriber',
          'bg-accent': variant === 'new' || variant === 'live',
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
    public: { label: 'Publiczne', icon: '🌐', variant: 'public' as const },
    subscriber: { label: 'Zalogowani', icon: '🔓', variant: 'subscriber' as const },
    supporter: { label: 'Wspierający', icon: '👑', variant: 'supporter' as const }
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

  const variants: Record<string, 'gold' | 'red' | 'green' | 'blue' | 'muted' | 'premium'> = {
    bronze: 'blue',
    silver: 'green',
    gold: 'premium',
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
    subscriber: { label: 'Subskrybent', variant: 'subscriber' as const, icon: '🔔' },
    supporter: { label: 'Wspierający', variant: 'supporter' as const, icon: '👑' },
    admin: { label: 'Admin', variant: 'red' as const, icon: '⚙️' }
  };

  const config = configs[role];

  return (
    <Badge variant={config.variant} dot>
      {config.icon} {config.label}
    </Badge>
  );
};
