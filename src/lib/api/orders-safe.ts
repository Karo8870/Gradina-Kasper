import { db } from '@/db/db';
import { orders } from '@/db/schema/orders';
import { products } from '@/db/schema/products';
import { getSession } from '@/lib/api/auth';
import { getVisibleProducts } from '@/lib/api/products';
import { createSoftOneClient } from '@/lib/api/softone/softone-invoice';
import { counties } from '@/lib/data/counties';
import { inArray, sql, SQL } from 'drizzle-orm';

// Utility function for building dynamic CASE statements
function caseArrayStatement<T extends { id: number | string }>(
  variants: Array<T>,
  columnNames: Array<keyof T>
) {
  const caseStatements: { [key in keyof T]: SQL } = {} as never;

  for (const columnName of columnNames) {
    const sqlChunks: SQL[] = [];

    sqlChunks.push(sql`CASE`);
    for (const variant of variants) {
      sqlChunks.push(sql`WHEN id =
      ${variant.id}
      THEN
      ${variant[columnName]}`);
    }
    sqlChunks.push(sql`END`);

    caseStatements[columnName] = sql.join(sqlChunks, sql.raw(' '));
  }

  return caseStatements;
}

interface OrderData {
  products: {
    id: number;
    quantity: number;
  }[];
  userData: {
    afm: string;
    countyID: number;
    district: string;
    phone1: string;
    phone2: string;
    fax: string;
    email: string;
    name: string;
    address: string;
    zip: string;
  };
}

export async function createPendingOrder(orderData: OrderData) {
  const session = await getSession();
  
  if (!session) {
    throw new Error('User not authenticated');
  }

  // Get available products and validate stock
  const apiProducts = await getVisibleProducts();
  const productMap = new Map(apiProducts.map(p => [p.id, p]));
  
  const orderedProducts = [];
  
  for (const item of orderData.products) {
    const product = productMap.get(item.id);
    if (!product) {
      throw new Error(`Product with ID ${item.id} not found`);
    }
    
    if (product.stock < item.quantity) {
      throw new Error(`${product.name} nu mai este în stoc suficient. Disponibil: ${product.stock}, Comandat: ${item.quantity}`);
    }
    
    orderedProducts.push({
      id: product.id,
      name: product.name,
      quantity: item.quantity,
      price: product.priceWithTax
    });
  }

  // Create pending order WITHOUT reducing stock yet
  const [{ id: orderID }] = await db
    .insert(orders)
    .values({
      userID: +session.uid,
      items: orderedProducts.map((product) => ({
        id: product.id,
        quantity: product.quantity,
        status: 'pending_payment' // Mark as pending payment
      })),
      pickup: new Date()
    })
    .returning({
      id: orders.id
    });

  return {
    orderID,
    orderedProducts,
    totalAmount: orderedProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0)
  };
}

export async function confirmOrderAndReduceStock(orderID: number) {
  const session = await getSession();
  
  if (!session) {
    throw new Error('User not authenticated');
  }

  // Get the pending order
  const [order] = await db
    .select()
    .from(orders)
    .where(sql`${orders.id} = ${orderID} AND ${orders.userID} = ${session.uid}`);

  if (!order) {
    throw new Error('Order not found');
  }

  const orderItems = order.items as Array<{
    id: number;
    quantity: number;
    status?: string;
  }>;

  // Check if order is still pending
  const isPending = orderItems.some(item => item.status === 'pending_payment');
  if (!isPending) {
    throw new Error('Order is not in pending state');
  }

  // Re-validate stock before reducing (race condition protection)
  const apiProducts = await getVisibleProducts();
  const productMap = new Map(apiProducts.map(p => [p.id, p]));
  
  for (const item of orderItems) {
    const product = productMap.get(item.id);
    if (!product) {
      throw new Error(`Product with ID ${item.id} not found`);
    }
    
    if (product.stock < item.quantity) {
      throw new Error(`${product.name} nu mai este în stoc suficient pentru finalizarea comenzii`);
    }
  }

  // Now reduce stock since payment initiation was successful
  await db.update(products).set(
    caseArrayStatement(
      orderItems.map((item) => ({
        id: item.id,
        stock: sql`${products.stock} - ${item.quantity}`
      })),
      ['stock']
    )
  ).where(inArray(products.id, orderItems.map((item) => item.id)));

  // Update order status to confirmed
  await db
    .update(orders)
    .set({
      items: orderItems.map(item => ({
        ...item,
        status: 'payment_initiated'
      }))
    })
    .where(sql`${orders.id} = ${orderID}`);

  return { success: true };
}

export async function cancelPendingOrder(orderID: number) {
  const session = await getSession();
  
  if (!session) {
    throw new Error('User not authenticated');
  }

  // Simply delete the pending order since no stock was reduced
  await db
    .delete(orders)
    .where(sql`${orders.id} = ${orderID} AND ${orders.userID} = ${session.uid}`);

  return { success: true };
}

export async function rollbackStockReduction(orderID: number, requireAuth: boolean = true) {
  if (requireAuth) {
    const session = await getSession();
    
    if (!session) {
      throw new Error('User not authenticated');
    }

    // Get the order with user validation
    const [order] = await db
      .select()
      .from(orders)
      .where(sql`${orders.id} = ${orderID} AND ${orders.userID} = ${session.uid}`);

    if (!order) {
      throw new Error('Order not found');
    }
  } else {
    // For webhook calls, get order without user validation
    const [order] = await db
      .select()
      .from(orders)
      .where(sql`${orders.id} = ${orderID}`);

    if (!order) {
      throw new Error('Order not found');
    }
  }

  // Get the order again for processing (same logic for both paths)
  const [order] = await db
    .select()
    .from(orders)
    .where(sql`${orders.id} = ${orderID}`);

  const orderItems = order.items as Array<{
    id: number;
    quantity: number;
    status?: string;
  }>;

  // Only rollback if stock was actually reduced
  const needsRollback = orderItems.some(item => 
    item.status === 'payment_initiated' || item.status === 'confirmed'
  );

  if (needsRollback) {
    // Restore stock
    await db.update(products).set(
      caseArrayStatement(
        orderItems.map((item) => ({
          id: item.id,
          stock: sql`${products.stock} + ${item.quantity}`
        })),
        ['stock']
      )
    ).where(inArray(products.id, orderItems.map((item) => item.id)));

    // Update order status to cancelled
    await db
      .update(orders)
      .set({
        items: orderItems.map(item => ({
          ...item,
          status: 'cancelled'
        }))
      })
      .where(sql`${orders.id} = ${orderID}`);
  } else {
    // Just delete the pending order
    await db
      .delete(orders)
      .where(sql`${orders.id} = ${orderID}`);
  }

  return { success: true };
}