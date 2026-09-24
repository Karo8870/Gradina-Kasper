import type { GlobalConfig } from 'payload';

import { adminOnly, publicAccess } from '@/access/users';
import { createGlobalRevalidationHook } from '@/hooks/revalidate-content';

export const PickupPointPage: GlobalConfig = {
  slug: 'pickup-point-page',
  access: {
    read: publicAccess,
    update: adminOnly
  },
  admin: {
    group: 'Pages'
  },
  fields: [
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media'
    },
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Punct de ridicare',
      required: true
    },
    {
      name: 'description',
      type: 'richText',
      required: true
    },
    {
      name: 'locationTitle',
      type: 'text',
      defaultValue: 'Locație',
      required: true
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
      defaultValue: 'Program',
      required: true
    },
    {
      name: 'openingHours',
      type: 'array',
      defaultValue: [],
      minRows: 1,
      required: true,
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
  ],
  hooks: {
    afterChange: [createGlobalRevalidationHook(['/pickup-point'])]
  }
};
