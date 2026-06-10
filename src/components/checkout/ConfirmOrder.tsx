'use client';

import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

type ConfirmStatusResponse = {
  status: 'succeeded' | 'pending' | 'failed' | 'cancelled' | 'expired' | string;
  orderID?: string | number;
  accessToken?: string;
};

export function ConfirmOrder() {
  const [message, setMessage] = useState('Verificăm plata...');
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasRedirected = useRef(false);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const transactionID = searchParams.get('transactionID');
    const identifier = orderId
      ? `orderId=${encodeURIComponent(orderId)}`
      : transactionID
        ? `transactionID=${encodeURIComponent(transactionID)}`
        : '';

    if (!identifier) {
      setMessage('Nu am putut identifica plata.');
      return;
    }

    let cancelled = false;
    let attempts = 0;

    const checkOrder = async () => {
      attempts += 1;

      const response = await fetch(
        `/checkout/confirm-order/status?${identifier}`,
        {
          credentials: 'include'
        }
      );
      const data = (await response.json()) as ConfirmStatusResponse;

      if (cancelled || hasRedirected.current) return;

      if (data.status === 'succeeded' && data.orderID) {
        hasRedirected.current = true;

        const params = new URLSearchParams();
        if (data.accessToken) params.set('accessToken', data.accessToken);

        router.replace(
          `/orders/${data.orderID}${params.toString() ? `?${params}` : ''}`
        );
        return;
      }

      if (['failed', 'cancelled', 'expired'].includes(data.status)) {
        setMessage('Plata nu a fost finalizată. Te rugăm să încerci din nou.');
        return;
      }

      setMessage('Plata este în procesare...');

      if (attempts < 30) {
        window.setTimeout(checkOrder, 2000);
        return;
      }

      setMessage(
        'Plata este încă în procesare. Te rugăm să revii peste câteva momente.'
      );
    };

    void checkOrder();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <div className='text-center w-full flex flex-col items-center justify-start gap-4'>
      <h1 className='text-2xl'>{message}</h1>

      <LoadingSpinner className='w-12 h-6' />
    </div>
  );
}
