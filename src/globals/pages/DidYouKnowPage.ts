import type { GlobalConfig } from 'payload';
import { adminOnly } from '@/access/adminOnly';
import { seoFields } from '@/fields/seo-fields';

export const DidYouKnowPage: GlobalConfig = {
  slug: 'did-you-know-page',
  admin: {
    group: 'Default pages'
  },
  access: {
    read: () => true,
    update: adminOnly
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      defaultValue: 'Știai că...'
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              name: 'didYouKnowContent',
              label: 'Content',
              admin: {
                description: 'The content to be used for the did you know page'
              },
              type: 'richText',
              required: true
            }
          ],
          label: 'Content'
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
