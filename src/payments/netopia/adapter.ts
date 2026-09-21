import { randomUUID } from 'node:crypto';

import { sql } from '@payloadcms/db-postgres';
import type { PaymentAdapter } from '@payloadcms/plugin-ecommerce/types';
import {
  addDataAndFileToRequest,
  commitTransaction,
  initTransaction,
  killTransaction,
  type PayloadRequest
} from 'payload';

import envConfig from '../../../env.config';
import { adminOnlyField } from '@/access/users';
import type { Transaction } from '@/payload-types';

import {
  type CanonicalAddress,
  type CheckoutLineSnapshot,
  toNetopiaAddress,
  validateNetopiaCheckout
} from './checkout.server';
import {
  getNetopiaPaymentStatus,
  getNetopiaPOSSignature,
  startNetopiaPayment
} from './provider.server';
import {
  netopiaNotifySchema,
  netopiaPaymentState,
  netopiaStartFailureMessage,
  netopiaStatusInputSchema,
  type NetopiaStatusResponse
} from './schemas';

type NetopiaTransaction = Transaction & {
  netopia?: {
    checkoutSnapshot?: CheckoutSnapshot | null;
    merchantOrderID?: string | null;
    ntpID?: string | null;
    paymentURL?: string | null;
  } | null;
};

type CheckoutSnapshot = {
  billingAddress: CanonicalAddress;
  deliveryFee: number;
  deliveryVAT: number;
  fulfillmentDate: string;
  fulfillmentMethod: 'delivery' | 'pickup';
  grandTotal: number;
  lines: CheckoutLineSnapshot[];
  productSubtotal: number;
  productVAT: number;
  shippingAddress?: CanonicalAddress;
  vatRates: {
    delivery: number;
    products: number;
  };
};

function relationshipID(value: number | { id: number } | null | undefined) {
  return typeof value === 'object' && value ? value.id : value;
}

function payloadAddress(address: CanonicalAddress) {
  return {
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2,
    city: address.city,
    country: address.country,
    firstName: address.firstName,
    lastName: address.lastName,
    phone: address.phone,
    postalCode: address.postalCode,
    state: address.state,
    title: address.title
  };
}

function checkoutSnapshot(
  checkout: Awaited<ReturnType<typeof validateNetopiaCheckout>>
): CheckoutSnapshot {
  return {
    billingAddress: checkout.billingAddress,
    deliveryFee: checkout.totals.deliveryFee,
    deliveryVAT: checkout.totals.deliveryVAT,
    fulfillmentDate: checkout.fulfillmentDate,
    fulfillmentMethod: checkout.fulfillmentMethod,
    grandTotal: checkout.totals.grandTotal,
    lines: checkout.lines,
    productSubtotal: checkout.totals.productSubtotal,
    productVAT: checkout.totals.productVAT,
    shippingAddress: checkout.shippingAddress,
    vatRates: {
      delivery: checkout.settings.deliveryVATRate,
      products: checkout.settings.productVATRate
    }
  };
}

function errorAction(error: unknown) {
  return {
    action: {
      message:
        error instanceof Error
          ? error.message
          : 'Plata nu a putut fi inițiată. Încearcă din nou.',
      type: 'error'
    },
    message: 'Payment initiation failed.'
  };
}

async function initiatePayment({
  data,
  req
}: Parameters<PaymentAdapter['initiatePayment']>[0]) {
  let transactionID: number | undefined;

  try {
    const checkout = await validateNetopiaCheckout({
      billingAddress: data.billingAddress,
      cart: data.cart as never,
      req,
      shippingAddress: data.shippingAddress
    });
    const snapshot = checkoutSnapshot(checkout);
    const merchantOrderID = `NTP-${data.cart.id}-${randomUUID()}`;
    const transaction = await req.payload.create({
      collection: 'transactions',
      data: {
        amount: checkout.totals.grandTotal,
        billingAddress: payloadAddress(checkout.billingAddress),
        cart: data.cart.id,
        currency: 'RON',
        customer: req.user!.id,
        items: checkout.lines.map((line) => ({
          product: line.product,
          quantity: line.quantity
        })),
        netopia: {
          checkoutSnapshot: snapshot,
          merchantOrderID
        },
        paymentMethod: 'netopia',
        status: 'pending'
      },
      overrideAccess: true,
      req
    });
    transactionID = Number(transaction.id);
    const returnURL = `${envConfig.NEXT_PUBLIC_SERVER_URL}/checkout/confirm-order?transaction=${transaction.id}`;
    const response = await startNetopiaPayment({
      config: {
        language: 'ro',
        notifyUrl: `${envConfig.NEXT_PUBLIC_SERVER_URL}/api/payments/netopia/notify`,
        redirectUrl: returnURL
      },
      order: {
        amount: checkout.totals.grandTotal / 100,
        billing: toNetopiaAddress(checkout.billingAddress, data.customerEmail),
        currency: 'RON',
        dateTime: new Date().toISOString(),
        description: `Comanda ${merchantOrderID}`,
        installments: { available: [0], selected: 0 },
        orderID: merchantOrderID,
        posSignature: getNetopiaPOSSignature(),
        products: [
          ...checkout.lines.map((line) => ({
            category: 'Products',
            code: String(line.product),
            name: `${line.name} × ${line.quantity}`,
            price: (line.unitPrice * line.quantity) / 100,
            vat: checkout.settings.productVATRate
          })),
          ...(checkout.totals.deliveryFee
            ? [
                {
                  category: 'Delivery',
                  code: 'DELIVERY',
                  name: 'Delivery fee',
                  price: checkout.totals.deliveryFee / 100,
                  vat: checkout.settings.deliveryVATRate
                }
              ]
            : [])
        ],
        shipping: checkout.shippingAddress
          ? toNetopiaAddress(checkout.shippingAddress, data.customerEmail)
          : undefined
      },
      payment: {
        data: {
          BROWSER_USER_AGENT: req.headers.get('user-agent') ?? '',
          IP_ADDRESS:
            req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
            req.headers.get('x-real-ip') ??
            ''
        },
        instrument: { type: 'card' },
        options: { bonus: 0, installments: 0 }
      }
    });

    const startFailure = netopiaStartFailureMessage(response);
    if (startFailure) throw new Error(startFailure);

    const payment = response.payment!;

    await req.payload.update({
      collection: 'transactions',
      id: transaction.id,
      data: {
        netopia: {
          checkoutSnapshot: snapshot,
          merchantOrderID,
          ntpID: payment.ntpID,
          paymentURL: payment.paymentURL
        }
      },
      overrideAccess: true,
      req
    });

    if (payment.paymentURL) {
      return {
        action: { type: 'redirect', url: payment.paymentURL },
        message: 'Payment initiated successfully.',
        transactionID: transaction.id
      };
    }

    if (response.customerAction?.url && response.customerAction.formData) {
      return {
        action: {
          fields: response.customerAction.formData,
          type: 'submit_form',
          url: response.customerAction.url
        },
        message: 'Payment authentication required.',
        transactionID: transaction.id
      };
    }

    return {
      action: { type: 'redirect', url: returnURL },
      message: 'Payment submitted.',
      transactionID: transaction.id
    };
  } catch (error) {
    if (transactionID) {
      await req.payload
        .update({
          collection: 'transactions',
          id: transactionID,
          data: { status: 'failed' },
          overrideAccess: true,
          req
        })
        .catch(() => undefined);
    }
    req.payload.logger.error({
      err: error,
      msg: 'NETOPIA payment initiation failed.'
    });
    return errorAction(error);
  }
}

function validateProviderPayment(
  transaction: NetopiaTransaction,
  response: NetopiaStatusResponse
) {
  const netopia = transaction.netopia;
  const payment = response.payment;
  const order = response.order;

  if (!netopia?.merchantOrderID || !netopia.ntpID || !payment || !order) {
    throw new Error('NETOPIA a returnat un răspuns incomplet.');
  }
  if (
    order.orderID !== netopia.merchantOrderID ||
    payment.ntpID !== netopia.ntpID ||
    payment.currency.toUpperCase() !== 'RON' ||
    order.currency.toUpperCase() !== 'RON' ||
    Math.round(payment.amount * 100) !== transaction.amount ||
    Math.round(order.amount * 100) !== transaction.amount
  ) {
    throw new Error('Datele plății nu corespund comenzii.');
  }
}

async function decrementInventoryAtomically(
  req: PayloadRequest,
  lines: CheckoutLineSnapshot[]
) {
  const transactionID = await req.transactionID;
  const database = transactionID
    ? req.payload.db.sessions?.[transactionID]?.db
    : req.payload.db.drizzle;
  const executor = database as {
    execute: (query: ReturnType<typeof sql>) => Promise<{ rows?: unknown[] }>;
  };

  for (const line of lines) {
    const result = await executor.execute(sql`
      UPDATE products
      SET inventory = inventory - ${line.quantity}
      WHERE id = ${line.product}
        AND inventory >= ${line.quantity} RETURNING id
    `);

    if (!result.rows?.length) {
      throw new Error(
        `Stocul pentru ${line.name} s-a modificat înainte de confirmarea plății.`
      );
    }
  }
}

async function clearPurchasedCart(
  req: PayloadRequest,
  cart: NetopiaTransaction['cart']
) {
  const cartID = relationshipID(cart);
  if (!cartID) return;

  await req.payload.update({
    collection: 'carts',
    id: cartID,
    data: {
      customer: null,
      items: [],
      purchasedAt: new Date().toISOString(),
      subtotal: 0
    },
    overrideAccess: true,
    req
  });
}

async function finalizeTransaction(
  req: PayloadRequest,
  transaction: NetopiaTransaction
) {
  const snapshot = transaction.netopia?.checkoutSnapshot;
  if (!snapshot || !transaction.netopia?.merchantOrderID) {
    throw new Error('Tranzacția nu conține snapshot-ul comenzii.');
  }

  const ownsTransaction = await initTransaction(req);
  try {
    const current = (await req.payload.findByID({
      collection: 'transactions',
      id: transaction.id,
      depth: 0,
      overrideAccess: true,
      req
    })) as NetopiaTransaction;
    const currentOrderID = relationshipID(current.order);
    if (currentOrderID) {
      await clearPurchasedCart(req, current.cart);
      if (ownsTransaction) await commitTransaction(req);
      return currentOrderID;
    }

    await decrementInventoryAtomically(req, snapshot.lines);
    const order = await req.payload.create({
      collection: 'orders',
      data: {
        amount: snapshot.grandTotal,
        checkoutSnapshot: snapshot,
        currency: 'RON',
        customer: relationshipID(transaction.customer),
        customerEmail: transaction.customerEmail,
        fulfillmentDate: snapshot.fulfillmentDate,
        fulfillmentMethod: snapshot.fulfillmentMethod,
        items: snapshot.lines.map((line) => ({
          product: line.product,
          quantity: line.quantity
        })),
        paymentReference: transaction.netopia.merchantOrderID,
        shippingAddress: snapshot.shippingAddress
          ? payloadAddress(snapshot.shippingAddress)
          : undefined,
        status: 'processing',
        transactions: [transaction.id]
      },
      overrideAccess: true,
      req
    });
    await clearPurchasedCart(req, transaction.cart);
    await req.payload.update({
      collection: 'transactions',
      id: transaction.id,
      data: { order: order.id, status: 'succeeded' },
      overrideAccess: true,
      req
    });

    if (ownsTransaction) await commitTransaction(req);
    return order.id;
  } catch (error) {
    if (ownsTransaction) await killTransaction(req);
    throw error;
  }
}

async function verifyAndFinalize(
  req: PayloadRequest,
  transaction: NetopiaTransaction
) {
  const netopia = transaction.netopia;
  if (!netopia?.merchantOrderID || !netopia.ntpID) {
    throw new Error('Identificatorii NETOPIA lipsesc.');
  }

  const response = await getNetopiaPaymentStatus({
    ntpID: netopia.ntpID,
    orderID: netopia.merchantOrderID
  });
  validateProviderPayment(transaction, response);
  const state = netopiaPaymentState(response.payment!.status);

  if (state === 'failed') {
    await req.payload.update({
      collection: 'transactions',
      id: transaction.id,
      data: { status: 'failed' },
      overrideAccess: true,
      req
    });
    return { state };
  }
  if (state === 'pending') return { state };

  return { orderID: await finalizeTransaction(req, transaction), state };
}

async function statusEndpoint(req: PayloadRequest) {
  if (!req.user)
    return Response.json({ message: 'Unauthorized.' }, { status: 401 });
  await addDataAndFileToRequest(req);
  const parsed = netopiaStatusInputSchema.safeParse(req.data);
  if (!parsed.success) {
    return Response.json({ message: 'Invalid transaction.' }, { status: 400 });
  }

  const transaction = (await req.payload.findByID({
    collection: 'transactions',
    id: parsed.data.transactionID,
    depth: 0,
    overrideAccess: true,
    req
  })) as NetopiaTransaction;
  if (relationshipID(transaction.customer) !== req.user.id) {
    return Response.json({ message: 'Forbidden.' }, { status: 403 });
  }

  try {
    return Response.json(await verifyAndFinalize(req, transaction));
  } catch (error) {
    req.payload.logger.error({
      err: error,
      msg: 'NETOPIA status verification failed.'
    });
    return Response.json(
      { message: 'Plata nu a putut fi verificată.', state: 'pending' },
      { status: 502 }
    );
  }
}

async function notifyEndpoint(req: PayloadRequest) {
  const parsed = netopiaNotifySchema.safeParse(await req.json?.());
  if (!parsed.success) return Response.json({ ok: false }, { status: 400 });
  const result = await req.payload.find({
    collection: 'transactions',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    req,
    where: {
      and: [
        { 'netopia.merchantOrderID': { equals: parsed.data.order.orderID } },
        { 'netopia.ntpID': { equals: parsed.data.payment.ntpID } }
      ]
    }
  });
  const transaction = result.docs[0] as NetopiaTransaction | undefined;
  if (!transaction) return Response.json({ ok: false }, { status: 404 });

  try {
    const verified = await verifyAndFinalize(req, transaction);
    return Response.json({ ok: true, ...verified });
  } catch (error) {
    req.payload.logger.error({
      err: error,
      msg: 'NETOPIA notification failed.'
    });
    return Response.json({ ok: false }, { status: 502 });
  }
}

export const netopiaPaymentAdapter: PaymentAdapter = {
  confirmOrder: async () => {
    throw new Error(
      'NETOPIA orders are confirmed by the verified status endpoint.'
    );
  },
  endpoints: [
    { handler: notifyEndpoint, method: 'post', path: '/notify' },
    { handler: statusEndpoint, method: 'post', path: '/status' }
  ],
  group: {
    name: 'netopia',
    type: 'group',
    label: 'NETOPIA',
    admin: {
      condition: (data) => data?.paymentMethod === 'netopia',
      readOnly: true
    },
    fields: [
      {
        name: 'merchantOrderID',
        type: 'text',
        label: 'Merchant order ID',
        index: true,
        unique: true
      },
      {
        name: 'ntpID',
        type: 'text',
        label: 'NETOPIA transaction ID',
        index: true
      },
      {
        name: 'paymentURL',
        type: 'text',
        label: 'Payment URL',
        access: { read: adminOnlyField }
      },
      {
        name: 'checkoutSnapshot',
        type: 'json',
        label: 'Checkout snapshot',
        access: { read: adminOnlyField }
      }
    ]
  },
  initiatePayment,
  label: 'NETOPIA Payments',
  name: 'netopia'
};
