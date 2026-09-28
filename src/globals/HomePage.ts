import type { GlobalConfig } from 'payload';

import { adminOnly, publicAccess } from '@/access/users';
import { createGlobalRevalidationHook } from '@/hooks/revalidate-content';

export const HomePage: GlobalConfig = {
  slug: 'home-page',
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
          label: 'Hero',
          fields: [
            {
              name: 'heroBackgroundImage',
              type: 'upload',
              relationTo: 'media',
              required: true
            },
            {
              name: 'heroTitle',
              type: 'textarea',
              defaultValue: 'Bine ai venit la Grădina Kasper!',
              required: true
            },
            {
              name: 'subtitle',
              type: 'textarea',
              required: true
            },
            {
              name: 'callToActionText',
              type: 'text',
              defaultValue: 'Descoperă produsele noastre',
              required: true
            }
          ]
        },
        {
          label: 'Featured product',
          fields: [
            {
              name: 'highlightBoxTitle',
              type: 'text',
              defaultValue: 'Produs recomandat',
              required: true
            },
            {
              name: 'highlightBoxContent',
              type: 'richText',
              required: true
            },
            {
              name: 'featuredProduct',
              type: 'relationship',
              relationTo: 'products'
            }
          ]
        },
        {
          label: 'Featured articles',
          fields: [
            {
              name: 'highlightArticlesTitle',
              type: 'text',
              defaultValue: 'Articole recomandate',
              required: true
            },
            {
              name: 'highlightArticlesContent',
              type: 'richText',
              required: true
            },
            {
              name: 'highlightedArticles',
              type: 'relationship',
              relationTo: 'articles',
              defaultValue: [],
              hasMany: true,
              maxRows: 3
            }
          ]
        }
      ]
    }
  ],
  hooks: {
    afterChange: [createGlobalRevalidationHook(['/'])]
  }
};
