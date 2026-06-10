import type { GlobalConfig } from 'payload';

import { adminOnly } from '@/access/adminOnly';
import { seoFields } from '@/fields/seo-fields';

export const AboutPage: GlobalConfig = {
  slug: 'about-page',
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
              name: 'teamImage',
              type: 'upload',
              relationTo: 'media',
              required: true
            },
            {
              name: 'title',
              type: 'text',
              required: true,
              defaultValue: 'Echipa noastră'
            },
            {
              name: 'description',
              type: 'richText',
              required: true
            },
            {
              name: 'members',
              type: 'array',
              fields: [
                {
                  name: 'photo',
                  type: 'upload',
                  relationTo: 'media',
                  required: true
                },
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                  defaultValue: ''
                },
                {
                  name: 'bio',
                  type: 'textarea',
                  required: true,
                  defaultValue: ''
                }
              ],
              defaultValue: [],
              required: true
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
