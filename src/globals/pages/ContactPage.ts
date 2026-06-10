import type { GlobalConfig } from 'payload';

import { adminOnly } from '@/access/adminOnly';
import { seoFields } from '@/fields/seo-fields';

export const ContactPage: GlobalConfig = {
  slug: 'contact-page',
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
              name: 'title',
              type: 'text',
              required: true,
              defaultValue: 'Contact'
            },
            {
              name: 'description',
              type: 'richText'
            },
            {
              name: 'phoneLabel',
              type: 'text',
              defaultValue: 'Phone'
            },
            {
              name: 'phone',
              type: 'text',
              required: true,
              defaultValue: '+40 700 000 000'
            },
            {
              name: 'emailLabel',
              type: 'text',
              defaultValue: 'Email'
            },
            {
              name: 'email',
              type: 'email',
              required: true,
              defaultValue: 'contact@gradinakasper.ro'
            },
            {
              name: 'whatsappLabel',
              type: 'text',
              defaultValue: 'WhatsApp'
            },
            {
              name: 'whatsappNumber',
              type: 'text',
              required: true,
              defaultValue: '+40 700 000 000'
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
