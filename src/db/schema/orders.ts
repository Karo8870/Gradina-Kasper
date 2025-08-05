import {
  integer,
  jsonb,
  pgTable,
  serial,
  timestamp
} from 'drizzle-orm/pg-core';
import { users } from '@/db/schema/users';

// export const orderStatusEnum = pgEnum('order_status', [
//   'processing',
//   'completed'
// ]);

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userID: integer('user_id')
    .notNull()
    .references(() => users.id),
  items: jsonb('items').notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
  // status: orderStatusEnum('status').notNull().default('processing'),
  pickup: timestamp('pickup').notNull()
});

/*
 * products: {
 *   - id: number;
 *   - quantity: number;
 * }
 * */