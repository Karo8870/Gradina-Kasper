ALTER TABLE "products" RENAME COLUMN "price" TO "price_with_tax";--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "soft_one_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "soft_one_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "price_without_tax" real NOT NULL;