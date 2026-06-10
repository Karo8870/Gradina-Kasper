import type { PayloadRequest } from 'payload';
import { netopiaConfig } from '@/payment/netopia/creds';
import { finalizeNetopiaOrder } from '@/payment/netopia/FinalizeNetopiaOrder';

const findDeep = (value: unknown, keys: string[]): unknown => {
  if (!value || typeof value !== 'object') return undefined;

  for (const key of keys) {
    if (key in value) return (value as Record<string, unknown>)[key];
  }

  for (const nested of Object.values(value)) {
    const found = findDeep(nested, keys);
    if (found !== undefined) return found;
  }

  return undefined;
};

const getStatus = (value: unknown) => {
  const status = findDeep(value, ['status']);
  const parsed = Number(status);

  return Number.isFinite(parsed) ? parsed : undefined;
};

const isPaidStatus = (status: number | undefined) => {
  return status === 3 || status === 5;
};

const toTransactionStatus = (status: number | undefined) => {
  if (isPaidStatus(status)) return 'succeeded';
  if (status === 12) return 'failed';
  return 'pending';
};

const verifyNetopiaStatus = async ({
  ntpID,
  orderID
}: {
  ntpID?: string;
  orderID?: string;
}) => {
  const response = await fetch(
    `${netopiaConfig.NETOPIA_BASE_URL.replace(/\/+$/, '')}/operation/status`,
    {
      method: 'POST',
      headers: {
        Authorization: netopiaConfig.NETOPIA_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ntpID,
        orderID,
        posSignature: netopiaConfig.NETOPIA_POS_SIGNATURE
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Netopia status verification failed: ${response.status}`);
  }

  return response.json();
};

export async function NetopiaIPN(req: PayloadRequest) {
  const body = await req.json?.();

  console.log('callback called', req.text, body);

  const orderID = body.order.orderID;
  const ntpID = body.payment.ntpID;
  const payload = req.payload;

  if (!orderID && !ntpID) {
    return Response.json(
      { ok: false, message: 'Missing Netopia identifiers' },
      { status: 400 }
    );
  }

  const transactions = await payload.find({
    collection: 'transactions',
    limit: 1,
    where:
      orderID && ntpID
        ? {
            or: [
              {
                'netopia.ntpID': {
                  equals: String(ntpID)
                }
              },
              {
                'netopia.tempOrderID': {
                  equals: String(orderID)
                }
              }
            ]
          }
        : ntpID
          ? {
              'netopia.ntpID': {
                equals: String(ntpID)
              }
            }
          : {
              'netopia.tempOrderID': {
                equals: String(orderID)
              }
            }
  });

  const transaction = transactions.docs[0] as any;

  if (!transaction) {
    return Response.json(
      { ok: false, message: 'Transaction not found' },
      { status: 404 }
    );
  }

  const verifiedStatus = await verifyNetopiaStatus({
    ntpID: String(ntpID || transaction.netopia?.ntpID || ''),
    orderID: String(orderID || transaction.netopia?.tempOrderID || '')
  });
  const status = getStatus(verifiedStatus);

  const updatedTransaction = (await payload.update({
    id: transaction.id,
    collection: 'transactions',
    data: {
      status: toTransactionStatus(status),
      netopia: {
        ...(transaction.netopia || {})
      }
    },
    overrideAccess: true,
    req
  })) as any;

  const finalizedOrder = isPaidStatus(status)
    ? await finalizeNetopiaOrder({
        req,
        transactionID: updatedTransaction.id
      })
    : null;

  return Response.json({
    ok: true,
    paid: isPaidStatus(status),
    orderID: finalizedOrder?.orderID,
    status
  });
}
