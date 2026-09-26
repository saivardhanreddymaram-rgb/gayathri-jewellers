import { clsx } from 'clsx';
import type { Audience, JewelleryCollection, DeliveryStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'gold' | 'silver' | 'green' | 'red' | 'purple' | 'blue' | 'gray';
  className?: string;
}

const variantClasses = {
  default: 'bg-espresso-100 text-espresso',
  gold: 'bg-gold-100 text-gold-700',
  silver: 'bg-gray-100 text-gray-600',
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  purple: 'bg-purple-100 text-purple-700',
  blue: 'bg-blue-100 text-blue-700',
  gray: 'bg-gray-100 text-gray-500',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-sans',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function AudienceBadge({ audience }: { audience: Audience }) {
  return (
    <Badge variant={audience === 'Women' ? 'purple' : 'blue'}>
      {audience}
    </Badge>
  );
}

export function CollectionBadge({ collection }: { collection: JewelleryCollection }) {
  const variants: Record<JewelleryCollection, BadgeProps['variant']> = {
    Gold: 'gold',
    Silver: 'silver',
    'One Gram Gold': 'gold',
    Stones: 'purple',
  };
  return <Badge variant={variants[collection]}>{collection}</Badge>;
}

export function StatusBadge({ status }: { status: DeliveryStatus }) {
  const map: Record<DeliveryStatus, BadgeProps['variant']> = {
    'Order Placed': 'blue',
    Confirmed: 'blue',
    Preparing: 'gold',
    Shipped: 'purple',
    'Out for Delivery': 'purple',
    Delivered: 'green',
    Cancelled: 'red',
  };
  return <Badge variant={map[status]}>{status}</Badge>;
}

export function AvailabilityBadge({ available }: { available: boolean }) {
  return (
    <Badge variant={available ? 'green' : 'red'}>
      {available ? 'In Stock' : 'Out of Stock'}
    </Badge>
  );
}
