import { checkRole } from '@/access/utilities';
import { sendOrderCompletedEmail } from '@/lib/orderEmails';
import type {
  Order,
  OrderStatus,
  Product,
  Transaction,
  User
} from '@/payload-types';
import config from '@payload-config';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { headers as getHeaders } from 'next/headers';
import { createLocalReq, getPayload } from 'payload';

const getProductName = (product?: number | null | Product) => {
  if (!product || typeof product === 'number') return 'Produs necunoscut';

  return product.name || `Produs #${product.id}`;
};

const getProductId = (product?: number | null | Product) => {
  if (!product) return null;

  return typeof product === 'number' ? product : product.id;
};

type Address =
  | Order['shippingAddress']
  | Transaction['billingAddress']
  | undefined
  | null;

const joinAddress = (address?: Address) => {
  if (!address) return '';

  return [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.state,
    address.postalCode,
    address.country
  ]
    .filter(Boolean)
    .join(', ');
};

const getAddressName = (address?: Address) => {
  return [address?.firstName, address?.lastName].filter(Boolean).join(' ');
};

const getRelatedUser = (customer: Order['customer']) => {
  return customer && typeof customer === 'object' ? (customer as User) : null;
};

const getTransactions = (order: Order) => {
  return (order.transactions || []).filter(
    (transaction): transaction is Transaction => typeof transaction === 'object'
  );
};

const getBillingAddress = (order: Order) => {
  return getTransactions(order).find(
    (transaction) => transaction.billingAddress
  )?.billingAddress;
};

const getCustomerEmail = (order: Order) => {
  const relatedUser = getRelatedUser(order.customer);
  const transactionEmail = getTransactions(order).find(
    (transaction) => transaction.customerEmail
  )?.customerEmail;

  return order.customerEmail || transactionEmail || relatedUser?.email || '';
};

const getNetopiaTransactionID = (order: Order) => {
  return (
    getTransactions(order).find(
      (transaction) =>
        transaction.paymentMethod === 'netopia' && transaction.netopia?.ntpID
    )?.netopia?.ntpID || ''
  );
};

const formatDeliveryDate = (value: string) =>
  format(new Date(value), 'd MMMM yyyy', { locale: ro });

const ORDER_STATUSES: NonNullable<OrderStatus>[] = [
  'processing',
  'completed',
  'cancelled',
  'refunded'
];

const isOrderStatus = (value: string): value is NonNullable<OrderStatus> =>
  ORDER_STATUSES.includes(value as NonNullable<OrderStatus>);

const updateOrderStatus = async ({
  id,
  payload,
  req,
  status
}: {
  id: number;
  payload: Awaited<ReturnType<typeof getPayload>>;
  req: Awaited<ReturnType<typeof createLocalReq>>;
  status: NonNullable<OrderStatus>;
}) => {
  const currentOrder = await payload.findByID({
    collection: 'orders',
    id,
    depth: 0,
    overrideAccess: false,
    req,
    select: {
      status: true
    }
  });

  const order = await payload.update({
    collection: 'orders',
    id,
    data: {
      status
    },
    overrideAccess: false,
    req
  });

  if (currentOrder.status !== 'completed' && status === 'completed') {
    await sendOrderCompletedEmail({
      orderID: id,
      payload
    });
  }

  return order;
};

export async function GET() {
  const payload = await getPayload({ config });
  const headers = await getHeaders();
  const { user } = await payload.auth({ headers });

  if (!user || !checkRole(['admin'], user)) {
    return Response.json({ message: 'Forbidden' }, { status: 403 });
  }

  const req = await createLocalReq({ user }, payload);

  const orders = await payload.find({
    collection: 'orders',
    depth: 2,
    limit: 1000,
    sort: '-createdAt',
    overrideAccess: false,
    req
  });

  const docs = orders.docs.map((order) => {
    const items = (order.items || []).map((item) => {
      const productName = getProductName(item.product);

      return {
        productId: getProductId(item.product),
        productName,
        quantity: item.quantity || 0
      };
    });

    const billingAddress = getBillingAddress(order);
    const shippingAddress = order.shippingAddress;
    const customerName =
      getAddressName(shippingAddress) || getAddressName(billingAddress);

    return {
      id: order.id,
      netopiaTransactionID: getNetopiaTransactionID(order),
      createdAt: order.createdAt,
      status: order.status || '',
      customerName,
      customerEmail: getCustomerEmail(order),
      phone: shippingAddress?.phone || billingAddress?.phone || '',
      billingAddress: joinAddress(billingAddress),
      shippingAddress: joinAddress(shippingAddress),
      fulfillmentMethod: order.shippingAddress?.addressLine1
        ? 'delivery'
        : 'pickup',
      shouldBeDeliveredOn: order.shouldBeDeliveredOn || null,
      items,
      itemsLabel:
        items
          .map((item) => `${item.quantity} x ${item.productName}`)
          .join(', ') || '-',
      amount: order.amount ?? null,
      currency: order.currency || 'RON'
    };
  });

  const deliveryDates = Array.from(
    new Set(
      docs
        .map((order) => order.shouldBeDeliveredOn)
        .filter((date): date is string => Boolean(date))
    )
  )
    .sort((a, b) => +new Date(b) - +new Date(a))
    .map((date) => ({
      value: date,
      label: formatDeliveryDate(date)
    }));

  return Response.json({ docs, deliveryDates });
}

export async function PATCH(request: Request) {
  const payload = await getPayload({ config });
  const headers = await getHeaders();
  const { user } = await payload.auth({ headers });

  if (!user || !checkRole(['admin'], user)) {
    return Response.json({ message: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const id = Number(body?.id);
  const ids = Array.isArray(body?.ids)
    ? body.ids.map((value: unknown) => Number(value)).filter(Boolean)
    : [];
  const status = String(body?.status || '');

  if ((!id && !ids.length) || !isOrderStatus(status)) {
    return Response.json({ message: 'Invalid order status' }, { status: 400 });
  }

  const req = await createLocalReq({ user }, payload);
  const targetIDs = ids.length ? ids : [id];
  const updatedOrders = [];

  for (const targetID of targetIDs) {
    const order = await updateOrderStatus({
      id: targetID,
      payload,
      req,
      status
    });

    updatedOrders.push({
      id: order.id,
      status: order.status
    });
  }

  return Response.json({
    docs: updatedOrders
  });
}
