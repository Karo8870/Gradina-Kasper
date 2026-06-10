import { CollectionConfig } from 'payload';
import { adminOnly } from '@/access/adminOnly';

export const Vegetables: CollectionConfig = {
  slug: 'vegetables',
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: () => true,
    update: adminOnly
  },
  admin: {
    useAsTitle: 'name',
    group: 'Other'
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true
    }
  ]
};
