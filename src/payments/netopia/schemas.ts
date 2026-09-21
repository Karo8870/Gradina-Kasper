import { z } from 'zod';

const providerErrorSchema = z
  .object({
    code: z.union([z.string(), z.number()]).optional(),
    message: z.string().optional()
  })
  .passthrough()
  .nullish();

const netopiaAddressSchema = z.object({
  city: z.string().min(1),
  country: z.number().int().positive(),
  countryName: z.string().min(1).optional(),
  details: z.string(),
  email: z.email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(1),
  postalCode: z.string().min(1),
  state: z.string().min(1)
});

export const netopiaStartRequestSchema = z.object({
  config: z.object({
    language: z.string().length(2),
    notifyUrl: z.url(),
    redirectUrl: z.url()
  }),
  order: z.object({
    amount: z.number().finite().positive(),
    billing: netopiaAddressSchema,
    currency: z.literal('RON'),
    dateTime: z.iso.datetime({ offset: true }),
    description: z.string().min(1),
    installments: z.object({
      available: z.array(z.number().int().nonnegative()),
      selected: z.number().int().nonnegative()
    }),
    orderID: z.string().min(1),
    posSignature: z.string().min(1),
    products: z.array(
      z.object({
        category: z.string(),
        code: z.string().min(1),
        name: z.string().min(1),
        price: z.number().finite().positive(),
        vat: z.number().finite().nonnegative()
      })
    ),
    shipping: netopiaAddressSchema.omit({ countryName: true }).optional()
  }),
  payment: z.object({
    data: z.record(z.string(), z.string()),
    instrument: z.object({ type: z.literal('card') }),
    options: z.object({
      bonus: z.number().int().nonnegative(),
      installments: z.number().int().nonnegative()
    })
  })
});

export const netopiaStatusRequestSchema = z.object({
  ntpID: z.string().min(1),
  orderID: z.string().min(1),
  posSignature: z.string().min(1)
});

const paymentSchema = z
  .object({
    amount: z.number().finite().positive(),
    currency: z.string().length(3),
    ntpID: z.string().min(1),
    paymentURL: z.string().url().optional(),
    status: z.number().int()
  })
  .passthrough();

const orderSchema = z
  .object({
    amount: z.number().finite().nonnegative(),
    currency: z.string().length(3),
    orderID: z.string().min(1)
  })
  .passthrough();

export const netopiaStartResponseSchema = z
  .object({
    customerAction: z
      .object({
        authenticationToken: z.string().optional(),
        formData: z.record(z.string(), z.string()).optional(),
        type: z.string().optional(),
        url: z.string().url().optional()
      })
      .passthrough()
      .nullish(),
    error: providerErrorSchema,
    payment: paymentSchema.nullish()
  })
  .passthrough();

export const netopiaStatusResponseSchema = z
  .object({
    error: providerErrorSchema,
    order: orderSchema.nullish(),
    payment: paymentSchema.nullish()
  })
  .passthrough();

export const netopiaNotifySchema = z
  .object({
    order: z.object({ orderID: z.string().min(1) }).passthrough(),
    payment: paymentSchema
  })
  .passthrough();

export const netopiaStatusInputSchema = z.object({
  transactionID: z.coerce.number().int().positive()
});

export type NetopiaStatusResponse = z.infer<typeof netopiaStatusResponseSchema>;
export type NetopiaStartResponse = z.infer<typeof netopiaStartResponseSchema>;

export function netopiaPaymentState(status: number) {
  if (status === 3 || status === 5) return 'succeeded' as const;
  if (status === 12) return 'failed' as const;
  return 'pending' as const;
}

export function netopiaStartFailureMessage(response: NetopiaStartResponse) {
  if (
    response.payment &&
    netopiaPaymentState(response.payment.status) !== 'failed'
  ) {
    return null;
  }

  return response.error?.message ?? 'NETOPIA nu a returnat o plată validă.';
}
