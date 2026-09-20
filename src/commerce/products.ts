import type { Product } from '@/payload-types';

type ProductAvailability = Pick<Product, 'availability'>;

function formatAvailabilityDate(value: string) {
  return new Intl.DateTimeFormat('ro-RO', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Bucharest'
  }).format(new Date(value));
}

export function isProductExpired(product: ProductAvailability) {
  const untilValue =
    product.availability?.enableUntil && product.availability.until
      ? product.availability.until
      : null;

  if (!untilValue) return false;

  const until = Date.parse(untilValue);

  return Number.isFinite(until) && Date.now() > until;
}

export function getProductAvailability(product: Product) {
  if (isProductExpired(product)) {
    return {
      notice: null,
      purchasable: false
    };
  }

  if (product.disabled) {
    return {
      notice: 'Produsul nu este disponibil.',
      purchasable: false
    };
  }

  const now = Date.now();
  const fromValue =
    product.availability?.enableFrom && product.availability.from
      ? product.availability.from
      : null;
  const untilValue =
    product.availability?.enableUntil && product.availability.until
      ? product.availability.until
      : null;
  const from = fromValue ? Date.parse(fromValue) : Number.NaN;
  const until = untilValue ? Date.parse(untilValue) : Number.NaN;

  if (fromValue && Number.isFinite(from) && now < from) {
    return {
      notice: `Disponibil începând cu ${formatAvailabilityDate(fromValue)}`,
      purchasable: false
    };
  }

  return {
    notice:
      untilValue && Number.isFinite(until)
        ? `Disponibil până la ${formatAvailabilityDate(untilValue)}`
        : null,
    purchasable: true
  };
}
