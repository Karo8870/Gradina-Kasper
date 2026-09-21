import { AccountOrderList } from '@/components/account/order-list';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getCMS } from '@/lib/cms';
import { staticMetadata } from '@/lib/static-metadata';

export default async function AccountOrdersPage() {
  const [payload, user] = await Promise.all([getCMS(), getCurrentUser()]);

  if (!user) return null;

  const { docs } = await payload.find({
    collection: 'orders',
    depth: 0,
    overrideAccess: false,
    pagination: false,
    sort: '-createdAt',
    user
  });

  return <AccountOrderList orders={docs} />;
}

export const metadata = staticMetadata(
  'Comenzi',
  'Vezi comenzile și plățile asociate contului tău.',
  '/account/orders',
  { noIndex: true }
);
