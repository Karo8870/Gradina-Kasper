import type { OrderStatus } from '@/payload-types';

export const orderStatuses = [
  'processing',
  'completed',
  'cancelled',
  'refunded'
] as const satisfies readonly OrderStatus[];

const BUCHAREST_TIME_ZONE = 'Europe/Bucharest';

function bucharestDateKey(value: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    month: '2-digit',
    timeZone: BUCHAREST_TIME_ZONE,
    year: 'numeric'
  }).formatToParts(value);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value;

  return `${part('year')}-${part('month')}-${part('day')}`;
}

function dateKeyValue(value: string) {
  const [year, month, day] = value.split('-').map(Number);

  return Date.UTC(year, month - 1, day);
}

export function canCancelOrder({
  fulfillmentDate,
  now = new Date(),
  status
}: {
  fulfillmentDate?: string | null;
  now?: Date;
  status?: OrderStatus | null;
}) {
  if (status !== 'processing' || !fulfillmentDate) return false;

  const fulfillment = new Date(fulfillmentDate);
  if (Number.isNaN(fulfillment.getTime())) return false;

  const fulfillmentDay = dateKeyValue(bucharestDateKey(fulfillment));
  const currentDay = dateKeyValue(bucharestDateKey(now));

  return fulfillmentDay - currentDay >= 24 * 60 * 60 * 1000;
}
