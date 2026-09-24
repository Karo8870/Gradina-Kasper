import type { GlobalConfig } from 'payload';

import { adminOnly, publicAccess } from '@/access/users';
import { createGlobalRevalidationHook } from '@/hooks/revalidate-content';

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: publicAccess,
    update: adminOnly
  },
  admin: {
    group: 'Layout'
  },
  fields: [
    {
      name: 'slogan',
      type: 'text',
      defaultValue: '',
      required: true
    },
    {
      name: 'footerImage',
      type: 'upload',
      relationTo: 'media'
    },
    {
      name: 'social',
      type: 'group',
      required: true,
      fields: [
        {
          name: 'facebookUrl',
          type: 'text',
          defaultValue: 'https://www.facebook.com',
          required: true
        },
        {
          name: 'instagramUrl',
          type: 'text',
          defaultValue: 'https://www.instagram.com',
          required: true
        }
      ]
    },
    {
      name: 'columns',
      type: 'array',
      defaultValue: [],
      required: true,
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true
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
      ]
    }
  ],
  hooks: {
    afterChange: [createGlobalRevalidationHook(['/'], { layout: true })]
  }
};
