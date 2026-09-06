import { adminOnly } from '@/access/adminOnly';
import type { CollectionConfig } from 'payload';

export const Invoices: CollectionConfig = {
  slug: 'invoices',
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: adminOnly,
    update: adminOnly
  },
  admin: {
    description:
      'ID-ul documentului este numărul facturii și se incrementează automat.',
    defaultColumns: ['id', 'order', 'issuedAt'],
    group: 'Ecommerce',
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
      unique: true
    },
    {
      name: 'issuedAt',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime'
        },
        readOnly: true
      }
    }
  ]
};
