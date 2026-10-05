CREATE TYPE "public"."category_type" AS ENUM('terrain', 'activity');--> statement-breakpoint
CREATE TYPE "public"."destination_difficulty" AS ENUM('ramah-pemula', 'menengah', 'sulit', 'butuh-lokal-guide');--> statement-breakpoint
CREATE TYPE "public"."destination_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."price_range" AS ENUM('ekonomis', 'menengah', 'premium');--> statement-breakpoint
CREATE TYPE "public"."travel_support_type" AS ENUM('accommodation', 'transport', 'food');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"slug" varchar(140) NOT NULL,
	"type" "category_type" NOT NULL,
	"icon" varchar(80) DEFAULT 'lucide:circle' NOT NULL,
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
	"name" varchar(160) NOT NULL,
	"slug" varchar(180) NOT NULL,
	"tagline" varchar(200) DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"terrain" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"activities" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"difficulty" "destination_difficulty" DEFAULT 'ramah-pemula' NOT NULL,
	"status" "destination_status" DEFAULT 'draft' NOT NULL,
	"best_season" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"location" jsonb NOT NULL,
	"access" jsonb NOT NULL,
	"facilities" jsonb NOT NULL,
	"entry_fee" varchar(200),
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"elevation_meters" integer,
	"guide_required" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "destinations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "travel_supports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"destination_id" uuid NOT NULL,
	"type" "travel_support_type" NOT NULL,
	"name" varchar(160) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"price_range" "price_range" DEFAULT 'ekonomis' NOT NULL,
	"contact" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"image" varchar(300),
	"verified" boolean DEFAULT false NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"price_per_night" integer,
	"capacity" varchar(80),
	"facilities" jsonb,
	"mode" varchar(40),
	"capacity_seats" integer,
	"routes" jsonb,
	"price" integer,
	"cuisine" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "destination_categories" ADD CONSTRAINT "destination_categories_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "destination_categories" ADD CONSTRAINT "destination_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "travel_supports" ADD CONSTRAINT "travel_supports_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;