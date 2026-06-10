import type { GlobalConfig } from 'payload';

import { adminOnly } from '@/access/adminOnly';

export const Footer: GlobalConfig = {
  slug: 'footer',
  admin: {
    group: 'Layout'
  },
  access: {
    read: () => true,
    update: adminOnly
  },
  fields: [
    {
      name: 'slogan',
      type: 'text',
      required: true,
      defaultValue: ''
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
          required: true,
          defaultValue: 'https://www.facebook.com'
        },
        {
          name: 'instagramUrl',
          type: 'text',
          required: true,
          defaultValue: 'https://www.instagram.com'
        }
      ]
    },
    {
      name: 'columns',
      type: 'array',
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
  ]
};
