import type { GlobalConfig } from 'payload';
import { adminOnly } from '@/access/adminOnly';
import { seoFields } from '@/fields/seo-fields';

export const HomePage: GlobalConfig = {
  slug: 'home-page',
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
          label: 'Hero',
          fields: [
            {
              name: 'heroBackgroundImage',
              label: 'Background Image',
              type: 'upload',
              relationTo: 'media',
              required: true
            },
            {
              name: 'heroTitle',
              label: 'Title',
              admin: {
                description: 'The title to be used on the hero image'
              },
              type: 'textarea',
              required: true,
              defaultValue: 'Bine ai venit la Gradina Kasper!'
            },
            {
              name: 'subtitle',
              admin: {
                description: 'The subtitle to be used on the hero image'
              },
              type: 'textarea',
              required: true,
              defaultValue:
                'Aici trebuie să scrie direct că lucrăm fără pesticide + SLOGAN'
            },
            {
              name: 'callToActionText',
              label: 'Call to action button',
              admin: {
                description: 'The text to appear on the call to action button'
              },
              type: 'text',
              required: true,
              defaultValue: 'Descoperă produsele noastre'
            }
          ]
        },
        {
          label: 'Highlight Box',
          fields: [
            {
              name: 'highlightBoxTitle',
              label: 'Title',
              admin: {
                description:
                  'The title to be used for the highlighted box section within home'
              },
              type: 'text',
              required: true,
              defaultValue: 'Produs recomandat'
            },
            {
              name: 'highlightBoxContent',
              label: 'Content',
              admin: {
                description:
                  'The content to be used for the highlighted box section within home'
              },
              type: 'richText',
              required: true
            },
            {
              name: 'featuredProduct',
              admin: {
                description: 'The box to be displayed on home'
              },
              type: 'relationship',
              relationTo: 'products'
            }
          ]
        },
        {
          label: 'Highlight Articles',
          fields: [
            {
              name: 'highlightArticlesTitle',
              label: 'Title',
              admin: {
                description:
                  'The title to be used for the highlighted articles section within home'
              },
              type: 'text',
              required: true,
              defaultValue: 'Articole recomandate'
            },
            {
              name: 'highlightArticlesContent',
              label: 'Content',
              admin: {
                description:
                  'The content to be used for the highlighted articles section within home'
              },
              type: 'richText',
              required: true
            },
            {
              name: 'highlightedArticles',
              type: 'relationship',
              relationTo: 'articles',
              hasMany: true,
              maxRows: 3,
              admin: {
                description: 'The articles to be displayed on home'
              }
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
