import type { GlobalConfig } from 'payload';

import { adminOnly } from '@/access/adminOnly';
import { seoFields } from '@/fields/seo-fields';

export const SupportPage: GlobalConfig = {
  slug: 'support-page',
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
              defaultValue: 'Suport'
            },
            {
              name: 'description',
              type: 'richText',
              required: true
            },
            {
              name: 'phoneLabel',
              type: 'text',
              required: true,
              defaultValue: 'Telefon'
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
              required: true,
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
              required: true,
              defaultValue: 'WhatsApp'
            },
            {
              name: 'whatsappNumber',
              type: 'text',
              required: true,
              defaultValue: '+40 700 000 000'
            },
            {
              name: 'whatsappPrefillMessage',
              type: 'textarea',
              required: true,
              defaultValue: 'Bună! Am nevoie de ajutor cu o comandă.'
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
