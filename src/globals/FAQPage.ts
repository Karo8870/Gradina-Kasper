import type { GlobalConfig } from 'payload';

import { adminOnly, publicAccess } from '@/access/users';
import { createGlobalRevalidationHook } from '@/hooks/revalidate-content';

export const FAQPage: GlobalConfig = {
  slug: 'faq-page',
  access: {
    read: publicAccess,
    update: adminOnly
  },
  admin: {
    group: 'Pages'
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Întrebări frecvente',
      required: true
    },
    {
      name: 'description',
      type: 'richText',
      required: true
    },
    {
      name: 'items',
      type: 'array',
      defaultValue: [],
      minRows: 1,
      required: true,
      fields: [
        {
          name: 'question',
          type: 'text',
          required: true
        },
        {
          name: 'answer',
          type: 'richText',
          required: true
        }
      ]
    }
  ],
  hooks: {
    afterChange: [createGlobalRevalidationHook(['/faq'])]
  }
};
