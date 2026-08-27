import { slugField } from 'payload';
import { generatePreviewPath } from '@/utilities/generatePreviewPath';
import { CollectionOverride } from '@payloadcms/plugin-ecommerce/types';
import {
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor
} from '@payloadcms/richtext-lexical';
import { seoFields } from '@/fields/seo-fields';

function validatePrice(value: string | null | undefined | string[]) {
  if (!value || typeof value === 'object') {
    return "Value isn't a valid number with 2 decimal places";
  }

  if (value.match(/^([^0]\d*|0)\.\d{2}$/g)) {
    return true;
  }

  if (parseInt(value) < 0) {
    return 'Price must be positive';
  }

  return "Value isn't a valid number with 2 decimal places";
}

export const ProductsCollection: CollectionOverride = ({
  defaultCollection
}) => ({
  ...defaultCollection,
  admin: {
    ...defaultCollection?.admin,
    defaultColumns: [
      'title',
      'enableVariants',
      '_status',
      'variants.variants',
      ''
    ],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'products',
          req
        })
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'products',
        req
      }),
    useAsTitle: 'name'
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              name: 'description',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({
                      enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4']
                    }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature()
                  ];
                }
              }),
              label: false,
              required: true
            },
            {
              name: 'gallery',
              type: 'array',
              minRows: 1,
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true
                }
              ]
            },
            {
              name: 'possibleVegetables',
              label: 'Possible vegetables',
              type: 'relationship',
              relationTo: 'vegetables',
              hasMany: true,
              required: true,
              defaultValue: []
            }
          ],
          label: 'Content'
        },
        {
          fields: [
            {
              name: 'inventory',
              label: 'Inventory',
              type: 'number',
              required: true,
              defaultValue: 0
            },
            {
              name: 'price',
              label: 'Price (RON)',
              type: 'text',
              required: true,
              defaultValue: '50.00',
              admin: {
                description:
                  'The price of the item in RON using 2 decimal points'
              },
              validate: validatePrice
            },
            {
              name: 'hasDiscount',
              label: 'Enable Discount',
              type: 'checkbox',
              defaultValue: false
            },
            {
              name: 'discountedPrice',
              label: 'Discounted price (RON)',
              type: 'text',
              required: true,
              defaultValue: '50.00',
              admin: {
                description:
                  'The discounted price of the item in RON using 2 decimal points',
                condition: (_, siblingData) => siblingData.hasDiscount
              },
              validate: validatePrice
            },
            {
              name: 'availableFrom',
              type: 'date',
              label: 'Available from',
              required: true,
              admin: {
                date: {
                  pickerAppearance: 'dayOnly'
                }
              }
            },
            {
              name: 'availableUntil',
              type: 'date',
              label: 'Available until',
              required: true,
              admin: {
                date: {
                  pickerAppearance: 'dayOnly'
                }
              }
            },
            {
              name: 'hideProduct',
              type: 'checkbox',
              label: 'Hide product',
              required: true,
              defaultValue: false,
              admin: {
                description: 'Hides the product from the client'
              }
            },
            {
              name: 'disableProduct',
              type: 'checkbox',
              label: 'Disable product',
              required: true,
              defaultValue: false,
              admin: {
                description:
                  'Disables the product while still showing it for the clients. If checked, availability dates will be completely ignored. Hide product still works as usual'
              }
            }
          ],
          label: 'Product Details'
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: seoFields
        }
      ]
    },
    slugField({
      useAsSlug: 'name'
    })
  ]
});
