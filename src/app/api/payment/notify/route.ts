import { NextRequest, NextResponse } from 'next/server';
import { validateNetopiaSignature, isPaymentSuccessful, NetopiaNotificationData } from '@/lib/api/netopia/netopia-payments';
import { rollbackStockReduction } from '@/lib/api/orders-safe';
import { db } from '@/db/db';
import { orders } from '@/db/schema/orders';
import { eq, sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // Get raw body text for signature validation
    const rawBody = await request.text();
    
    let notificationData: NetopiaNotificationData;
    try {
      // For Netopia, the notification might be XML or form-encoded
      // Try to parse as JSON first, then handle other formats
      if (rawBody.startsWith('{')) {
        notificationData = JSON.parse(rawBody);
      } else {
        // Handle form-encoded or XML data
        const parsedData = parseNetopiaIPN(rawBody);
        if (!parsedData) {
          throw new Error('Failed to parse IPN data');
        }
        notificationData = parsedData as any;
      }
    } catch (parseError) {
      console.error('Failed to parse notification data:', parseError);
      return NextResponse.json({ errorCode: 1, message: 'Invalid notification format' }, { status: 400 });
    }

    console.log('Netopia notification received:', {
      orderID: notificationData.orderID,
      status: notificationData.status,
      errorCode: notificationData.errorCode,
      amount: notificationData.amount
    });

    // Validate signature
    if (!validateNetopiaSignature(notificationData)) {
      console.error('Invalid Netopia signature');
      return NextResponse.json({ errorCode: 1, message: 'Invalid signature' }, { status: 400 });
    }

    const orderId = parseInt(notificationData.orderID);
    if (isNaN(orderId)) {
      console.error('Invalid order ID:', notificationData.orderID);
      return NextResponse.json({ errorCode: 1, message: 'Invalid order ID' }, { status: 400 });
    }

    // Find the order in the database
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      console.error('Order not found:', orderId);
      return NextResponse.json({ errorCode: 1, message: 'Order not found' }, { status: 404 });
    }

    // Check if payment was successful
    if (isPaymentSuccessful(notificationData)) {
      console.log('Payment successful for order:', orderId);
      
      // Update order status to confirmed (payment successful)
      await db
        .update(orders)
        .set({
          items: sql`jsonb_set(items, '{0,status}', '"confirmed"')`
        })
        .where(eq(orders.id, orderId));

      console.log('Order status updated to confirmed for order:', orderId);
      
      // You might want to trigger email notifications here
      // await sendOrderConfirmationEmail(order);
      
      return NextResponse.json({ errorCode: 0, message: 'Payment confirmed' });
    } else {
      console.log('Payment failed for order:', {
        orderId,
        errorCode: notificationData.errorCode,
        errorMessage: notificationData.errorMessage
      });
      
      // Payment failed - rollback stock reduction
      try {
        // Call rollback without auth requirement (webhook context)
        await rollbackStockReduction(orderId, false);
        console.log('Stock rollback completed for failed payment, order:', orderId);
      } catch (rollbackError) {
        console.error('Error rolling back stock for order:', orderId, rollbackError);
        // Continue processing even if rollback fails to avoid webhook retry loops
      }
      
      return NextResponse.json({ errorCode: 0, message: 'Payment failure processed, stock restored' });
    }

  } catch (error) {
    console.error('Netopia notification processing error:', error);
    return NextResponse.json({ errorCode: 1, message: 'Internal server error' }, { status: 500 });
  }
}