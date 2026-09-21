'use client';

import { CheckCircle2, LoaderCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

type PaymentState = 'checking' | 'failed' | 'pending' | 'succeeded';

export function PaymentStatus({ transactionID }: { transactionID: number }) {
  const [state, setState] = useState<PaymentState>('checking');
  const [orderID, setOrderID] = useState<number>();

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    async function check() {
      attempts += 1;
      try {
        const response = await fetch('/api/payments/netopia/status', {
          body: JSON.stringify({ transactionID }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST'
        });
        const result = (await response.json()) as {
          orderID?: number;
          state?: PaymentState;
        };
        if (cancelled) return;

        if (response.ok && result.state === 'succeeded' && result.orderID) {
          setOrderID(result.orderID);
          setState('succeeded');
          localStorage.removeItem('cart');
          localStorage.removeItem('cart_secret');
          window.location.replace(`/account/orders/${result.orderID}`);
          return;
        }
        if (response.ok && result.state === 'failed') {
          setState('failed');
          return;
        }
      } catch {
        // A transient status failure stays pending and can be retried safely.
      }

      if (attempts < 10) {
        setState('checking');
        timeout = setTimeout(() => void check(), 2000);
      } else {
        setState('pending');
      }
    }

    void check();
    return () => {
      cancelled = true;
      if (timeout) clearTimeout(timeout);
    };
  }, [transactionID]);

  const content = {
    checking: {
      description: 'Verificăm confirmarea direct la NETOPIA.',
      icon: <LoaderCircle className='size-8 animate-spin' />,
      title: 'Verificăm plata'
    },
    failed: {
      description:
        'Plata nu a fost aprobată. Produsele nu au fost scăzute din stoc.',
      icon: <XCircle className='size-8' />,
      title: 'Plata nu a reușit'
    },
    pending: {
      description:
        'NETOPIA nu a confirmat încă rezultatul. Comanda va fi creată numai după confirmarea serverului.',
      icon: <LoaderCircle className='size-8' />,
      title: 'Plata este în curs de confirmare'
    },
    succeeded: {
      description: `Comanda #${orderID} a fost creată și stocul a fost actualizat.`,
      icon: <CheckCircle2 className='size-8' />,
      title: 'Plata a fost confirmată'
    }
  }[state];

  return (
    <Card className='mx-auto max-w-xl text-center'>
      <CardHeader>
        <div className='bg-muted mx-auto flex size-16 items-center justify-center rounded-full'>
          {content.icon}
        </div>
        <CardTitle>{content.title}</CardTitle>
        <CardDescription>{content.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button nativeButton={false} render={<Link href='/products' />}>
          Înapoi la produse
        </Button>
      </CardContent>
    </Card>
  );
}
