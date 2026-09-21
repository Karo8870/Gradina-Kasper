import { z } from 'zod';

const addressSchema = z.object({
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  city: z.string(),
  country: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
  postalCode: z.string(),
  state: z.string()
});

const checkoutSnapshotSchema = z.object({
  billingAddress: addressSchema,
  deliveryFee: z.number().int().nonnegative(),
  deliveryVAT: z.number().int().nonnegative(),
  fulfillmentDate: z.string(),
  fulfillmentMethod: z.enum(['delivery', 'pickup']),
  grandTotal: z.number().int().nonnegative(),
  lines: z.array(
    z.object({
      name: z.string(),
      product: z.number().int().positive(),
      quantity: z.number().int().positive(),
      unitPrice: z.number().int().nonnegative()
    })
  ),
  productSubtotal: z.number().int().nonnegative(),
  productVAT: z.number().int().nonnegative(),
  shippingAddress: addressSchema.optional(),
  vatRates: z.object({
    delivery: z.number().nonnegative(),
    products: z.number().nonnegative()
  })
});

export type CheckoutSnapshot = z.infer<typeof checkoutSnapshotSchema>;

export function parseCheckoutSnapshot(value: unknown) {
  const result = checkoutSnapshotSchema.safeParse(value);
  return result.success ? result.data : null;
}

export function formatOrderMoney(amount: number | null | undefined) {
  return new Intl.NumberFormat('ro-RO', {
    currency: 'RON',
    style: 'currency'
  }).format((amount ?? 0) / 100);
}

export function formatOrderDate(value: string) {
  return new Intl.DateTimeFormat('ro-RO', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Bucharest'
  }).format(new Date(value));
}

export const orderStatusLabels = {
  cancelled: 'Anulată',
  completed: 'Finalizată',
  processing: 'În procesare',
  refunded: 'Rambursată'
} as const;

export const transactionStatusLabels = {
  cancelled: 'Anulată',
  expired: 'Expirată',
  failed: 'Eșuată',
  pending: 'În așteptare',
  refunded: 'Rambursată',
  succeeded: 'Reușită'
} as const;
