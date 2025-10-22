import { Netopia } from 'netopia-card';
import env from '@/../env.config';

export const netopiaClient = new Netopia({
  apiKey: env.NETOPIA_API_KEY!,
  sandbox: true,
  notifyUrl: env.NETOPIA_CONFIRM_URL!,
  redirectUrl: env.NETOPIA_RETURN_URL!,
  language: 'ro',
});

export interface NetopiaPaymentData {
  amount: number; // in RON
  currency: string;
  description: string;
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  customerCounty: string;
  customerPostalCode: string;
  orderId: string;
}

export interface NetopiaPaymentResponse {
  success: boolean;
  paymentURL?: string;
  ntpID?: string;
  error?: {
    code: string;
    message: string;
  };
}