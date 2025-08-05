ALTER TABLE "items" RENAME TO "products";--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "unit" text NOT NULL;