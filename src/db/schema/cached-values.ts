import { jsonb, pgTable, text } from 'drizzle-orm/pg-core';

export const cachedValues = pgTable('cached_values', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull()
});
