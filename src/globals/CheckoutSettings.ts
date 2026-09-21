import type { Field, GlobalConfig } from 'payload';

import { adminOnly } from '@/access/users';
import { commerceCurrencies, storeCurrency } from '@/commerce/currencies';

function validateMoney(value: unknown) {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
    ? true
    : 'Enter a non-negative amount with no more than two decimal places.';
}

function moneyField({
  defaultValue,
  description,
  label,
  name
}: {
  defaultValue: number;
  description: string;
  label: string;
  name: string;
}): Field {
  return {
    name,
    type: 'number',
    label,
    defaultValue,
    min: 0,
    required: true,
    validate: validateMoney,
    admin: {
      components: {
        Field: {
          clientProps: {
            currenciesConfig: commerceCurrencies,
            currency: storeCurrency
          },
          path: '@payloadcms/plugin-ecommerce/rsc#PriceInput'
        }
      },
      description
    }
  };
}

export const CheckoutSettings: GlobalConfig = {
  slug: 'checkout-settings',
  label: 'Checkout Settings',
  access: {
    read: () => true,
    update: adminOnly
  },
  admin: {
    group: 'Commerce'
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Delivery',
          fields: [
            moneyField({
              name: 'deliveryFee',
              label: `Delivery fee (${storeCurrency.code})`,
              defaultValue: 5000,
              description: 'Added only to delivery orders.'
            }),
            moneyField({
              name: 'minimumDeliverySubtotal',
              label: `Minimum delivery subtotal (${storeCurrency.code})`,
              defaultValue: 10000,
              description:
                'Required product subtotal before a delivery order can proceed.'
            })
          ]
        },
        {
          label: 'VAT',
          fields: [
            {
              name: 'productVATRate',
              type: 'number',
              label: 'Product VAT rate (%)',
              defaultValue: 11,
              min: 0,
              max: 100,
              required: true
            },
            {
              name: 'deliveryVATRate',
              type: 'number',
              label: 'Delivery VAT rate (%)',
              defaultValue: 21,
              min: 0,
              max: 100,
              required: true
            }
          ]
        }
      ]
    }
  ]
};
