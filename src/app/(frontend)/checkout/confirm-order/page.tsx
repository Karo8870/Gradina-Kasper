import { redirect } from 'next/navigation';

import { PaymentStatus } from '@/components/checkout/payment-status';
import { getCurrentUser } from '@/lib/auth/current-user';
import { staticMetadata } from '@/lib/static-metadata';

export default async function ConfirmOrderPage({
  searchParams
}: {
  searchParams: Promise<{ transaction?: string | string[] }>;
}) {
  const [user, query] = await Promise.all([getCurrentUser(), searchParams]);
  if (!user) redirect('/login?redirect=/checkout');

  const transactionValue = Array.isArray(query.transaction)
    ? query.transaction[0]
    : query.transaction;
  const transactionID = Number(transactionValue);

  if (!Number.isInteger(transactionID) || transactionID <= 0) {
    redirect('/checkout');
  }

  return (
    <div className='mx-auto w-full max-w-7xl px-4 py-16 sm:px-6'>
      <PaymentStatus transactionID={transactionID} />
    </div>
  );
}

export const metadata = staticMetadata(
  'Confirmare plată',
  'Verifică starea plății NETOPIA.',
  '/checkout/confirm-order',
  { noIndex: true }
);
