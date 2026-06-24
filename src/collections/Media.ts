import type { CollectionConfig } from 'payload';

import { adminOnly } from '@/access/adminOnly';

export const Media: CollectionConfig = {
  admin: {
    group: 'Content'
  },
  slug: 'media',
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: () => true,
    update: adminOnly
  },
  upload: {
    formatOptions: {
      format: 'webp',
      options: {
        quality: 80
      }
    }
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true
    }
  ]
};
