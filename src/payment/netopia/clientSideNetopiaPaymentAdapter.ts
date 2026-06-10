import { PaymentAdapterClient } from '@payloadcms/plugin-ecommerce/types';

export const clientSideNetopiaPaymentAdapter: PaymentAdapterClient = {
  name: 'netopia',
  label: 'netopia',
  initiatePayment: true,
  confirmOrder: true
};
