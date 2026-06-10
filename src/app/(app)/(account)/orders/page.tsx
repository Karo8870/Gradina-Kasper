import type { Order } from '@/payload-types';
import type { Metadata } from 'next';

import { AccountPageShell } from '@/components/account/AccountPageShell';
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph';
import { headers as getHeaders } from 'next/headers';
import configPromise from '@payload-config';
import { getPayload } from 'payload';
import { redirect } from 'next/navigation';
import { OrderItem } from '@/components/OrderItem';

export default async function Orders() {
  const headers = await getHeaders();
  const payload = await getPayload({ config: configPromise });
  const { user } = await payload.auth({ headers });

  let orders: Order[] | null = null;

  if (!user) {
    redirect(
      `/login?warning=${encodeURIComponent('Trebuie să fii autentificat pentru a vedea comenzile.')}`
    );
  }

  try {
    const ordersResult = await payload.find({
      collection: 'orders',
      limit: 0,
      pagination: false,
      user,
      overrideAccess: false,
      where: {
        customer: {
          equals: user?.id
        }
      }
    });

    orders = ordersResult?.docs || [];
  } catch (error) {}

  return (
    <AccountPageShell title='Comenzi'>

      {(!orders || !Array.isArray(orders) || orders?.length === 0) && (
        <p className='text-neutral-700'>Nu ai încă nicio comandă.</p>
      )}

      {orders && orders.length > 0 && (
        <ul className='flex flex-col gap-6'>
          {orders?.map((order) => (
            <li key={order.id}>
              <OrderItem order={order} />
            </li>
          ))}
        </ul>
      )}
    </AccountPageShell>
  );
}

export const metadata: Metadata = {
  description: 'Comenzile tale.',
  openGraph: mergeOpenGraph({
    title: 'Comenzi',
    url: '/orders'
  }),
  title: 'Comenzi'
};
