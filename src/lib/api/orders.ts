'use server';

import { db } from '@/db/db';
import { orders } from '@/db/schema/orders';
import { and, eq, inArray, sql, SQL } from 'drizzle-orm';
import { getSession } from '@/lib/api/auth';
import { products } from '@/db/schema/products';
import {
  createSoftOneClient,
  createSoftOneOrder
} from '@/lib/api/softone/softone-invoice';
import { counties } from '@/lib/data/counties';

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

export async function getOrders() {
  const session = await getSession();

  if (!session) {
    return;
  }

  return db.select().from(orders).where(eq(orders.userID, +session.uid));
}

export async function getOrder(id: number) {
  const session = await getSession();

  if (!session) {
    return;
  }

  return db
    .select()
    .from(orders)
    .where(and(eq(orders.id, id), eq(orders.userID, +session.uid)));
}

export async function createOrder(
  orderedProducts: {
    id: number;
    quantity: number;
  }[],
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
  }
) {
  const session = await getSession();

  if (!session) {
    return;
  }

  const apiProducts = await db
    .select()
    .from(products)
    .where(
      inArray(
        products.id,
        orderedProducts.map((el) => el.id)
      )
    );

  for (const product of apiProducts) {
    if (
      product.stock <
      orderedProducts.find((el) => el.id === product.id)!.quantity
    ) {
      return `${product.name} nu mai este în stoc.`;
    }
  }

  await db.update(products).set(
    caseArrayStatement(
      orderedProducts.map((el) => ({
        id: el.id,
        stock: sql`${products.stock} -
        ${el.quantity}`
      })),
      ['stock']
    )
  );

  const [{ id: orderID }] = await db
    .insert(orders)
    .values({
      userID: +session.uid,
      items: orderedProducts.map((product) => ({
        id: product.id,
        quantity: product.quantity
      })),
      pickup: new Date()
    })
    .returning({
      id: orders.id
    });

  const hasCode = userData.afm !== '';
  const hasRO = userData.afm.toLowerCase().includes('ro');
  const afm = userData.afm.replace('ro', '').replace('RO', '');

  await createSoftOneClient({
    afm,
    vatsts: hasRO ? '1' : '0',
    efactura: hasCode ? '0' : '1',
    cmpmode: hasCode ? '501' : '11',
    trdcategory: hasCode ? (hasRO ? '3000' : '3001') : '3099',
    bgbulstat: hasRO ? 'RO' : '',
    phone1: userData.phone1,
    phone2: userData.phone2,
    fax: userData.fax,
    email: userData.email,
    name: userData.name,
    zip: userData.zip,
    address: userData.address,
    district1: userData.countyID.toString(),
    district: userData.countyID === 10 ? userData.district : '',
    city: counties.find((el) => el.id === userData.countyID)!.name,
    webpage: '',
    num01: orderID.toString(),
    jobtypetrd: 'J08/12345/2021' // ?????
  });

  // await createSoftOneOrder([], '', '', '');
}
