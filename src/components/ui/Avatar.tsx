import { cn } from '@/lib/utils';

interface AvatarProps {
  imgSrc: any;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
  status?: 'online' | 'offline' | 'busy';
  statusPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  className?: string;
  style?: React.CSSProperties;
}

const Avatar = ({
  imgSrc,
  alt,
  name,
  size = 'md',
  shape = 'circle',
  status,
  statusPosition = 'bottom-right',
  className,
  style,
}: AvatarProps) => {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
  };

  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4'
  };

  const statusPositions = {
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'top-right': 'top-0 right-0',
    'top-left': 'top-0 left-0'
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const bgColors = [
    'bg-gold/20',
    'bg-red/20',
    'bg-green/20',
    'bg-blue/20',
    'bg-purple/20',
    'bg-pink/20',
    'bg-orange/20',
    'bg-teal/20'
  ];

  const getColorFromName = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return bgColors[Math.abs(hash) % bgColors.length];
  };

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center overflow-hidden font-medium',
        sizes[size],
        shape === 'circle' ? 'rounded-full' : 'rounded-xl',
        className
      )}
      style={style}
    >
      {imgSrc ? (
        <img
          src={imgSrc}
          alt={alt || name || 'Avatar'}
          className="w-full h-full object-cover"
        />
      ) : (
        <div
          className={cn('w-full h-full flex items-center justify-center', getColorFromName(name || ''))}
          style={{ backgroundColor: undefined }}
        >
          {name ? (
            <span>{getInitials(name)}</span>
          ) : (
            <svg className="w-1/2 h-1/2 text-muted" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          )}
        </div>
      )}

      {status && (
        <span
          className={cn(
            'absolute border-2 border-bg rounded-full',
            statusSizes[size],
            statusPositions[statusPosition],
            {
              'bg-green': status === 'online',
              'bg-red': status === 'busy',
              'bg-muted': status === 'offline'
            }
          )}
          aria-label={status}
        />
      )}
    </div>
  );
};

Avatar.displayName = 'Avatar';

export { Avatar };

// Avatar group component
interface AvatarGroupProps {
  avatars: Array<{ imgSrc?: string; name: string; size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' }>;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const AvatarGroup = ({ avatars, max = 5, size = 'md', className }: AvatarGroupProps) => {
  const visibleAvatars = avatars.slice(0, max);
  const remaining = avatars.length - max;

  const sizes = {
    xs: 'w-6 h-6 -ml-1',
    sm: 'w-8 h-8 -ml-2',
    md: 'w-10 h-10 -ml-3',
    lg: 'w-12 h-12 -ml-4',
    xl: 'w-16 h-16 -ml-5'
  };

  return (
    <div className={cn('flex items-center', className)}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={avatar.name}
          imgSrc={avatar.imgSrc}
          name={avatar.name}
          size={avatar.size || size}
          className={cn(index > 0 && sizes[size])}
        />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            'flex items-center justify-center bg-line text-muted font-medium border-2 border-bg',
            sizes[size]
          )}
          style={{ borderRadius: '50%' }}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};