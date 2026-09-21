import { notFound } from 'next/navigation';

import { AccountOrderDetail } from '@/components/account/order-detail';
import { FormStatus } from '@/components/form-components';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getSearchParam } from '@/lib/auth/utils';
import { getCMS } from '@/lib/cms';
import { staticMetadata } from '@/lib/static-metadata';

export default async function AccountOrderPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ id }, query, payload, user] = await Promise.all([
    params,
    searchParams,
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

  const success = getSearchParam(query, 'success');

  return (
    <div className='flex flex-col gap-6'>
      {success ? <FormStatus kind='success'>{success}</FormStatus> : null}
      <AccountOrderDetail order={order} transactions={transactions} />
    </div>
  );
}

export const metadata = staticMetadata(
  'Detalii comandă',
  'Vezi produsele, livrarea și tranzacțiile comenzii tale.',
  '/account/orders',
  { noIndex: true }
);
