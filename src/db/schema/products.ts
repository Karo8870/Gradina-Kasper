import { boolean, pgTable, real, serial, text } from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  image: text('image').notNull(),
  stock: real('stock').notNull(),
  unit: text('unit').notNull(),
  visible: boolean('visible').notNull(),
  softOneID: text('soft_one_id').notNull(),
  softOneName: text('soft_one_name').notNull(),
  priceWithTax: real('price_with_tax').notNull(),
  priceWithoutTax: real('price_without_tax').notNull()
});

/*
* MTRL: string;
  CODS1: string;
  CODSITE: string;
  NAME: string;
  CATCONTID: string;
  CATCONTNAME: string;
  MTRUNITID: string;
  MTRUNITNAME: string;
  STOC: string;
  PRETCUTVA: string;
  PRETFTVA: string;
  VATID: string;
  VATPERCNT: string;
*  */