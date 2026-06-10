import type { GlobalConfig } from 'payload';

import { adminOnly } from '@/access/adminOnly';

export const Header: GlobalConfig = {
  slug: 'header',
  admin: {
    group: 'Layout'
  },
  access: {
    read: () => true,
    update: adminOnly
  },
  fields: [
    {
      name: 'headerImage',
      type: 'upload',
      relationTo: 'media'
    },
    {
      name: 'links',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true
        },
        {
          name: 'url',
          type: 'text',
          required: true
        }
      ]
    }
  ]
};
