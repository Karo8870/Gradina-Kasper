import { notFound, redirect } from 'next/navigation';

import { hasRole } from '@/access/users';
import { adminOrderDTO } from '@/components/admin/orders/order-data';
import { OrderAdminDashboard } from '@/components/admin/orders/order-admin-dashboard';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getCMS } from '@/lib/cms';
import { staticMetadata } from '@/lib/static-metadata';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const [payload, user] = await Promise.all([getCMS(), getCurrentUser()]);

  if (!user) redirect('/login?redirect=%2Fadmin%2Forders');
  if (!hasRole(user, 'admin')) notFound();

  const { docs } = await payload.find({
    collection: 'orders',
    depth: 2,
    overrideAccess: false,
    pagination: false,
    sort: '-createdAt',
    user
  });

  return <OrderAdminDashboard initialOrders={docs.map(adminOrderDTO)} />;
}

export const metadata = staticMetadata(
  'Orders administration',
  'View, inspect, filter, and export ecommerce orders.',
  '/admin/orders',
  { noIndex: true }
);
