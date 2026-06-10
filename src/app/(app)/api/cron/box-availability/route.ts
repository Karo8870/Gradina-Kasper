import { sendBoxAvailableEmail } from '@/lib/orderEmails';
import type { Product, User } from '@/payload-types';
import config from '@payload-config';
import { getPayload } from 'payload';

const isBoxAvailable = (box: Product) => {
  if (box.hideProduct || box.disableProduct) return false;
  if (box.inventory <= 0) return false;

  const now = new Date();
  const availableFrom = new Date(box.availableFrom);
  const availableUntil = new Date(box.availableUntil);

  return availableFrom <= now && availableUntil >= now;
};

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const payload = await getPayload({ config });
  const notifications = await payload.find({
    collection: 'box-notifications' as any,
    depth: 2,
    limit: 1000,
    overrideAccess: true,
    where: {
      sentAt: {
        exists: false
      }
    }
  });
  const sentIDs: number[] = [];

  for (const notification of notifications.docs as any[]) {
    const box =
      notification.box && typeof notification.box === 'object'
        ? (notification.box as Product)
        : null;
    const user =
      notification.user && typeof notification.user === 'object'
        ? (notification.user as User)
        : null;

    if (!box || !user?.email || !isBoxAvailable(box)) {
      continue;
    }

    await sendBoxAvailableEmail({
      box,
      payload,
      to: user.email
    });

    await payload.update({
      collection: 'box-notifications' as any,
      id: notification.id,
      data: {
        sentAt: new Date().toISOString()
      },
      overrideAccess: true
    });

    sentIDs.push(notification.id);
  }

  return Response.json({
    checked: notifications.totalDocs,
    sent: sentIDs.length,
    sentIDs
  });
}
