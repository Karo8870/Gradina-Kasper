'use server';

import { getSession } from '@/lib/api/auth';
import { createOrderWithPayment } from '@/lib/api/orders-with-payment';
import { redirect } from 'next/navigation';

export interface PaymentActionResult {
  success: boolean;
  error?: string;
  paymentURL?: string;
  totalAmount?: number;
  orderItems?: any[];
}

export async function createOrderAndInitiatePayment(
  products: { id: number; quantity: number }[],
  userData: {
    afm: string;
    countyID: number;
    district: string;
    phone1: string;
    phone2: string;
    fax: string;
    email: string;
    name: string;
    address: string;
    zip: string;
  },
  paymentMethod: string
): Promise<PaymentActionResult> {
  try {
    // Check authentication
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    userData.email = 'cazacuchristian@gmail.com';

    // Validate required fields
    if (!products || !userData || !Array.isArray(products) || products.length === 0) {
      return { success: false, error: 'Missing required fields or empty basket' };
    }

    // Validate required user data fields
    const requiredFields = ['email', 'name'];
    for (const field of requiredFields) {
      if (!userData[field as keyof typeof userData]) {
        return { success: false, error: `Missing required field: ${field}` };
      }
    }

    // Validate products have positive quantities
    for (const product of products) {
      if (!product.id || product.quantity <= 0) {
        return { success: false, error: 'Invalid product data' };
      }
    }

    console.log('Creating order with payment for user:', session.uid);
    console.log('Products:', products);
    console.log('Payment method:', paymentMethod);

    // Create order and initiate payment  
    const result = await createOrderWithPayment({
      products,
      userData
    });

    if (!result.success) {
      return { success: false, error: result.error || 'Failed to create order' };
    }

    console.log('Order created successfully:', {
      totalAmount: result.totalAmount,
      itemCount: result.orderItems?.length
    });

    // Return payment URL for client-side redirect
    return {
      success: true,
      paymentURL: result.paymentResponse.paymentURL,
      totalAmount: result.totalAmount,
      orderItems: result.orderItems
    };

  } catch (error) {
    console.error('Payment action error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
}

export async function processPaymentForm(formData: FormData) {
  'use server';
  
  try {
    const products = JSON.parse(formData.get('products') as string);
    const userData = JSON.parse(formData.get('userData') as string);
    const paymentMethod = formData.get('paymentMethod') as string;

    const result = await createOrderAndInitiatePayment(products, userData, paymentMethod);
    
    if (!result.success) {
      // Redirect back to payment page with error
      redirect(`/checkout/payment?error=${encodeURIComponent(result.error || 'Payment failed')}`);
    }

    // If we have a payment URL, redirect to it
    if (result.paymentURL) {
      redirect(result.paymentURL);
    }

  } catch (error) {
    console.error('Process payment form error:', error);
    redirect(`/checkout/payment?error=${encodeURIComponent('Payment processing failed')}`);
  }
}