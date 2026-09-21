import countries from 'i18n-iso-countries';
import type { PayloadRequest } from 'payload';

import { addressInputSchema } from '@/commerce/addresses/validation';
import {
  calculateCheckout,
  getNextFulfillmentDate,
  type CheckoutSettingsDTO,
  type FulfillmentMethod,
  type FulfillmentScheduleDTO
} from '@/commerce/checkout';
import { getProductAvailability } from '@/commerce/products';
import type { Address, Cart, Product } from '@/payload-types';

type CartItem = NonNullable<Cart['items']>[number];

export type CheckoutLineSnapshot = {
  name: string;
  product: number;
  quantity: number;
  unitPrice: number;
};

export type CanonicalAddress = ReturnType<typeof canonicalAddress>;

function relationshipID(value: number | { id: number } | null | undefined) {
  return typeof value === 'object' && value ? value.id : value;
}

function canonicalAddress(address: Address) {
  const parsed = addressInputSchema.parse(address);
  const country = parsed.country.toUpperCase();
  const countryCode = countries.alpha2ToNumeric(country);

  if (!countryCode) {
    throw new Error(
      'Țara selectată nu este acceptată de procesatorul de plăți.'
    );
  }

  return {
    addressLine1: parsed.addressLine1,
    addressLine2: parsed.addressLine2 || '',
    city: parsed.city,
    country,
    countryCode,
    countryName: countries.getName(country, 'en') ?? country,
    firstName: parsed.firstName,
    lastName: parsed.lastName,
    phone: parsed.phone,
    postalCode: parsed.postalCode,
    state: parsed.state,
    title: parsed.title || ''
  };
}

async function loadSavedAddress(req: PayloadRequest, value: unknown) {
  const id =
    typeof value === 'object' && value && 'id' in value
      ? Number(value.id)
      : Number.NaN;

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('Selectează o adresă salvată.');
  }

  const address = await req.payload.findByID({
    collection: 'addresses',
    depth: 0,
    id,
    overrideAccess: false,
    req
  });

  return canonicalAddress(address);
}

function getProductID(item: CartItem) {
  return relationshipID(item.product);
}

function validateProduct(product: Product, quantity: number) {
  if (product._status !== 'published' || product.visibility === 'hidden') {
    throw new Error(`${product.name} nu mai este disponibil.`);
  }

  const availability = getProductAvailability(product);
  if (!availability.purchasable) {
    throw new Error(`${product.name} nu poate fi cumpărat în acest moment.`);
  }

  if (
    !Number.isSafeInteger(product.priceInRON) ||
    (product.priceInRON ?? 0) <= 0
  ) {
    throw new Error(
      `Prețul pentru ${product.name} s-a modificat sau este invalid.`
    );
  }

  if (
    !Number.isSafeInteger(product.inventory) ||
    (product.inventory ?? 0) < quantity
  ) {
    throw new Error(
      `Cantitatea din coș pentru ${product.name} este mai mare decât stocul disponibil (${Math.max(0, product.inventory ?? 0)}).`
    );
  }
}

export async function validateNetopiaCheckout({
  billingAddress,
  cart,
  req,
  shippingAddress
}: {
  billingAddress: unknown;
  cart: Cart;
  req: PayloadRequest;
  shippingAddress?: unknown;
}) {
  if (!req.user) throw new Error('Autentificarea este necesară pentru plată.');
  if (cart.currency !== 'RON')
    throw new Error('Moneda coșului trebuie să fie RON.');
  if (!cart.items?.length) throw new Error('Coșul este gol.');

  const fulfillmentMethod: FulfillmentMethod = shippingAddress
    ? 'delivery'
    : 'pickup';
  const [
    canonicalBilling,
    canonicalShipping,
    settingsDocument,
    scheduleDocument
  ] = await Promise.all([
    loadSavedAddress(req, billingAddress),
    shippingAddress ? loadSavedAddress(req, shippingAddress) : undefined,
    req.payload.findGlobal({
      slug: 'checkout-settings',
      depth: 0,
      overrideAccess: false,
      req
    }),
    req.payload.findGlobal({
      slug: 'fulfillment-schedule',
      depth: 0,
      overrideAccess: false,
      req
    })
  ]);

  if (
    canonicalShipping &&
    (canonicalShipping.country !== 'RO' ||
      !/^\d{6}$/.test(canonicalShipping.postalCode))
  ) {
    throw new Error(
      'Livrarea necesită o adresă din România și un cod poștal de 6 cifre.'
    );
  }

  const products = await Promise.all(
    cart.items.map(async (item) => {
      const id = getProductID(item);
      if (!id) throw new Error('Coșul conține un produs invalid.');
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw new Error('Coșul conține o cantitate invalidă.');
      }

      return req.payload.findByID({
        collection: 'products',
        depth: 0,
        draft: false,
        id,
        req
      });
    })
  );
  const lines: CheckoutLineSnapshot[] = products.map((product, index) => {
    const item = cart.items![index]!;
    validateProduct(product, item.quantity);

    return {
      name: product.name,
      product: product.id,
      quantity: item.quantity,
      unitPrice: product.priceInRON!
    };
  });
  const productLineTotals = lines.map((line) => line.unitPrice * line.quantity);
  const productSubtotal = productLineTotals.reduce(
    (total, lineTotal) => total + lineTotal,
    0
  );

  if (cart.subtotal !== productSubtotal) {
    throw new Error(
      'Prețurile sau totalul coșului s-au modificat. Reîncarcă pagina și verifică din nou comanda.'
    );
  }

  const settings: CheckoutSettingsDTO = {
    deliveryFee: settingsDocument.deliveryFee ?? 5000,
    deliveryVATRate: settingsDocument.deliveryVATRate ?? 21,
    minimumDeliverySubtotal: settingsDocument.minimumDeliverySubtotal ?? 10000,
    productVATRate: settingsDocument.productVATRate ?? 11
  };
  const totals = calculateCheckout({
    fulfillmentMethod,
    productLineTotals,
    productSubtotal,
    settings
  });

  if (!totals.deliveryMinimumMet) {
    throw new Error('Valoarea minimă pentru livrare nu este atinsă.');
  }

  const schedule: FulfillmentScheduleDTO = {
    allowedWeekdays: (scheduleDocument.allowedWeekdays ?? ['2', '5']).map(
      Number
    ),
    weekOverrides: (scheduleDocument.weekOverrides ?? []).map((override) => ({
      allowedWeekdays: (override.allowedWeekdays ?? []).map(Number),
      weekStart: override.weekStart.slice(0, 10)
    }))
  };
  const fulfillmentDate = getNextFulfillmentDate(schedule);
  if (!fulfillmentDate)
    throw new Error('Nu există o dată de livrare disponibilă.');

  return {
    billingAddress: canonicalBilling,
    fulfillmentDate,
    fulfillmentMethod,
    lines,
    settings,
    shippingAddress: canonicalShipping,
    totals: {
      ...totals,
      productSubtotal
    }
  };
}

export function toNetopiaAddress(
  address: CanonicalAddress,
  customerEmail: string
) {
  return {
    city: address.city,
    country: Number(address.countryCode),
    countryName: address.countryName,
    details: [address.addressLine1, address.addressLine2]
      .filter(Boolean)
      .join(', '),
    email: customerEmail,
    firstName: address.firstName,
    lastName: address.lastName,
    phone: address.phone,
    postalCode: address.postalCode,
    state: address.state
  };
}
