import { Product } from '@/payload-types';
import { formatDateTime } from '@/utilities/formatDateTime';

const LOW_SUPPLY_THRESHOLD = 10;
const DELIVERY_WEEKDAYS = new Set([2, 5]);
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

export function createBlockedDateSet(holidayDates: string[]) {
  return new Set(
    holidayDates.map((value) =>
      formatDateTime({
        date: value
      })
    )
  );
}

export function buildDateFromOffset(base: Date, offsetDays: number): Date {
  const candidate = new Date(base);
  candidate.setUTCHours(12, 0, 0, 0);
  candidate.setUTCDate(candidate.getUTCDate() + offsetDays);
  return candidate;
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
      return 0;
  }
}

export function findNextAllowedDate({
  from,
  holidayDates
}: {
  from: Date;
  holidayDates: string[];
}): Date {
  const blockedDates = createBlockedDateSet(holidayDates);

  for (let offset = 1; offset <= 365; offset += 1) {
    const candidate = buildDateFromOffset(from, offset);
    const weekday = getRomanianWeekday(candidate);

    if (!DELIVERY_WEEKDAYS.has(weekday)) {
      continue;
    }

    if (
      blockedDates.has(
        formatDateTime({
          date: candidate
        })
      )
    ) {
      continue;
    }

    return candidate;
  }

  return new Date(0);
}

export function getNextDeliveryDate(holidayDates: string[]) {
  const now = new Date();

  return findNextAllowedDate({
    from: now,
    holidayDates: holidayDates
  });
}
