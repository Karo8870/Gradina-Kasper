import type { GlobalConfig } from 'payload';

import { adminOnly } from '@/access/adminOnly';
import { seoFields } from '@/fields/seo-fields';

export const PickupPointPage: GlobalConfig = {
  slug: 'pickup-point-page',
  access: {
    read: () => true,
    update: adminOnly
  },
  admin: {
    group: 'Default pages'
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
              required: true
            },
            {
              name: 'title',
              type: 'text',
              required: true,
              defaultValue: 'Punct de ridicare'
            },
            {
              name: 'description',
              type: 'richText',
              required: true
            },
            {
              name: 'locationTitle',
              type: 'text',
              required: true,
              defaultValue: 'Locație'
            },
            {
              name: 'locationLine1',
              type: 'text',
              required: true
            },
            {
              name: 'locationLine2',
              type: 'text',
              required: true
            },
            {
              name: 'openingHoursTitle',
              type: 'text',
              required: true,
              defaultValue: 'Program'
            },
            {
              name: 'openingHours',
              type: 'array',
              required: true,
              minRows: 1,
              fields: [
                {
                  name: 'day',
                  type: 'text',
                  required: true
                },
                {
                  name: 'hours',
                  type: 'text',
                  required: true
                }
              ]
            }
          ]
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: seoFields
        }
      ]
    }
  ]
};
