import { Product } from '@/payload-types';
import {
  DeliveryPickupConfig,
  getDefaultAllowedWeekdays,
  normalizeWeekOverrides
} from '@/lib/deliveryPickupConfig';
import { formatDateTime } from '@/utilities/formatDateTime';

const LOW_SUPPLY_THRESHOLD = 10;
const BUCHAREST_TIME_ZONE = 'Europe/Bucharest';

export function getInventoryBadge(inventory: number): {
  label: string;
  className: string;
} {
  if (inventory <= 0) {
    return {
      label: 'Stoc epuizat',
      className: 'bg-red-100 text-red-700'
    };
  }

  if (inventory < LOW_SUPPLY_THRESHOLD) {
    return {
      label: 'Stoc redus',
      className: 'bg-amber-100 text-amber-800'
    };
  }

  return {
    label: 'În stoc',
    className: 'bg-secondary-100 text-primary-900'
  };
}

export function getUnavailableNotice(product: Product): string | null {
  if (product.disableProduct) {
    return 'Momentan indisponibil';
  }

  return `Valabil din ${formatDateTime({
    date: product.availableFrom
  })}`;
}

export const isProductTemporarilyUnavailable = (
  product: Product,
  now = new Date()
): boolean => {
  if (product.disableProduct) return false;

  return new Date(product.availableFrom).getTime() > now.getTime();
};

export function buildDateFromOffset(base: Date, offsetDays: number): Date {
  const candidate = new Date(base);
  candidate.setUTCHours(12, 0, 0, 0);
  candidate.setUTCDate(candidate.getUTCDate() + offsetDays);
  return candidate;
}

export function getBucharestDateKey(date: Date | string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    month: '2-digit',
    timeZone: BUCHAREST_TIME_ZONE,
    year: 'numeric'
  }).formatToParts(new Date(date));

  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  return `${year}-${month}-${day}`;
}

export function dateFromDateKey(dateKey: string): Date {
  return new Date(`${dateKey}T12:00:00.000Z`);
}

export function getRomanianWeekday(date: Date): number {
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: BUCHAREST_TIME_ZONE,
    weekday: 'short'
  }).format(date);

  switch (weekday) {
    case 'Mon':
      return 1;
    case 'Tue':
      return 2;
    case 'Wed':
      return 3;
    case 'Thu':
      return 4;
    case 'Fri':
      return 5;
    case 'Sat':
      return 6;
    case 'Sun':
    default:
      return 7;
  }
}

export function getBucharestWeekStartKey(date: Date | string): string {
  const candidate = new Date(date);
  const weekday = getRomanianWeekday(candidate);
  const weekStart = buildDateFromOffset(candidate, (weekday - 1) * -1);

  return getBucharestDateKey(weekStart);
}

export function createWeekOverrideMap(config?: DeliveryPickupConfig | null) {
  return new Map(
    normalizeWeekOverrides(config?.weekOverrides).map((override) => [
      override.weekStart,
      new Set(override.allowedWeekdays)
    ])
  );
}

export function findNextAllowedDate({
  from,
  config
}: {
  from: Date;
  config?: DeliveryPickupConfig | null;
}): Date {
  const defaultWeekdays = new Set(getDefaultAllowedWeekdays(config));
  const weekOverrideMap = createWeekOverrideMap(config);

  for (let offset = 1; offset <= 365; offset += 1) {
    const candidate = buildDateFromOffset(from, offset);
    const weekday = getRomanianWeekday(candidate);
    const weekStart = getBucharestWeekStartKey(candidate);
    const overriddenWeekdays = weekOverrideMap.get(weekStart);
    const allowedWeekdays = overriddenWeekdays || defaultWeekdays;

    if (!allowedWeekdays.has(weekday)) {
      continue;
    }

    return candidate;
  }

  return new Date(0);
}

export function getNextDeliveryDate(config?: DeliveryPickupConfig | null) {
  const now = new Date();

  return findNextAllowedDate({
    from: now,
    config
  });
}
