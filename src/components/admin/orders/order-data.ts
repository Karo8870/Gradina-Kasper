import { parseCheckoutSnapshot } from '@/commerce/order-display';
import type { Order, Transaction } from '@/payload-types';

import type { AdminAddress, AdminOrder, AdminOrderTransaction } from './types';

function relationshipID(value: number | { id: number } | null | undefined) {
  return typeof value === 'object' && value ? value.id : (value ?? null);
}

function addressDTO(
  address:
    Order['shippingAddress'] | Transaction['billingAddress'] | null | undefined
): AdminAddress | null {
  if (!address) return null;

  return {
    addressLine1: address.addressLine1 ?? '',
    addressLine2: address.addressLine2 ?? '',
    city: address.city ?? '',
    country: address.country ?? '',
    firstName: address.firstName ?? '',
    lastName: address.lastName ?? '',
    phone: address.phone ?? '',
    postalCode: address.postalCode ?? '',
    state: address.state ?? ''
  };
}

function transactionDTO(transaction: Transaction): AdminOrderTransaction {
  return {
    amount: transaction.amount ?? 0,
    billingAddress: addressDTO(transaction.billingAddress),
    cartID: relationshipID(transaction.cart),
    createdAt: transaction.createdAt,
    currency: transaction.currency ?? 'RON',
    customerEmail: transaction.customerEmail ?? '',
    customerID: relationshipID(transaction.customer),
    id: transaction.id,
    merchantOrderID: transaction.netopia?.merchantOrderID ?? '',
    ntpID: transaction.netopia?.ntpID ?? '',
    paymentMethod: transaction.paymentMethod ?? '',
    status: transaction.status,
    updatedAt: transaction.updatedAt
  };
}

export function adminOrderDTO(order: Order): AdminOrder {
  const snapshot = parseCheckoutSnapshot(order.checkoutSnapshot);
  const customer =
    order.customer && typeof order.customer === 'object'
      ? order.customer
      : null;
  const transactions = (order.transactions ?? []).filter(
    (transaction): transaction is Transaction =>
      typeof transaction === 'object' && transaction !== null
  );
  const billingAddress =
    snapshot?.billingAddress ??
    transactions.find((transaction) => transaction.billingAddress)
      ?.billingAddress;
  const items = snapshot?.lines.length
    ? snapshot.lines.map((line) => ({
        lineTotal: line.unitPrice * line.quantity,
        name: line.name,
        productID: line.product,
        quantity: line.quantity,
        unitPrice: line.unitPrice
      }))
    : (order.items ?? []).map((line) => {
        const product =
          line.product && typeof line.product === 'object'
            ? line.product
            : null;
        const unitPrice = product?.priceInRON ?? 0;

        return {
          lineTotal: unitPrice * line.quantity,
          name:
            product?.name ?? `Product #${relationshipID(line.product) ?? '-'}`,
          productID: relationshipID(line.product),
          quantity: line.quantity,
          unitPrice
        };
      });

  return {
    activity: order.activity?.length
      ? order.activity.map((event) => ({
          description: event.description,
          fromStatus: event.fromStatus ?? '',
          occurredAt: event.occurredAt,
          source: event.source,
          toStatus: event.toStatus ?? '',
          type: event.type
        }))
      : [
          {
            description: 'Order placed.',
            fromStatus: '',
            occurredAt: order.createdAt,
            source: 'system',
            toStatus: 'processing',
            type: 'order_placed'
          }
        ],
    amount: order.amount ?? 0,
    billingAddress: addressDTO(billingAddress),
    createdAt: order.createdAt,
    currency: order.currency ?? 'RON',
    customerEmail: customer?.email ?? order.customerEmail ?? '',
    customerID: relationshipID(order.customer),
    customerName: [billingAddress?.firstName, billingAddress?.lastName]
      .filter(Boolean)
      .join(' '),
    deliveryFee: snapshot?.deliveryFee ?? 0,
    deliveryVAT: snapshot?.deliveryVAT ?? 0,
    fulfillmentDate: snapshot?.fulfillmentDate ?? order.fulfillmentDate ?? '',
    fulfillmentMethod:
      snapshot?.fulfillmentMethod ?? order.fulfillmentMethod ?? 'pickup',
    grandTotal: snapshot?.grandTotal ?? order.amount ?? 0,
    id: order.id,
    items,
    paymentReference: order.paymentReference ?? '',
    productSubtotal: snapshot?.productSubtotal ?? order.amount ?? 0,
    productVAT: snapshot?.productVAT ?? 0,
    rawSnapshot: order.checkoutSnapshot ?? null,
    shippingAddress: addressDTO(
      snapshot?.shippingAddress ?? order.shippingAddress
    ),
    status: order.status ?? 'processing',
    transactions: transactions.map(transactionDTO),
    updatedAt: order.updatedAt,
    vatRates: snapshot?.vatRates ?? { delivery: 0, products: 0 }
  };
}
