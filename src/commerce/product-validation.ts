import type { ProductsValidation } from '@payloadcms/plugin-ecommerce/types';

export const validateCartProduct: ProductsValidation = ({
  currency,
  product,
  quantity,
  variant
}) => {
  if (!currency) throw 'Moneda coșului lipsește.';

  const purchasableItem = variant ?? product;
  const price = purchasableItem?.[`priceIn${currency.toUpperCase()}`];
  const inventory = purchasableItem?.inventory;

  if (!Number.isSafeInteger(price) || Number(price) <= 0) {
    throw 'Prețul unui produs din coș s-a modificat sau este invalid.';
  }

  if (!Number.isSafeInteger(inventory) || Number(inventory) < quantity) {
    throw `Cantitatea din coș este mai mare decât stocul disponibil în acest moment (${Math.max(0, Number(inventory) || 0)}).`;
  }
};
