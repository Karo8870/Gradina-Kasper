import { createPendingOrder, confirmOrderAndReduceStock, cancelPendingOrder } from './orders-safe';
import env from '@/../env.config';
import { getSession } from './auth';
import { getVisibleProducts } from './products';
import { counties } from '../data/counties';
import { createSoftOneClient } from './softone/softone-invoice';

interface OrderData {
  products: {
    id: number;
    quantity: number;
  }[];
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
  };
}

export async function createOrderWithPayment(orderData: OrderData) {
  const session = await getSession();
  
  if (!session) {
    throw new Error('User not authenticated');
  }

  let pendingOrderId: number | null = null;

  try {
    // Step 1: Create pending order (NO stock reduction yet)
    const pendingOrder = await createPendingOrder(orderData);
    pendingOrderId = pendingOrder.orderID;
    
    console.log('Created pending order:', pendingOrderId);

    // Get county name for address
    const county = counties.find(c => c.id === orderData.userData.countyID);
    
    // Prepare payment data
    const paymentData = {
      amount: pendingOrder.totalAmount,
      currency: 'RON',
      description: `Comandă Grădina Kasper #${pendingOrderId}`,
      customerEmail: orderData.userData.email,
      customerFirstName: orderData.userData.name.split(' ')[0] || '',
      customerLastName: orderData.userData.name.split(' ').slice(1).join(' ') || '',
      customerPhone: orderData.userData.phone1,
      customerAddress: orderData.userData.address,
      customerCity: orderData.userData.district || county?.name || '',
      customerCounty: county?.name || '',
      customerPostalCode: orderData.userData.zip,
      orderId: pendingOrderId.toString()
    };

    // Step 2: Try to initiate payment with Netopia via REST API
    console.log('Attempting to initiate payment for order:', pendingOrderId);

    const NETOPIA_BASE = env.NETOPIA_SANDBOX
      ? 'https://secure.sandbox.netopia-payments.com'
      : 'https://secure.netopia-payments.com';

    const payload = {
      config: {
        emailTemplate: 'default',
        notifyUrl: env.NETOPIA_CONFIRM_URL!,
        redirectUrl: env.NETOPIA_RETURN_URL!,
        language: 'ro'
      },
      payment: {
        options: { installments: 1 },
        instrument: { type: 'Card' }
      },
      order: {
        ntpID: '',
        posSignature: env.NETOPIA_SIGNATURE!,
        dateTime: new Date().toISOString(),
        description: `Comandă Grădina Kasper #${pendingOrderId}`,
        orderID: String(pendingOrderId),
        amount: pendingOrder.totalAmount,
        currency: 'RON',
        billing: {
          email: orderData.userData.email,
          phone: orderData.userData.phone1 || '',
          firstName: orderData.userData.name.split(' ')[0] || '',
          lastName: orderData.userData.name.split(' ').slice(1).join(' ') || '',
          city: orderData.userData.district || county?.name || '',
          country: 642,
          state: county?.name || '',
          postalCode: orderData.userData.zip || '',
          details: orderData.userData.address || ''
        },
        shipping: {
          email: orderData.userData.email,
          phone: orderData.userData.phone1 || '',
          firstName: orderData.userData.name.split(' ')[0] || '',
          lastName: orderData.userData.name.split(' ').slice(1).join(' ') || '',
          city: orderData.userData.district || county?.name || '',
          country: 642,
          state: county?.name || '',
          postalCode: orderData.userData.zip || '',
          details: orderData.userData.address || ''
        },
        products: (pendingOrder.orderedProducts || []).map(p => ({
          name: p.name,
          code: String(p.id),
          category: 'produce',
          price: p.price,
          vat: 0
        })),
        installments: { selected: 0, available: [0] },
        data: { orderId: String(pendingOrderId) }
      }
    } as const;

    const resp = await fetch(`${NETOPIA_BASE}/payment/card/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': env.NETOPIA_API_KEY!
      },
      body: JSON.stringify(payload)
    });

    const paymentInitResult = await resp.json();

    const paymentResponse = (paymentInitResult && paymentInitResult.error?.code === '101' && paymentInitResult.payment?.paymentURL)
      ? { success: true, paymentURL: paymentInitResult.payment.paymentURL }
      : { success: false, error: { message: paymentInitResult?.error?.message || 'Payment init failed' } };

    if (!paymentResponse.success) {
      // Payment initiation failed - clean up pending order
      console.log('Payment initiation failed, cleaning up pending order:', pendingOrderId);
      await cancelPendingOrder(pendingOrderId);
      
      return {
        success: false,
        error: paymentResponse.error?.message || 'Nu s-a putut inițializa plata. Încercați din nou.',
        totalAmount: pendingOrder.totalAmount,
        orderItems: pendingOrder.orderedProducts,
        paymentResponse
      };
    }

    // Step 3: Payment initiation successful - now reduce stock
    console.log('Payment initiation successful, reducing stock for order:', pendingOrderId);
    await confirmOrderAndReduceStock(pendingOrderId);

    // Step 4: Create SoftOne client entry
    const hasCode = orderData.userData.afm !== '';
    const hasRO = orderData.userData.afm.toLowerCase().includes('ro');
    const afm = orderData.userData.afm.replace('ro', '').replace('RO', '');

    await createSoftOneClient({
      afm,
      vatsts: hasRO ? '1' : '0',
      efactura: hasCode ? '0' : '1', 
      cmpmode: hasCode ? '501' : '11',
      trdcategory: hasCode ? (hasRO ? '3000' : '3001') : '3099',
      bgbulstat: hasRO ? 'RO' : '',
      phone1: orderData.userData.phone1,
      phone2: orderData.userData.phone2,
      fax: orderData.userData.fax,
      email: orderData.userData.email,
      name: orderData.userData.name,
      zip: orderData.userData.zip,
      address: orderData.userData.address,
      district1: orderData.userData.countyID.toString(),
      district: orderData.userData.countyID === 10 ? orderData.userData.district : '',
      city: county?.name || '',
      webpage: '',
      num01: pendingOrderId.toString(),
      jobtypetrd: 'J08/12345/2021'
    });
    
    return {
      success: true,
      totalAmount: pendingOrder.totalAmount,
      orderItems: pendingOrder.orderedProducts,
      paymentResponse,
      orderId: pendingOrderId
    };

  } catch (error) {
    console.error('Error in createOrderWithPayment:', error);
    
    // Clean up any pending order if something went wrong
    if (pendingOrderId) {
      try {
        await cancelPendingOrder(pendingOrderId);
        console.log('Cleaned up pending order after error:', pendingOrderId);
      } catch (cleanupError) {
        console.error('Error cleaning up pending order:', cleanupError);
      }
    }
    
    throw error;
  }
}

