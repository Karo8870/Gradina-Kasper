import type { GlobalConfig } from 'payload';

import { adminOnly } from '@/access/adminOnly';

function validatePrice(value: string | null | undefined | string[]) {
  if (!value || typeof value === 'object') {
    return "Value isn't a valid number with 2 decimal places";
  }

  if (value.match(/^([^0]\d+|0)\.\d{2}$/g)) {
    return true;
  }

  if (parseInt(value) < 0) {
    return 'Price must be positive';
  }

  return "Value isn't a valid number with 2 decimal places";
}

export const CheckoutSettings: GlobalConfig = {
  slug: 'checkout-settings',
  access: {
    read: () => true,
    update: adminOnly
  },
  fields: [
    {
      name: 'deliveryPrice',
      label: 'Delivery price (RON)',
      type: 'text',
      required: true,
      defaultValue: '50.00',
      admin: {
        description: 'The price for delivery in RON using 2 decimal points'
      },
      validate: validatePrice
    },
    {
      name: 'addressDescription',
      label: 'Address description',
      type: 'richText',
      required: true
    }
  ]
};
