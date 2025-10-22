import { netopiaClient } from './netopia-client';
import { collectBrowserInfo } from 'netopia-card';

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

export async function startNetopiaPayment(paymentData: NetopiaPaymentData): Promise<NetopiaPaymentResponse> {
  try {
    console.log('Starting Netopia payment with data:', {
      orderId: paymentData.orderId,
      amount: paymentData.amount,
      currency: paymentData.currency
    });

    // Set order data
    netopiaClient.setOrderData({
      amount: paymentData.amount,
      billing: {
        city: paymentData.customerCity,
        country: 642, // Romania country code
        countryName: 'Romania',
        details: paymentData.customerAddress,
        email: paymentData.customerEmail,
        firstName: paymentData.customerFirstName,
        lastName: paymentData.customerLastName,
        phone: paymentData.customerPhone,
        postalCode: paymentData.customerPostalCode,
        state: paymentData.customerCounty,
      },
      currency: paymentData.currency,
      description: paymentData.description,
      orderID: paymentData.orderId,
    });

    // Start payment (method takes no parameters)
    const response = await netopiaClient.startPayment();

    console.log('Netopia response:', response);

    // According to the documentation, a successful response has error.code === '101' and payment.paymentURL
    if (response.error?.code === '101' && response.payment?.paymentURL) {
      return {
        success: true,
        paymentURL: response.payment.paymentURL,
        ntpID: response.payment.ntpID || paymentData.orderId
      };
    } else {
      return {
        success: false,
        error: {
          code: response.error?.code || 'UNKNOWN_ERROR',
          message: response.error?.message || 'Failed to initialize payment'
        }
      };
    }
  } catch (error) {
    console.error('Netopia payment error:', error);
    return {
      success: false,
      error: {
        code: 'PAYMENT_ERROR',
        message: error instanceof Error ? error.message : 'Failed to initialize payment'
      }
    };
  }
}

// Webhook/IPN validation functions
export interface NetopiaNotificationData {
  errorType: string;
  errorCode: string;
  errorMessage: string;
  ntpID: string;
  orderID: string;
  amount: string;
  currency: string;
  processed_amount: string;
  original_amount: string;
  status: string;
  timestamp: string;
  customerID: string;
  customerEmail: string;
  mobilPayTransactionId: string;
  action: string;
  signature: string;
}

export function validateNetopiaSignature(data: NetopiaNotificationData): boolean {
  // Basic validation - in production, implement proper signature validation
  return !!(data.signature && data.ntpID && data.orderID);
}

export function isPaymentSuccessful(notification: NetopiaNotificationData): boolean {
  return notification.errorCode === '0' && (notification.status === 'confirmed' || notification.action === 'confirmed');
}