CREATE TYPE "public"."category_type" AS ENUM('terrain', 'activity');--> statement-breakpoint
CREATE TYPE "public"."destination_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."difficulty" AS ENUM('ramah-pemula', 'menengah', 'sulit');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(80) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"type" "category_type" NOT NULL,
	"icon" varchar(80),
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "destination_categories" (
	"destination_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	CONSTRAINT "destination_categories_destination_id_category_id_pk" PRIMARY KEY("destination_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "destinations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"slug" varchar(140) NOT NULL,
	"tagline" varchar(200),
	"description" text,
	"difficulty" "difficulty" DEFAULT 'menengah' NOT NULL,
	"best_season" text[] DEFAULT '{}' NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"terrain" text[] DEFAULT '{}' NOT NULL,
	"activities" text[] DEFAULT '{}' NOT NULL,
	"province" varchar(80),
	"regency" varchar(80),
	"district" varchar(80),
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"access_point" varchar(160),
	"access_description" text,
	"access_transport" text[] DEFAULT '{}' NOT NULL,
	"access_duration" varchar(80),
	"access_distance_km" numeric(8, 2),
	"facilities" text[] DEFAULT '{}' NOT NULL,
	"entry_fee" integer,
	"elevation_meters" integer,
	"images" text[] DEFAULT '{}' NOT NULL,
	"guide_required" boolean DEFAULT false NOT NULL,
	"status" "destination_status" DEFAULT 'draft' NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "destinations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "destination_categories" ADD CONSTRAINT "destination_categories_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "destination_categories" ADD CONSTRAINT "destination_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "categories_type_idx" ON "categories" USING btree ("type");--> statement-breakpoint
CREATE INDEX "destinations_status_idx" ON "destinations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "destinations_difficulty_idx" ON "destinations" USING btree ("difficulty");