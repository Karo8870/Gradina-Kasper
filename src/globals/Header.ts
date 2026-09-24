import type { GlobalConfig } from 'payload';

import { adminOnly, publicAccess } from '@/access/users';
import { createGlobalRevalidationHook } from '@/hooks/revalidate-content';

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: publicAccess,
    update: adminOnly
  },
  admin: {
    group: 'Layout'
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
      defaultValue: [],
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
  ],
  hooks: {
    afterChange: [createGlobalRevalidationHook(['/'], { layout: true })]
  }
};
