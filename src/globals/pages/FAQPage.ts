import type { GlobalConfig } from 'payload';
import { adminOnly } from '@/access/adminOnly';
import { seoFields } from '@/fields/seo-fields';

export const FAQPage: GlobalConfig = {
  slug: 'faq-page',
  admin: {
    group: 'Default pages'
  },
  access: {
    read: () => true,
    update: adminOnly
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              defaultValue: 'Întrebări frecvente'
            },
            {
              name: 'description',
              type: 'richText',
              required: true
            },
            {
              name: 'items',
              type: 'array',
              required: true,
              minRows: 1,
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
