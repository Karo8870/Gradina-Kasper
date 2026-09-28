import type { CollectionConfig } from 'payload';

import { adminOnly } from '@/access/users';

export const Invoices: CollectionConfig = {
  slug: 'invoices',
  access: {
    create: () => false,
    delete: () => false,
    read: adminOnly,
    update: () => false
  },
  admin: {
    description:
      'The document ID is the invoice number. Invoices are issued automatically when a paid order is created.',
    defaultColumns: ['id', 'order', 'issuedAt'],
    group: 'Commerce',
    useAsTitle: 'id'
  },
  labels: {
    plural: 'Facturi',
    singular: 'Factură'
  },
  fields: [
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      required: true,
      unique: true,
      index: true
    },
    {
      name: 'issuedAt',
      type: 'date',
      required: true,
      admin: { date: { pickerAppearance: 'dayAndTime' }, readOnly: true }
    }
  ]
};
