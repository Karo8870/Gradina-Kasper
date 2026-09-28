import { storeCurrency } from '@/commerce/currencies';
import type { Product } from '@/payload-types';

const formatter = new Intl.NumberFormat('ro-RO', {
  currency: storeCurrency.code,
  maximumFractionDigits: storeCurrency.decimals,
  minimumFractionDigits: storeCurrency.decimals,
  style: 'currency'
});

function formatPrice(amount: number) {
  return formatter.format(amount / 10 ** storeCurrency.decimals);
}

export function ProductPrice({ product }: { product: Product }) {
  const discounted = product.priceInRON ?? 0;
  const original = product.originalPriceInRON;
  const showDiscount = Boolean(
    product.hasDiscount && typeof original === 'number' && original > discounted
  );

  return (
    <>
      {showDiscount ? (
        <span className='text-muted-foreground block text-sm font-normal line-through'>
          {formatPrice(original!)}
        </span>
      ) : null}
      <span className='block'>{formatPrice(discounted)}</span>
    </>
  );
}
