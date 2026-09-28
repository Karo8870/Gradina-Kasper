import type { Field, GlobalConfig } from 'payload';

import { adminOnly, publicAccess } from '@/access/users';
import { createGlobalRevalidationHook } from '@/hooks/revalidate-content';

function stepFields(): Field[] {
  return [
    {
      name: 'title',
      type: 'text',
      required: true
    },
    {
      name: 'description',
      type: 'text',
      required: true
    }
  ];
}

export const ProductsPage: GlobalConfig = {
  slug: 'products-page',
  access: {
    read: publicAccess,
    update: adminOnly
  },
  admin: {
    group: 'Pages'
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Boxes',
          fields: [
            {
              name: 'boxesSectionTitle',
              type: 'text',
              defaultValue: 'Boxurile noastre',
              required: true
            },
            {
              name: 'boxesSectionContent',
              type: 'richText',
              required: true
            },
            {
              name: 'featuredProducts',
              type: 'relationship',
              label: 'Featured boxes',
              relationTo: 'products',
              hasMany: true,
              admin: {
                description:
                  'Selected boxes appear as the larger product panels at the top of this page. Their order here is preserved on the page.'
              }
            }
          ]
        },
        {
          label: 'How it works',
          fields: [
            {
              name: 'howItWorksTitle',
              type: 'text',
              defaultValue: 'Cum funcționează',
              required: true
            },
            {
              name: 'howItWorksContent',
              type: 'richText',
              required: true
            },
            {
              name: 'step1',
              type: 'group',
              fields: stepFields()
            },
            {
              name: 'step2',
              type: 'group',
              fields: stepFields()
            },
            {
              name: 'step3',
              type: 'group',
              fields: stepFields()
            }
          ]
        },
        {
          label: 'Inside the box',
          fields: [
            {
              name: 'whatsInYourBoxTitle',
              type: 'text',
              defaultValue: 'Ce poate ajunge în boxul tău?',
              required: true
            },
            {
              name: 'whatsInYourBoxContent',
              type: 'richText',
              required: true
            }
          ]
        }
      ]
    }
  ],
  hooks: {
    afterChange: [createGlobalRevalidationHook(['/products'])]
  }
};
