import type { Order, Product } from '@/payload-types';
import { formatDateTime } from '@/utilities/formatDateTime';
import { getServerSideURL } from '@/utilities/getURL';
import type { Payload } from 'payload';
import { generateInvoicePDF } from '@/lib/invoices';

type EmailType =
  | 'orderCancelled'
  | 'orderDelivered'
  | 'orderPickedUp'
  | 'orderPlaced'
  | 'boxAvailable';

type Template = {
  body?: string | null;
  subject?: string | null;
};

const escapeHTML = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const formatAmount = (amount: number | null | undefined) =>
  Number(amount || 0).toFixed(2);

const getID = (value: unknown) => {
  if (!value) return undefined;
  if (typeof value === 'object' && 'id' in value) {
    return value.id as string | number;
  }
  return value as string | number;
};

const getProductName = (item: NonNullable<Order['items']>[number]) => {
  if (item.product && typeof item.product === 'object') {
    return item.product.name || `Produs #${item.product.id}`;
  }

  return `Produs #${item.product || item.id || ''}`.trim();
};

const getOrderItems = (order: Order) => {
  if (!Array.isArray(order.items)) return [];

  return order.items.map((item) => ({
    name: getProductName(item),
    quantity: Number(item.quantity) || 0
  }));
};

const getItemsText = (order: Order) =>
  getOrderItems(order)
    .map((item) => `${item.name} x ${item.quantity}`)
    .join('\n');

const getItemsHTML = (order: Order) => {
  const items = getOrderItems(order);
  if (!items.length) return '';

  return `<ul>${items
    .map(
      (item) =>
        `<li>${escapeHTML(item.name)} &times; ${escapeHTML(item.quantity)}</li>`
    )
    .join('')}</ul>`;
};

const getItemsTable = (order: Order) => {
  const items = getOrderItems(order);
  if (!items.length) return '';

  return `
<table cellpadding="8" cellspacing="0" border="0" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr>
      <th align="left" style="border-bottom: 1px solid #ddd;">Produs</th>
      <th align="right" style="border-bottom: 1px solid #ddd;">Cantitate</th>
    </tr>
  </thead>
  <tbody>
    ${items
      .map(
        (item) => `
          <tr>
            <td style="border-bottom: 1px solid #eee;">${escapeHTML(item.name)}</td>
            <td align="right" style="border-bottom: 1px solid #eee;">${escapeHTML(item.quantity)}</td>
          </tr>
        `
      )
      .join('')}
  </tbody>
</table>
`.trim();
};

const getShippingAddress = (order: Order) => {
  const address = order.shippingAddress;
  if (!address) return '';

  return [
    [address.firstName, address.lastName].filter(Boolean).join(' '),
    [address.addressLine1, address.addressLine2].filter(Boolean).join(', '),
    [address.city, address.state, address.postalCode]
      .filter(Boolean)
      .join(', '),
    address.country,
    address.phone
  ]
    .filter(Boolean)
    .join('<br />');
};

const getBillingAddress = (order: Order) => {
  const transaction = Array.isArray(order.transactions)
    ? order.transactions.find(
        (item) =>
          item &&
          typeof item === 'object' &&
          'billingAddress' in item &&
          item.billingAddress
      )
    : null;

  const address =
    transaction && typeof transaction === 'object'
      ? transaction.billingAddress
      : null;

  if (!address) return '';

  return [
    [address.firstName, address.lastName].filter(Boolean).join(' '),
    [address.addressLine1, address.addressLine2].filter(Boolean).join(', '),
    [address.city, address.state, address.postalCode]
      .filter(Boolean)
      .join(', '),
    address.country,
    address.phone
  ]
    .filter(Boolean)
    .join('<br />');
};

const resolveCustomerEmail = async ({
  order,
  payload
}: {
  order: Order;
  payload: Payload;
}) => {
  if (order.customerEmail) return order.customerEmail;

  const customerID = getID(order.customer);
  if (!customerID) return '';

  const customer = await payload.findByID({
    id: customerID,
    collection: 'users',
    depth: 0,
    overrideAccess: true,
    select: {
      email: true
    }
  });

  return customer.email || '';
};

const getOrderURL = ({
  customerEmail,
  order
}: {
  customerEmail: string;
  order: Order;
}) => {
  const params = new URLSearchParams();

  if (order.customerEmail && customerEmail) params.set('email', customerEmail);
  if (order.customerEmail && order.accessToken) {
    params.set('accessToken', order.accessToken);
  }

  const queryString = params.toString();

  return `${getServerSideURL()}/orders/${order.id}${queryString ? `?${queryString}` : ''}`;
};

const buildParams = async ({
  order,
  payload
}: {
  order: Order;
  payload: Payload;
}) => {
  const customerEmail = await resolveCustomerEmail({ order, payload });
  const hasShippingAddress = Boolean(getShippingAddress(order));

  return {
    currency: order.currency || 'RON',
    customerEmail,
    billingAddress: getBillingAddress(order),
    deliveryDate: order.shouldBeDeliveredOn
      ? formatDateTime({ date: order.shouldBeDeliveredOn })
      : '',
    fulfillmentLabel: hasShippingAddress ? 'Data livrării' : 'Data ridicării',
    fulfillmentMethod: hasShippingAddress ? 'delivery' : 'pickup',
    itemsHTML: getItemsHTML(order),
    itemsTable: getItemsTable(order),
    itemsText: getItemsText(order),
    orderDate: formatDateTime({ date: order.createdAt }),
    orderID: String(order.id),
    orderURL: getOrderURL({ customerEmail, order }),
    shippingAddress: getShippingAddress(order),
    status: order.status || '',
    total: formatAmount(order.amount)
  };
};

const renderTemplate = ({
  escapeValues,
  params,
  template
}: {
  escapeValues: boolean;
  params: Record<string, string>;
  template: string;
}) =>
  template.replace(/\{\{\s*([\w]+)\s*\}\}/g, (_, key: string) => {
    const value = params[key] ?? '';
    return escapeValues ? escapeHTML(value) : value;
  });

const getFallbackTemplate = (type: EmailType): Template => {
  if (type === 'orderCancelled') {
    return {
      subject: 'Comanda #{{orderID}} a fost anulată',
      body: '<p>Comanda ta #{{orderID}} a fost anulată.</p>{{itemsTable}}'
    };
  }

  if (type === 'orderDelivered') {
    return {
      subject: 'Comanda #{{orderID}} a fost livrată',
      body: '<p>Comanda ta #{{orderID}} a fost livrată.</p>{{itemsTable}}'
    };
  }

  if (type === 'orderPickedUp') {
    return {
      subject: 'Comanda #{{orderID}} a fost ridicată',
      body: '<p>Comanda ta #{{orderID}} a fost ridicată.</p>{{itemsTable}}'
    };
  }

  if (type === 'boxAvailable') {
    return {
      subject: '{{boxName}} este disponibil',
      body: '<p>Boxul <strong>{{boxName}}</strong> este acum disponibil.</p><p><a href="{{boxURL}}">{{boxURL}}</a></p>'
    };
  }

  return {
    subject: 'Comanda #{{orderID}} a fost plasată',
    body: '<p>Am primit comanda ta #{{orderID}}.</p>{{itemsTable}}'
  };
};

export const sendOrderCompletedEmail = async ({
  orderID,
  payload
}: {
  orderID: string | number;
  payload: Payload;
}) => {
  const order = await payload.findByID({
    id: orderID,
    collection: 'orders',
    depth: 0,
    overrideAccess: true,
    select: {
      shippingAddress: true
    }
  });

  await sendOrderEmail({
    orderID,
    payload,
    type: order.shippingAddress?.addressLine1
      ? 'orderDelivered'
      : 'orderPickedUp'
  });
};

export const sendBoxAvailableEmail = async ({
  box,
  payload,
  to
}: {
  box: Product;
  payload: Payload;
  to: string;
}) => {
  try {
    const settings = (await payload.findGlobal({
      slug: 'mail-settings' as any
    })) as Record<EmailType, Template>;
    const fallbackTemplate = getFallbackTemplate('boxAvailable');
    const template = settings?.boxAvailable || fallbackTemplate;
    const subjectTemplate = template.subject || fallbackTemplate.subject || '';
    const bodyTemplate = template.body || fallbackTemplate.body || '';
    const boxURL = `${getServerSideURL()}/products/${box.slug}`;
    const params = {
      availableFrom: box.availableFrom
        ? formatDateTime({ date: box.availableFrom })
        : '',
      boxName: box.name || `Box #${box.id}`,
      boxURL
    };

    await payload.sendEmail({
      html: renderTemplate({
        escapeValues: false,
        params,
        template: bodyTemplate
      }),
      subject: renderTemplate({
        escapeValues: true,
        params,
        template: subjectTemplate
      }),
      to
    });
  } catch (error) {
    payload.logger.error({
      err: error,
      msg: `Failed to send box availability email.`
    });
  }
};

export const sendOrderEmail = async ({
  orderID,
  payload,
  type
}: {
  orderID: string | number;
  payload: Payload;
  type: EmailType;
}) => {
  try {
    console.log('Sending order email');

    const order = (await payload.findByID({
      id: orderID,
      collection: 'orders',
      depth: 2,
      overrideAccess: true,
      select: {
        accessToken: true,
        amount: true,
        createdAt: true,
        currency: true,
        customer: true,
        customerEmail: true,
        items: true,
        shippingAddress: true,
        shouldBeDeliveredOn: true,
        status: true,
        transactions: true
      }
    })) as Order;

    console.log('Fetched order');

    const params = await buildParams({ order, payload });
    const to = params.customerEmail;

    if (!to) {
      console.log('Could not send ${type} email: order has no email.');
      payload.logger.warn(`Could not send ${type} email: order has no email.`);
      return;
    }

    const settings = (await payload.findGlobal({
      slug: 'mail-settings' as any
    })) as Record<EmailType, Template>;
    const fallbackTemplate = getFallbackTemplate(type);
    const template = settings?.[type] || fallbackTemplate;
    const subjectTemplate = template.subject || fallbackTemplate.subject || '';
    const bodyTemplate = template.body || fallbackTemplate.body || '';
    const attachments =
      type === 'orderPlaced'
        ? [await generateInvoicePDF({ customerEmail: to, order, payload })]
        : undefined;

    console.log('Sending now');

    await payload.sendEmail({
      attachments,
      html: renderTemplate({
        escapeValues: false,
        params,
        template: bodyTemplate
      }),
      subject: renderTemplate({
        escapeValues: true,
        params,
        template: subjectTemplate
      }),
      to
    });

    console.log('Sent', {
      attachments,
      html: renderTemplate({
        escapeValues: false,
        params,
        template: bodyTemplate
      }),
      subject: renderTemplate({
        escapeValues: true,
        params,
        template: subjectTemplate
      }),
      to
    });
  } catch (error) {
    payload.logger.error({ err: error, msg: `Failed to send ${type} email.` });
  }
};
