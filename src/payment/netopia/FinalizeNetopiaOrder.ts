import type { DefaultDocumentIDType, PayloadRequest } from 'payload';
import { sendOrderEmail } from '@/lib/orderEmails';

const getID = (value: unknown): DefaultDocumentIDType | undefined => {
  if (!value) return undefined;

  if (typeof value === 'object' && 'id' in value) {
    return value.id as DefaultDocumentIDType;
  }

  return value as DefaultDocumentIDType;
};

const copyItemsWithoutRowIDs = (items: any[] | null | undefined) => {
  if (!Array.isArray(items)) return [];

  return items.map((item) => {
    const { id: _id, ...itemData } = item;
    return itemData;
  });
};

const decrementInventory = async ({
  req,
  transaction
}: {
  req: PayloadRequest;
  transaction: any;
}) => {
  if (!Array.isArray(transaction.items)) return;

  for (const item of transaction.items) {
    const quantity = Number(item.quantity) || 0;
    if (quantity <= 0) continue;

    if (item.variant) {
      const id = getID(item.variant);
      if (!id) continue;

      await req.payload.db.updateOne({
        id,
        collection: 'variants' as any,
        data: {
          inventory: {
            $inc: quantity * -1
          }
        }
      });

      continue;
    }

    if (item.product) {
      const id = getID(item.product);
      if (!id) continue;

      await req.payload.db.updateOne({
        id,
        collection: 'products' as any,
        data: {
          inventory: {
            $inc: quantity * -1
          }
        }
      });
    }
  }
};

export const finalizeNetopiaOrder = async ({
  req,
  transactionID
}: {
  req: PayloadRequest;
  transactionID: DefaultDocumentIDType;
}) => {
  const transaction = (await req.payload.findByID({
    id: transactionID,
    collection: 'transactions' as any,
    depth: 0,
    overrideAccess: true,
    req
  })) as any;

  const existingOrderID = getID(transaction.order);

  if (existingOrderID) {
    return {
      orderID: existingOrderID,
      alreadyFinalized: true
    };
  }

  const cartID = getID(transaction.cart);
  const customerID = getID(transaction.customer);
  const shippingAddress =
    transaction.netopia?.fulfillmentMethod === 'delivery'
      ? transaction.netopia?.shippingAddress || transaction.billingAddress
      : undefined;

  const order = (await req.payload.create({
    collection: 'orders' as any,
    data: {
      amount: transaction.amount,
      currency: transaction.currency || 'RON',
      ...(customerID
        ? {
            customer: customerID
          }
        : {
            customerEmail: transaction.customerEmail
          }),
      items: copyItemsWithoutRowIDs(transaction.items),
      ...(shippingAddress
        ? {
            shippingAddress
          }
        : {}),
      shouldBeDeliveredOn: transaction.netopia?.shouldBeDeliveredOn,
      status: 'processing',
      transactions: [transaction.id]
    },
    overrideAccess: true,
    req
  })) as any;

  if (cartID) {
    await req.payload.update({
      id: cartID,
      collection: 'carts' as any,
      data: {
        items: [],
        subtotal: 0,
        purchasedAt: new Date().toISOString()
      },
      overrideAccess: true,
      req
    });
  }

  await req.payload.update({
    id: transaction.id,
    collection: 'transactions' as any,
    data: {
      order: order.id,
      status: 'succeeded'
    },
    overrideAccess: true,
    req
  });

  await decrementInventory({
    req,
    transaction
  });

  await sendOrderEmail({
    orderID: order.id,
    payload: req.payload,
    type: 'orderPlaced'
  });

  return {
    orderID: order.id,
    alreadyFinalized: false
  };
};
