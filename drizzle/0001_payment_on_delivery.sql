CREATE TYPE "public"."payment_method" AS ENUM('cash_on_delivery', 'card_on_delivery');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('unpaid', 'paid');--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "payment_method" "payment_method" DEFAULT 'cash_on_delivery' NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "payment_status" "payment_status" DEFAULT 'unpaid' NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "paid_at" timestamp;