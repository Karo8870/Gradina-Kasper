import { notFound } from 'next/navigation';

import { AccountOrderDetail } from '@/components/account/order-detail';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getCMS } from '@/lib/cms';
import { staticMetadata } from '@/lib/static-metadata';

export default async function AccountOrderPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, payload, user] = await Promise.all([
    params,
    getCMS(),
    getCurrentUser()
  ]);
  const orderID = Number(id);

  if (!user) return null;
  if (!Number.isSafeInteger(orderID) || orderID <= 0) notFound();

  const order = await payload
    .findByID({
      collection: 'orders',
      id: orderID,
      depth: 0,
      overrideAccess: false,
      user
    })
    .catch(() => null);

  if (!order) notFound();

  const { docs: transactions } = await payload.find({
    collection: 'transactions',
    depth: 0,
    overrideAccess: false,
    pagination: false,
    sort: '-createdAt',
    user,
    where: {
      order: { equals: orderID }
    }
  });

  return <AccountOrderDetail order={order} transactions={transactions} />;
}

export const metadata = staticMetadata(
  'Detalii comandă',
  'Vezi produsele, livrarea și tranzacțiile comenzii tale.',
  '/account/orders',
  { noIndex: true }
);
