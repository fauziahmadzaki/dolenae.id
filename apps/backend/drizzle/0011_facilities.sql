CREATE TYPE "public"."facility_category" AS ENUM('transport', 'accommodation', 'food');--> statement-breakpoint
CREATE TYPE "public"."facility_status" AS ENUM('draft', 'pending', 'published', 'rejected', 'archived');--> statement-breakpoint
CREATE TABLE "facilities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"destination_id" uuid NOT NULL,
	"owner_id" uuid,
	"name" varchar(120) NOT NULL,
	"category" "facility_category" NOT NULL,
	"type" varchar(60) DEFAULT 'lainnya' NOT NULL,
	"latitude" numeric(10, 7) NOT NULL,
	"longitude" numeric(10, 7) NOT NULL,
	"price_min" integer,
	"price_max" integer,
	"description" text,
	"contact" text NOT NULL,
	"contact_email" varchar(255),
	"website" text,
	"banner_url" text,
	"status" "facility_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "facility_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"facility_id" uuid NOT NULL,
	"name" varchar(120) NOT NULL,
	"description" text,
	"banner_url" text,
	"price" integer NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facility_products" ADD CONSTRAINT "facility_products_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "facilities_destination_idx" ON "facilities" USING btree ("destination_id");--> statement-breakpoint
CREATE INDEX "facilities_owner_idx" ON "facilities" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "facilities_category_idx" ON "facilities" USING btree ("destination_id","category");--> statement-breakpoint
CREATE INDEX "facility_products_facility_idx" ON "facility_products" USING btree ("facility_id");