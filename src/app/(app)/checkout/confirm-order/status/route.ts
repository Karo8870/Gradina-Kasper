import configPromise from '@payload-config';
import { getPayload } from 'payload';

export const dynamic = 'force-dynamic';

const getID = (value: unknown): string | number | undefined => {
  if (!value) return undefined;

  if (typeof value === 'object' && 'id' in value) {
    return value.id as string | number;
  }

  return value as string | number;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('orderId');
  const transactionID = searchParams.get('transactionID');

  if (!orderId && !transactionID) {
    return Response.json(
      {
        status: 'missing_identifier'
      },
      { status: 400 }
    );
  }

  const payload = await getPayload({ config: configPromise });
  const transactions = await payload.find({
    collection: 'transactions' as any,
    depth: 1,
    limit: 1,
    overrideAccess: true,
    where: orderId
      ? {
          'netopia.tempOrderID': {
            equals: orderId
          }
        }
      : {
          id: {
            equals: transactionID
          }
        }
  });
  const transaction = transactions.docs[0] as any;

  if (!transaction) {
    return Response.json({
      status: 'pending'
    });
  }

  const order = transaction.order;
  const orderID = getID(order);

  if (orderID) {
    return Response.json({
      status: 'succeeded',
      orderID,
      accessToken:
        typeof order === 'object' && 'accessToken' in order
          ? order.accessToken
          : undefined
    });
  }

  return Response.json({
    status: transaction.status || 'pending'
  });
}
