import type {
  CollectionAfterChangeHook,
  CollectionBeforeChangeHook,
  CollectionConfig
} from 'payload';
import type { CollectionOverride } from '@payloadcms/plugin-ecommerce/types';

import { orderStatuses } from '@/commerce/order-activity';
import { sendOrderTemplateEmail } from '@/emails/orders/templates';
import { getOrCreateInvoice } from '@/lib/invoices';
import type { Order, OrderStatus } from '@/payload-types';

type ActivitySource = 'admin' | 'customer' | 'system';

const statusOptions = orderStatuses.map((status) => ({
  label: status[0].toUpperCase() + status.slice(1),
  value: status
}));

function activitySource(
  context: Record<string, unknown>,
  user: unknown
): ActivitySource {
  if (
    context.orderActivitySource === 'admin' ||
    context.orderActivitySource === 'customer'
  ) {
    return context.orderActivitySource;
  }

  return (user as { role?: string } | null)?.role === 'admin'
    ? 'admin'
    : 'system';
}

function placementActivity(order: Pick<Order, 'createdAt'>) {
  return {
    description: 'Order placed.',
    occurredAt: order.createdAt,
    source: 'system' as const,
    toStatus: 'processing' as const,
    type: 'order_placed' as const
  };
}

export const recordOrderActivity: CollectionBeforeChangeHook<Order> = ({
  context,
  data,
  operation,
  originalDoc,
  req
}) => {
  const now = new Date().toISOString();

  if (operation === 'create') {
    data.activity = [placementActivity({ createdAt: now })];
    return data;
  }

  if (!originalDoc) return data;

  const previousStatus = originalDoc.status ?? 'processing';
  const nextStatus = (data.status ?? previousStatus) as OrderStatus;
  const existingActivity = originalDoc.activity?.length
    ? originalDoc.activity
    : [placementActivity(originalDoc)];

  if (nextStatus === previousStatus) {
    data.activity = existingActivity;
    return data;
  }

  const source = activitySource(context, req.user);
  const cancellationRequested =
    source === 'customer' && nextStatus === 'cancelled';

  data.activity = [
    ...existingActivity,
    {
      description: cancellationRequested
        ? 'Cancellation requested by customer. Manual payment handling may be required.'
        : `Status changed from ${previousStatus} to ${nextStatus}.`,
      fromStatus: previousStatus,
      occurredAt: now,
      source,
      toStatus: nextStatus,
      type: cancellationRequested ? 'cancellation_requested' : 'status_changed'
    }
  ];

  return data;
};

export const emailOrderStatusChange: CollectionAfterChangeHook<Order> = async ({
  doc,
  operation,
  previousDoc,
  req
}) => {
  if (operation === 'update' && doc.status === previousDoc.status) {
    return doc;
  }

  try {
    if (operation === 'create') await getOrCreateInvoice({ order: doc, req });
    await sendOrderTemplateEmail({
      order: doc,
      placed: operation === 'create',
      req
    });
  } catch (error) {
    req.payload.logger.error({
      err: error,
      msg: `Failed to issue invoice or send email for order ${doc.id}.`
    });
  }

  return doc;
};

export const ordersCollectionOverride: CollectionOverride = ({
  defaultCollection
}): CollectionConfig => ({
  ...defaultCollection,
  admin: {
    ...defaultCollection.admin,
    defaultColumns: ['createdAt', 'customer', 'amount', 'status']
  },
  fields: [
    ...defaultCollection.fields,
    {
      name: 'paymentReference',
      type: 'text',
      label: 'Payment reference',
      index: true,
      unique: true,
      admin: {
        position: 'sidebar',
        readOnly: true
      }
    },
    {
      name: 'fulfillmentMethod',
      type: 'select',
      label: 'Fulfillment method',
      options: [
        { label: 'Delivery', value: 'delivery' },
        { label: 'Pickup', value: 'pickup' }
      ],
      admin: { position: 'sidebar', readOnly: true }
    },
    {
      name: 'fulfillmentDate',
      type: 'date',
      label: 'Fulfillment date',
      admin: { position: 'sidebar', readOnly: true }
    },
    {
      name: 'checkoutSnapshot',
      type: 'json',
      label: 'Checkout snapshot',
      admin: { readOnly: true }
    },
    {
      name: 'activity',
      type: 'array',
      label: 'Activity history',
      access: {
        create: () => false,
        update: () => false
      },
      admin: { readOnly: true },
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            { label: 'Order placed', value: 'order_placed' },
            { label: 'Status changed', value: 'status_changed' },
            {
              label: 'Cancellation requested',
              value: 'cancellation_requested'
            }
          ]
        },
        {
          name: 'occurredAt',
          type: 'date',
          required: true,
          admin: { date: { pickerAppearance: 'dayAndTime' } }
        },
        {
          name: 'source',
          type: 'select',
          required: true,
          options: [
            { label: 'System', value: 'system' },
            { label: 'Customer', value: 'customer' },
            { label: 'Administrator', value: 'admin' }
          ]
        },
        {
          name: 'fromStatus',
          type: 'select',
          options: statusOptions
        },
        {
          name: 'toStatus',
          type: 'select',
          options: statusOptions
        },
        {
          name: 'description',
          type: 'text',
          required: true
        }
      ]
    }
  ],
  hooks: {
    ...defaultCollection.hooks,
    afterChange: [
      ...(defaultCollection.hooks?.afterChange ?? []),
      emailOrderStatusChange
    ],
    beforeChange: [
      recordOrderActivity,
      ...(defaultCollection.hooks?.beforeChange ?? [])
    ]
  }
});
