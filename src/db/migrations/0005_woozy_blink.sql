ALTER TABLE "users" ADD COLUMN "zip" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "jobtypetrd";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "trdcategory";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "cmpmode";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "vatsts";