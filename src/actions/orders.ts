'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { hasRole } from '@/access/users';
import { orderStatuses } from '@/commerce/order-activity';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getCMS } from '@/lib/cms';

const orderIDSchema = z.number().int().positive();
const updateStatusSchema = z.object({
  orderID: orderIDSchema,
  status: z.enum(orderStatuses)
});
const bulkUpdateStatusSchema = z.object({
  orderIDs: z.array(orderIDSchema).min(1),
  status: z.enum(orderStatuses)
});
// Customer order cancellation is disabled.
// const cancelOrderSchema = z.object({ orderID: orderIDSchema });

export type OrderActionResult =
  { success: true } | { message: string; success: false };

export async function updateOrderStatus(input: {
  orderID: number;
  status: (typeof orderStatuses)[number];
}): Promise<OrderActionResult> {
  const parsed = updateStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { message: 'Invalid order status request.', success: false };
  }

  const [payload, user] = await Promise.all([getCMS(), getCurrentUser()]);
  if (!user || !hasRole(user, 'admin')) {
    return { message: 'You are not allowed to update orders.', success: false };
  }

  const order = await payload
    .findByID({
      collection: 'orders',
      depth: 0,
      id: parsed.data.orderID,
      overrideAccess: false,
      user
    })
    .catch(() => null);

  if (!order) return { message: 'Order not found.', success: false };
  if (order.status === parsed.data.status) return { success: true };

  try {
    await payload.update({
      collection: 'orders',
      context: { orderActivitySource: 'admin' },
      data: { status: parsed.data.status },
      id: order.id,
      overrideAccess: false,
      user
    });
  } catch (error) {
    payload.logger.error({
      err: error,
      msg: `Failed to update order ${order.id} status.`
    });
    return {
      message: 'The order status could not be updated.',
      success: false
    };
  }

  revalidatePath('/admin/orders');
  revalidatePath(`/account/orders/${order.id}`);
  revalidatePath('/account/orders');

  return { success: true };
}

export async function bulkUpdateOrderStatus(input: {
  orderIDs: number[];
  status: (typeof orderStatuses)[number];
}): Promise<{
  failed: number;
  message?: string;
  success: boolean;
  unchanged: number;
  updated: number;
}> {
  const parsed = bulkUpdateStatusSchema.safeParse(input);
  if (!parsed.success) {
    return {
      failed: 0,
      message: 'Select at least one order and a valid status.',
      success: false,
      unchanged: 0,
      updated: 0
    };
  }

  const [payload, user] = await Promise.all([getCMS(), getCurrentUser()]);
  if (!user || !hasRole(user, 'admin')) {
    return {
      failed: 0,
      message: 'You are not allowed to update orders.',
      success: false,
      unchanged: 0,
      updated: 0
    };
  }

  const orderIDs = [...new Set(parsed.data.orderIDs)];
  let updated = 0;
  let unchanged = 0;
  let failed = 0;

  for (const orderID of orderIDs) {
    const order = await payload
      .findByID({
        collection: 'orders',
        depth: 0,
        id: orderID,
        overrideAccess: false,
        user
      })
      .catch(() => null);

    if (!order) {
      failed++;
      continue;
    }
    if (order.status === parsed.data.status) {
      unchanged++;
      continue;
    }

    try {
      await payload.update({
        collection: 'orders',
        context: { orderActivitySource: 'admin' },
        data: { status: parsed.data.status },
        id: orderID,
        overrideAccess: false,
        user
      });
      updated++;
      revalidatePath(`/account/orders/${orderID}`);
    } catch (error) {
      failed++;
      payload.logger.error({
        err: error,
        msg: `Failed to bulk update order ${orderID} status.`
      });
    }
  }

  if (updated) {
    revalidatePath('/admin/orders');
    revalidatePath('/account/orders');
  }

  return {
    failed,
    message: failed
      ? `${failed} ${failed === 1 ? 'order could' : 'orders could'} not be updated.`
      : undefined,
    success: failed === 0,
    unchanged,
    updated
  };
}

/* Customer order cancellation is disabled; admins can still update order statuses.
export async function cancelOrder(input: {
  orderID: number;
}): Promise<OrderActionResult> {
  const parsed = cancelOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { message: 'Cererea de anulare nu este validă.', success: false };
  }

  const [payload, user] = await Promise.all([getCMS(), getCurrentUser()]);
  if (!user) {
    return { message: 'Trebuie să fii autentificat.', success: false };
  }

  const order = await payload
    .findByID({
      collection: 'orders',
      depth: 0,
      id: parsed.data.orderID,
      overrideAccess: false,
      user
    })
    .catch(() => null);

  const customerID =
    order?.customer && typeof order.customer === 'object'
      ? order.customer.id
      : order?.customer;

  if (!order || customerID !== user.id) {
    return { message: 'Comanda nu a fost găsită.', success: false };
  }

  if (!canCancelOrder(order)) {
    return {
      message:
        'Comanda poate fi anulată doar cât timp este în procesare și cu cel puțin o zi înainte de livrare sau ridicare.',
      success: false
    };
  }

  const result = await payload
    .update({
      collection: 'orders',
      context: { orderActivitySource: 'customer' },
      data: { status: 'cancelled' },
      depth: 0,
      overrideAccess: true,
      user,
      where: {
        and: [
          { id: { equals: order.id } },
          { customer: { equals: user.id } },
          { status: { equals: 'processing' } }
        ]
      }
    })
    .catch((error: unknown) => {
      payload.logger.error({
        err: error,
        msg: `Failed to cancel order ${order.id}.`
      });
      return null;
    });

  if (!result?.docs.length) {
    return {
      message:
        'Starea comenzii s-a schimbat. Reîncarcă pagina și încearcă din nou.',
      success: false
    };
  }

  revalidatePath(`/account/orders/${order.id}`);
  revalidatePath('/account/orders');
  revalidatePath('/admin/orders');

  return { success: true };
}
*/
