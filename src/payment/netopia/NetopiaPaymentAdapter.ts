import type { PaymentAdapter } from '@payloadcms/plugin-ecommerce/types';
import { NetopiaIPN } from '@/payment/netopia/NetopiaIPN';
import { initiateNetopiaPayment } from '@/payment/netopia/InitiateNetopiaPayment';

export const netopiaPaymentAdapter: PaymentAdapter = {
  name: 'netopia',
  label: 'netopia',
  initiatePayment: initiateNetopiaPayment,
  confirmOrder: () => {
    return {
      message: 'Order confirmed successfully',
      orderID: 4,
      transactionID: 3
      // Include any additional data required for the payment method here
    };
  },
  endpoints: [
    {
      method: 'post',
      handler: NetopiaIPN,
      path: 'ipn'
    }
  ],
  group: {
    name: 'netopia',
    type: 'group',
    admin: {
      condition: (data) => {
        const path = 'paymentMethod';

        return data?.[path] === 'netopia';
      }
    },
    fields: [
      {
        name: 'ntpID',
        type: 'text',
        label: 'Netopia NTP ID'
      },
      {
        name: 'tempOrderID',
        type: 'text',
        label: 'Temporary order ID'
      },
      {
        name: 'fulfillmentMethod',
        type: 'select',
        label: 'Fulfillment method',
        options: [
          {
            label: 'Delivery',
            value: 'delivery'
          },
          {
            label: 'Pickup',
            value: 'pickup'
          }
        ]
      },
      {
        name: 'shippingAddress',
        type: 'json',
        label: 'Shipping address'
      },
      {
        name: 'shouldBeDeliveredOn',
        type: 'date',
        label: 'Should be delivered on',
        admin: {
          date: {
            pickerAppearance: 'dayOnly'
          }
        }
      }
    ]
  }
};
