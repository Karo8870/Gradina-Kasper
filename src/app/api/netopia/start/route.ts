import { NextRequest, NextResponse } from 'next/server';
import env from '@/../env.config';
import { getSession } from '@/lib/api/auth';

const NETOPIA_BASE = process.env.NODE_ENV === 'production'
  ? 'https://secure.netopia-payments.com'
  : 'https://secure.sandbox.netopia-payments.com';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      orderId,
      amount,
      currency = 'RON',
      billing
    } = body || {};

    if (!orderId || !amount) {
      return NextResponse.json({ error: 'Missing orderId or amount' }, { status: 400 });
    }

    const payload = {
      config: {
        emailTemplate: 'default',
        notifyUrl: env.NETOPIA_CONFIRM_URL!,
        redirectUrl: env.NETOPIA_RETURN_URL!,
        language: 'ro'
      },
      payment: {
        options: { installments: 1 },
        instrument: { type: 'Card' },
        data: {
          BROWSER_USER_AGENT: request.headers.get('user-agent') || '',
          IP_ADDRESS: request.headers.get('x-forwarded-for') || ''
        }
      },
      order: {
        ntpID: '',
        posSignature: env.NETOPIA_SIGNATURE!,
        dateTime: new Date().toISOString(),
        description: `Order #${orderId}`,
        orderID: String(orderId),
        amount: Number(amount),
        currency,
        billing: {
          email: billing?.email || 'unknown@example.com',
          phone: billing?.phone || '',
          firstName: billing?.firstName || '',
          lastName: billing?.lastName || '',
          city: billing?.city || '',
          country: 642,
          state: billing?.state || '',
          postalCode: billing?.postalCode || '',
          details: billing?.details || ''
        },
        shipping: {
          email: billing?.email || 'unknown@example.com',
          phone: billing?.phone || '',
          firstName: billing?.firstName || '',
          lastName: billing?.lastName || '',
          city: billing?.city || '',
          country: 642,
          state: billing?.state || '',
          postalCode: billing?.postalCode || '',
          details: billing?.details || ''
        },
        products: body?.products || [],
        installments: { selected: 0, available: [0] },
        data: body?.orderData || {}
      }
    };

    const resp = await fetch(`${NETOPIA_BASE}/payment/card/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': env.NETOPIA_API_KEY!
      },
      body: JSON.stringify(payload)
    });

    const result = await resp.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Netopia start error:', error);
    return NextResponse.json({ error: 'Failed to initiate payment' }, { status: 500 });
  }
}


