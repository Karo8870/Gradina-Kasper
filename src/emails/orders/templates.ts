import type { PayloadRequest } from 'payload';

import envConfig from '../../../env.config';

import {
  formatOrderDate,
  parseCheckoutSnapshot
} from '@/commerce/order-display';
import { escapeHTML } from '@/emails/auth/shared';
import { generateInvoicePDF } from '@/lib/invoices';
import type { Order } from '@/payload-types';

type EmailKind =
  | 'orderPlaced'
  | 'orderProcessing'
  | 'orderCancelled'
  | 'orderDelivered'
  | 'orderPickedUp'
  | 'orderRefunded';
type Template = { subject?: string | null; body?: string | null };

const fallback: Record<EmailKind, { subject: string; body: string }> = {
  orderPlaced: {
    subject: 'Comanda #{{orderID}} a fost plasată',
    body: '<p>Am primit comanda ta #{{orderID}}.</p>{{itemsTable}}'
  },
  orderProcessing: {
    subject: 'Comanda #{{orderID}} este în procesare',
    body: '<p>Comanda ta #{{orderID}} este în procesare.</p>'
  },
  orderCancelled: {
    subject: 'Comanda #{{orderID}} a fost anulată',
    body: '<p>Comanda ta #{{orderID}} a fost anulată.</p>'
  },
  orderDelivered: {
    subject: 'Comanda #{{orderID}} a fost livrată',
    body: '<p>Comanda ta #{{orderID}} a fost livrată.</p>'
  },
  orderPickedUp: {
    subject: 'Comanda #{{orderID}} a fost ridicată',
    body: '<p>Comanda ta #{{orderID}} a fost ridicată.</p>'
  },
  orderRefunded: {
    subject: 'Comanda #{{orderID}} a fost rambursată',
    body: '<p>Comanda ta #{{orderID}} a fost rambursată.</p>'
  }
};

const rawHTMLPlaceholders = new Set([
  'itemsHTML',
  'itemsTable',
  'shippingAddress'
]);

export function renderOrderTemplate(
  template: string,
  params: Record<string, string>,
  html: boolean
) {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => {
    const value = params[key] ?? '';
    return html && rawHTMLPlaceholders.has(key) ? value : escapeHTML(value);
  });
}

function emailKind(order: Order, placed: boolean): EmailKind | null {
  if (placed) return 'orderPlaced';
  if (order.status === 'processing') return 'orderProcessing';
  if (order.status === 'cancelled') return 'orderCancelled';
  if (order.status === 'refunded') return 'orderRefunded';
  if (order.status === 'completed')
    return order.fulfillmentMethod === 'pickup'
      ? 'orderPickedUp'
      : 'orderDelivered';
  return null;
}

function buildParams(order: Order, recipient: string) {
  const snapshot = parseCheckoutSnapshot(order.checkoutSnapshot);
  const items =
    snapshot?.lines.map(({ name, quantity }) => ({ name, quantity })) ??
    (order.items ?? []).map(({ product, quantity }) => ({
      name:
        typeof product === 'object' && product
          ? product.name
          : `Produs #${product ?? ''}`,
      quantity
    }));
  const itemsHTML = `<ul>${items.map(({ name, quantity }) => `<li>${escapeHTML(name)} &times; ${quantity}</li>`).join('')}</ul>`;
  const itemsTable = `<table role="presentation" cellpadding="8" cellspacing="0"><thead><tr><th align="left">Produs</th><th align="right">Cantitate</th></tr></thead><tbody>${items.map(({ name, quantity }) => `<tr><td>${escapeHTML(name)}</td><td align="right">${quantity}</td></tr>`).join('')}</tbody></table>`;
  const address = order.shippingAddress;
  const shippingAddress = address
    ? [
        [address.firstName, address.lastName].filter(Boolean).join(' '),
        address.addressLine1,
        address.addressLine2,
        [address.city, address.state, address.postalCode]
          .filter(Boolean)
          .join(', '),
        address.country,
        address.phone
      ]
        .filter(Boolean)
        .map((value) => escapeHTML(value ?? ''))
        .join('<br />')
    : '';
  return {
    orderID: String(order.id),
    orderDate: formatOrderDate(order.createdAt),
    fulfillmentDate: order.fulfillmentDate
      ? formatOrderDate(order.fulfillmentDate)
      : '',
    fulfillmentMethod: order.fulfillmentMethod ?? '',
    status: order.status ?? '',
    total: ((order.amount ?? 0) / 100).toFixed(2),
    currency: order.currency ?? 'RON',
    customerEmail: recipient,
    orderURL: new URL(
      `/account/orders/${order.id}`,
      envConfig.NEXT_PUBLIC_SERVER_URL
    ).toString(),
    itemsText: items
      .map(({ name, quantity }) => `${name} x ${quantity}`)
      .join('\n'),
    itemsHTML,
    itemsTable,
    shippingAddress
  };
}

export async function sendOrderTemplateEmail({
  order,
  placed,
  req
}: {
  order: Order;
  placed: boolean;
  req: PayloadRequest;
}) {
  const kind = emailKind(order, placed);
  if (!kind) return;
  const customerID =
    typeof order.customer === 'object' ? order.customer?.id : order.customer;
  const customer = customerID
    ? await req.payload.findByID({
        collection: 'users',
        depth: 0,
        id: customerID,
        overrideAccess: true,
        req,
        select: { email: true }
      })
    : null;
  const recipient = customer?.email ?? order.customerEmail;
  if (!recipient) return;
  const settings = await req.payload.findGlobal({
    slug: 'mail-settings',
    depth: 0,
    overrideAccess: true,
    req
  });
  const template: Template = settings[kind] ?? fallback[kind];
  const params = buildParams(order, recipient);
  const attachments = placed
    ? [
        await generateInvoicePDF({
          customerEmail: order.customerEmail ?? recipient,
          order,
          req
        })
      ]
    : undefined;
  await req.payload.sendEmail({
    attachments,
    html: renderOrderTemplate(
      template.body || fallback[kind].body,
      params,
      true
    ),
    subject: renderOrderTemplate(
      template.subject || fallback[kind].subject,
      params,
      false
    ),
    to: recipient
  });
}
