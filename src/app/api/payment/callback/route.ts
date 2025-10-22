import { NextRequest, NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { rollbackStockReduction } from '@/lib/api/orders-safe';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status');
  const orderId = searchParams.get('orderId');
  const ntpID = searchParams.get('ntpID');

  console.log('Payment callback received:', {
    status,
    orderId,
    ntpID,
    allParams: Object.fromEntries(searchParams.entries())
  });

  // Based on the status parameter, redirect to appropriate page
  if (status === 'success' || status === 'confirmed') {
    // Payment successful
    const completedUrl = new URL('/checkout/completed', request.nextUrl.origin);
    if (orderId) completedUrl.searchParams.set('orderId', orderId);
    if (ntpID) completedUrl.searchParams.set('ntpID', ntpID);
    
    return NextResponse.redirect(completedUrl);
  } else if (status === 'failed' || status === 'cancelled') {
    // Payment failed or cancelled - rollback stock
    if (orderId) {
      try {
        const orderIdNum = parseInt(orderId);
        if (!isNaN(orderIdNum)) {
          await rollbackStockReduction(orderIdNum, false);
          console.log('Stock rollback completed for cancelled payment, order:', orderIdNum);
        }
      } catch (error) {
        console.error('Error rolling back stock for cancelled payment:', error);
      }
    }
    
    const paymentUrl = new URL('/checkout/payment', request.nextUrl.origin);
    paymentUrl.searchParams.set('error', 'payment_cancelled');
    if (orderId) paymentUrl.searchParams.set('orderId', orderId);
    
    return NextResponse.redirect(paymentUrl);
  } else {
    // Unknown status - also rollback stock to be safe
    if (orderId) {
      try {
        const orderIdNum = parseInt(orderId);
        if (!isNaN(orderIdNum)) {
          await rollbackStockReduction(orderIdNum, false);
          console.log('Stock rollback completed for unknown status, order:', orderIdNum);
        }
      } catch (error) {
        console.error('Error rolling back stock for unknown status:', error);
      }
    }
    
    const paymentUrl = new URL('/checkout/payment', request.nextUrl.origin);
    paymentUrl.searchParams.set('error', 'payment_error');
    
    return NextResponse.redirect(paymentUrl);
  }
}

export async function POST(request: NextRequest) {
  // Handle POST callbacks if needed
  return GET(request);
}