import { GlobalConfig } from 'payload';
import { adminOnly } from '@/access/adminOnly';
import { seoFields } from '@/fields/seo-fields';

export const ProductsPage: GlobalConfig = {
  slug: 'products-page',
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
          label: 'Boxes Section',
          fields: [
            {
              name: 'boxesSectionTitle',
              label: 'Title',
              admin: {
                description: 'The title to be used for the boxes section'
              },
              type: 'text',
              required: true,
              defaultValue: 'Boxurile noastre'
            },
            {
              name: 'boxesSectionContent',
              label: 'Content',
              admin: {
                description: 'The content to be used for the boxes section'
              },
              type: 'richText',
              required: true
            }
          ]
        },
        {
          label: 'How It Works',
          fields: [
            {
              name: 'howItWorksTitle',
              label: 'Title',
              admin: {
                description: 'The title to be used for the how it works section'
              },
              type: 'text',
              required: true,
              defaultValue: 'Cum funcționează'
            },
            {
              name: 'howItWorksContent',
              label: 'Content',
              admin: {
                description:
                  'The content to be used for the how it works section'
              },
              type: 'richText',
              required: true
            },
            {
              name: 'step1',
              type: 'group',
              fields: [
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
              ]
            },
            {
              name: 'step2',
              type: 'group',
              fields: [
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
              ]
            },
            {
              name: 'step3',
              type: 'group',
              fields: [
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
              ]
            }
          ]
        },
        {
          label: "What's In Your Box",
          fields: [
            {
              name: 'whatsInYourBoxTitle',
              label: 'title',
              admin: {
                description:
                  "The title to be used for the What's In Your Box section"
              },
              type: 'text',
              required: true,
              defaultValue: 'Ce poate ajunge în boxul tău?'
            },
            {
              name: 'whatsInYourBoxContent',
              label: 'Content',
              admin: {
                description:
                  "The content to be used for the What's In Your Box section"
              },
              type: 'richText',
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
