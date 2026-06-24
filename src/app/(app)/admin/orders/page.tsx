import { OrdersAdminPanel } from '@/components/admin/OrdersAdminPanel';
import { checkRole } from '@/access/utilities';
import config from '@payload-config';
import { headers as getHeaders } from 'next/headers';
import { redirect } from 'next/navigation';
import { getPayload } from 'payload';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export const metadata = {
  title: 'Admin - Orders'
};

export default async function Page() {
  const payload = await getPayload({ config });
  const headers = await getHeaders();
  const { user } = await payload.auth({ headers });

  if (!user) {
    redirect('/login?redirect=/admin/orders');
  }

  if (!checkRole(['admin'], user)) {
    redirect('/');
  }

  return (
    <div className='bg-secondary-50/50 pt-24 min-h-screen py-8'>
      <div className='container space-y-6'>
        <div className='border-primary-100 rounded-[2rem] border bg-white p-6 shadow-sm'>
          <p className='text-primary-700 text-xs font-semibold tracking-[0.2em] uppercase'>
            Admin
          </p>
          <h1 className='text-primary-900 mt-2 text-3xl font-bold tracking-tight'>
            Comenzi
          </h1>
          <p className='mt-2 max-w-2xl text-sm text-neutral-600'>
            Vezi comenzile, filtrează pe intervale de timp și pregătește cutiile
            dintr-un ecran care se potrivește cu restul site-ului.
          </p>
        </div>

        <OrdersAdminPanel />
      </div>
    </div>
  );
}
