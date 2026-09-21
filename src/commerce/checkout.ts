const BUCHAREST_TIME_ZONE = 'Europe/Bucharest';

export type CheckoutSettingsDTO = {
  deliveryFee: number;
  deliveryVATRate: number;
  minimumDeliverySubtotal: number;
  productVATRate: number;
};

export type FulfillmentMethod = 'delivery' | 'pickup';

export type FulfillmentScheduleDTO = {
  allowedWeekdays: number[];
  weekOverrides: {
    allowedWeekdays: number[];
    weekStart: string;
  }[];
};

export function extractIncludedVAT(amount: number, rate: number) {
  const safeAmount = Math.max(0, Math.round(amount));
  const safeRate = Math.max(0, rate);
  const net = Math.round(safeAmount / (1 + safeRate / 100));

  return {
    net,
    vat: safeAmount - net
  };
}

export function calculateCheckout({
  fulfillmentMethod,
  productLineTotals,
  productSubtotal,
  settings
}: {
  fulfillmentMethod: FulfillmentMethod;
  productLineTotals: number[];
  productSubtotal: number;
  settings: CheckoutSettingsDTO;
}) {
  const deliveryFee =
    fulfillmentMethod === 'delivery' ? settings.deliveryFee : 0;
  const productVAT = productLineTotals.reduce(
    (total, lineTotal) =>
      total + extractIncludedVAT(lineTotal, settings.productVATRate).vat,
    0
  );
  const deliveryVAT = extractIncludedVAT(
    deliveryFee,
    settings.deliveryVATRate
  ).vat;

  return {
    deliveryFee,
    deliveryMinimumMet:
      fulfillmentMethod === 'pickup' ||
      productSubtotal >= settings.minimumDeliverySubtotal,
    deliveryVAT,
    grandTotal: productSubtotal + deliveryFee,
    productVAT,
    subtotalWithoutVAT: productSubtotal + deliveryFee - productVAT - deliveryVAT
  };
}

function getBucharestDateKey(value: Date) {
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

function dateFromKey(value: string) {
  return new Date(`${value}T12:00:00.000Z`);
}

function addDays(value: Date, days: number) {
  const result = new Date(value);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function getWeekday(value: Date) {
  const shortName = new Intl.DateTimeFormat('en-US', {
    timeZone: BUCHAREST_TIME_ZONE,
    weekday: 'short'
  }).format(value);

  return (
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(shortName) + 1
  );
}

function getWeekStartKey(value: Date) {
  return getBucharestDateKey(addDays(value, 1 - getWeekday(value)));
}

export function getNextFulfillmentDate(
  schedule: FulfillmentScheduleDTO,
  from = new Date()
) {
  const start = dateFromKey(getBucharestDateKey(from));
  const defaultWeekdays = new Set(schedule.allowedWeekdays);
  const overrides = new Map(
    schedule.weekOverrides.map((override) => [
      override.weekStart,
      new Set(override.allowedWeekdays)
    ])
  );

  for (let offset = 1; offset <= 366; offset += 1) {
    const candidate = addDays(start, offset);
    const allowedWeekdays =
      overrides.get(getWeekStartKey(candidate)) ?? defaultWeekdays;

    if (allowedWeekdays.has(getWeekday(candidate))) {
      return candidate.toISOString();
    }
  }

  return null;
}
