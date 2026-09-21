import type { CollectionConfig } from 'payload';
import type { CollectionOverride } from '@payloadcms/plugin-ecommerce/types';

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
    }
  ]
});
