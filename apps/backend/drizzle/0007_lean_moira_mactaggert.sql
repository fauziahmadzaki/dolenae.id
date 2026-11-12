CREATE TYPE "public"."support_category" AS ENUM('accommodation', 'transport', 'food');--> statement-breakpoint
CREATE TABLE "travel_supports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"destination_id" uuid NOT NULL,
	"name" varchar(120) NOT NULL,
	"category" "support_category" NOT NULL,
	"description" text,
	"location_label" text,
	"capacity" text,
	"distance_label" text,
	"price_label" text,
	"price_unit" text,
	"contact_phone" text,
	"contact_whatsapp" text,
	"contact_instagram" text,
	"image_url" text,
	"facilities" text[] DEFAULT '{}' NOT NULL,
	"routes" text[] DEFAULT '{}' NOT NULL,
	"cuisine" text[] DEFAULT '{}' NOT NULL,
	"includes_driver" boolean DEFAULT false NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "travel_supports" ADD CONSTRAINT "travel_supports_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "travel_supports_destination_idx" ON "travel_supports" USING btree ("destination_id");