import { PackageOpen, ReceiptText } from 'lucide-react';
import Link from 'next/link';

import {
  formatOrderDate,
  formatOrderMoney,
  orderStatusLabels
} from '@/commerce/order-display';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import type { Order } from '@/payload-types';

export function AccountOrderList({ orders }: { orders: Order[] }) {
  return (
    <div className='flex max-w-3xl flex-col gap-6'>
      <header className='flex flex-col gap-2'>
        <h1 className='text-2xl font-semibold'>Comenzile mele</h1>
        <p className='text-muted-foreground text-sm'>
          Vezi comenzile, totalurile și starea plăților tale.
        </p>
      </header>

      {!orders.length ? (
        <Card className='text-center'>
          <CardHeader>
            <div className='bg-muted mx-auto flex size-14 items-center justify-center rounded-full'>
              <PackageOpen className='size-6' />
            </div>
            <CardTitle>Nu ai nicio comandă</CardTitle>
            <CardDescription>
              Comenzile confirmate vor apărea aici.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button nativeButton={false} render={<Link href='/products' />}>
              Vezi produsele
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className='flex flex-col gap-3'>
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className='flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex items-start gap-3'>
                  <div className='bg-muted flex size-10 shrink-0 items-center justify-center rounded-full'>
                    <ReceiptText className='size-5' />
                  </div>
                  <div>
                    <p className='font-semibold'>Comanda #{order.id}</p>
                    <p className='text-muted-foreground text-sm'>
                      {formatOrderDate(order.createdAt)} ·{' '}
                      {orderStatusLabels[order.status ?? 'processing']}
                    </p>
                  </div>
                </div>
                <div className='flex items-center justify-between gap-4 sm:justify-end'>
                  <span className='font-semibold'>
                    {formatOrderMoney(order.amount)}
                  </span>
                  <Button
                    nativeButton={false}
                    render={<Link href={`/account/orders/${order.id}`} />}
                    variant='outline'
                  >
                    Detalii
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
