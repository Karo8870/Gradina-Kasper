import type { CollectionConfig, Field } from 'payload';
import { slugField } from 'payload';
import type { CollectionOverride } from '@payloadcms/plugin-ecommerce/types';

import { commerceCurrencies, storeCurrency } from '@/commerce/currencies';
import { createCollectionRevalidationHooks } from '@/hooks/revalidate-content';

const priceFieldName = `priceIn${storeCurrency.code.toUpperCase()}`;
const productRevalidationHooks = createCollectionRevalidationHooks({
  publishedOnly: true,
  resolvePaths: () => ['/products']
});

function validatePrice(value: unknown) {
  if (value === null || typeof value === 'undefined') return true;

  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0
    ? true
    : `Price must be greater than 0.00 ${storeCurrency.code}.`;
}

const priceField: Field = {
  name: priceFieldName,
  type: 'number',
  label: `Price (${storeCurrency.code}, VAT included)`,
  min: 1,
  validate: validatePrice,
  admin: {
    components: {
      Cell: {
        clientProps: {
          currenciesConfig: commerceCurrencies,
          currency: storeCurrency
        },
        path: '@payloadcms/plugin-ecommerce/client#PriceCell'
      },
      Field: {
        clientProps: {
          currenciesConfig: commerceCurrencies,
          currency: storeCurrency
        },
        path: '@payloadcms/plugin-ecommerce/rsc#PriceInput'
      }
    },
    description: 'Enter a price with up to two decimal places. VAT is included.'
  }
};

export const productsCollectionOverride: CollectionOverride = ({
  defaultCollection
}): CollectionConfig => ({
  ...defaultCollection,
  admin: {
    ...defaultCollection.admin,
    defaultColumns: [
      'name',
      priceFieldName,
      'inventory',
      'visibility',
      '_status'
    ],
    useAsTitle: 'name'
  },
  orderable: true,
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'name',
              type: 'text',
              label: 'Name',
              required: true
            },
            {
              name: 'description',
              type: 'richText',
              label: 'Description'
            },
            {
              name: 'gallery',
              type: 'array',
              label: 'Gallery',
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
              type: 'relationship',
              label: 'Possible vegetables',
              relationTo: 'vegetables',
              defaultValue: [],
              hasMany: true
            }
          ]
        },
        {
          label: 'Commerce',
          fields: [
            priceField,
            {
              name: 'hasDiscount',
              type: 'checkbox',
              label: 'Discount',
              defaultValue: false
            },
            {
              name: 'originalPriceInRON',
              type: 'number',
              label: 'Original price (RON, VAT included)',
              min: 1,
              validate: (
                value: unknown,
                { siblingData }: { siblingData: Record<string, unknown> }
              ) => {
                if (!siblingData?.hasDiscount) return true;
                if (typeof value !== 'number' || !Number.isSafeInteger(value)) {
                  return 'Enter the original price.';
                }
                const discountedPrice = siblingData[priceFieldName];
                return typeof discountedPrice === 'number' &&
                  value > discountedPrice
                  ? true
                  : 'Original price must be higher than the discounted price.';
              },
              admin: {
                condition: (_, siblingData) =>
                  Boolean(siblingData?.hasDiscount),
                description:
                  'Enter the price before the discount, with up to two decimal places.',
                components: {
                  Field: {
                    clientProps: {
                      currenciesConfig: commerceCurrencies,
                      currency: storeCurrency
                    },
                    path: '@payloadcms/plugin-ecommerce/rsc#PriceInput'
                  }
                }
              }
            },
            {
              name: 'inventory',
              type: 'number',
              label: 'Inventory',
              defaultValue: 0,
              min: 0
            },
            {
              name: 'visibility',
              type: 'select',
              label: 'Visibility',
              defaultValue: 'public',
              options: [
                {
                  label: 'Public',
                  value: 'public'
                },
                {
                  label: 'Hidden',
                  value: 'hidden'
                }
              ]
            },
            {
              name: 'disabled',
              type: 'checkbox',
              label: 'Disabled',
              defaultValue: false
            },
            {
              type: 'group',
              name: 'availability',
              label: 'Availability',
              fields: [
                {
                  name: 'enableFrom',
                  type: 'checkbox',
                  label: 'Enable start date',
                  defaultValue: false
                },
                {
                  name: 'from',
                  type: 'date',
                  label: 'Available from',
                  admin: {
                    condition: (_, siblingData) =>
                      Boolean(siblingData?.enableFrom),
                    date: {
                      pickerAppearance: 'dayAndTime'
                    }
                  }
                },
                {
                  name: 'enableUntil',
                  type: 'checkbox',
                  label: 'Enable end date',
                  defaultValue: false
                },
                {
                  name: 'until',
                  type: 'date',
                  label: 'Available until',
                  admin: {
                    condition: (_, siblingData) =>
                      Boolean(siblingData?.enableUntil),
                    date: {
                      pickerAppearance: 'dayAndTime'
                    }
                  }
                }
              ]
            }
          ]
        }
      ]
    },
    slugField({
      position: 'sidebar',
      useAsSlug: 'name'
    })
  ],
  hooks: {
    ...defaultCollection.hooks,
    afterChange: [
      ...(defaultCollection.hooks?.afterChange ?? []),
      ...productRevalidationHooks.afterChange
    ],
    afterDelete: [
      ...(defaultCollection.hooks?.afterDelete ?? []),
      ...productRevalidationHooks.afterDelete
    ]
  }
});
