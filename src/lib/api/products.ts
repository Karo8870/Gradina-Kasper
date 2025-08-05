'use server';

import { db } from '@/db/db';
import { products } from '@/db/schema/products';
import { eq, inArray } from 'drizzle-orm';
import { isAdmin } from '@/lib/api/auth';
import { cachedValues } from '@/db/schema/cached-values';
import {
  getSoftOneModifiedArticles,
  getSoftOneProducts
} from '@/lib/api/softone/softone-info';

const unitMap = {
  Kilograme: 'Kg',
  Bucati: 'Buc',
  Cutii: 'Cutii'
};

type RefreshTimestamp =
  | {
      date: string;
      hour: string;
    }
  | undefined;

export async function refreshProducts() {
  const admin = await isAdmin();

  if (!admin) {
    return;
  }

  const lastRefresh: RefreshTimestamp = (
    await db
      .select({
        value: cachedValues.value
      })
      .from(cachedValues)
      .where(eq(cachedValues.key, 'last_refresh_products'))
  )[0]?.value as RefreshTimestamp;

  if (!lastRefresh) {
    const currentDate = new Date();

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hour = String(currentDate.getHours()).padStart(2, '0');

    const softOneProducts = await getSoftOneProducts(
      '20220101',
      '00',
      year + month + day,
      hour
    );

    await db.insert(cachedValues).values({
      key: 'last_refresh_products',
      value: {
        date: year + month + day,
        hour
      }
    });

    await db.delete(products);

    await db.insert(products).values(
      softOneProducts.rows.map((product) => ({
        name: product.NAME,
        image: '',
        stock: +product.STOC,
        unit: unitMap[product.MTRUNITNAME as keyof typeof unitMap] ?? '',
        visible: true,
        softOneID: product.MTRL,
        softOneName: product.NAME,
        priceWithTax: +product.PRETCUTVA,
        priceWithoutTax: +product.PRETFTVA
      }))
    );

    return;
  }

  const currentDate = new Date();

  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  const hour = String(currentDate.getHours()).padStart(2, '0');

  const softOneProducts = await getSoftOneModifiedArticles(
    lastRefresh.date,
    lastRefresh.hour,
    year + month + day,
    hour
  );

  await db
    .update(cachedValues)
    .set({
      value: {
        date: year + month + day,
        hour
      }
    })
    .where(eq(cachedValues.key, 'last_refresh_products'));

  const updatedProducts: string[] = softOneProducts.rows.map((el) => el.MTRL);

  const apiProducts = await db
    .select({
      name: products.name,
      visible: products.visible,
      image: products.image,
      softOneID: products.softOneID
    })
    .from(products)
    .where(inArray(products.softOneID, updatedProducts));

  await db.delete(products).where(inArray(products.softOneID, updatedProducts));

  await db.insert(products).values(
    softOneProducts.rows.map((product) => {
      const apiProduct = apiProducts.find(
        (el) => el.softOneID === product.MTRL
      );

      return {
        name: apiProduct?.name ?? product.NAME,
        image: apiProduct?.image ?? '',
        stock: +product.STOC,
        unit: unitMap[product.MTRUNITNAME as keyof typeof unitMap] ?? '',
        visible: apiProduct?.visible ?? true,
        softOneID: product.MTRL,
        softOneName: product.NAME,
        priceWithTax: +product.PRETCUTVA,
        priceWithoutTax: +product.PRETFTVA
      };
    })
  );
}

export async function updateProduct(
  id: number,
  name: string,
  visible: boolean
) {
  const admin = await isAdmin();

  if (!admin) {
    return;
  }

  await db
    .update(products)
    .set({
      name,
      visible
    })
    .where(eq(products.id, id));
}

export async function setProductCover(id: number, image: string) {
  const admin = await isAdmin();

  if (!admin) {
    return;
  }

  await db
    .update(products)
    .set({
      image
    })
    .where(eq(products.id, id));
}

export async function getProducts() {
  return db.select().from(products);
}

export async function getVisibleProducts() {
  return db.select().from(products).where(eq(products.visible, true));
}
