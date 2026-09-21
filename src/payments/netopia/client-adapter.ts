import type { PaymentAdapterClient } from '@payloadcms/plugin-ecommerce/types';

export const netopiaPaymentAdapterClient: PaymentAdapterClient = {
  confirmOrder: false,
  initiatePayment: true,
  label: 'NETOPIA Payments',
  name: 'netopia'
};
