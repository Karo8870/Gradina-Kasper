import { pgTable, serial, text } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  firstName: text('firstName').notNull(),
  lastName: text('lastName').notNull(),
  phone1: text('phone1').notNull().default(''),
  phone2: text('phone2').notNull().default(''),
  afm: text('afm').notNull().default(''),
  fax: text('fax').notNull().default(''),
  address: text('address').notNull().default(''),
  city: text('city').notNull().default(''),
  sector: text('sector').notNull().default(''),
  county: text('county').notNull().default(''),
  zip: text('zip').notNull().default('')
});

/*
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
 */