CREATE TYPE "public"."content_kind" AS ENUM('artikel', 'panduan', 'tips');--> statement-breakpoint
CREATE TYPE "public"."content_status" AS ENUM('draft', 'pending', 'published');--> statement-breakpoint
CREATE TABLE "contents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(180) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"kind" "content_kind" DEFAULT 'artikel' NOT NULL,
	"excerpt" text,
	"body" text NOT NULL,
	"cover_url" text,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"author_id" uuid,
	"views" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "contents_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "gallery_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"key" text NOT NULL,
	"url" text NOT NULL,
	"mime" varchar(80) NOT NULL,
	"size" bigint DEFAULT 0 NOT NULL,
	"region" varchar(120),
	"uploaded_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gallery_photos_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "contents" ADD CONSTRAINT "contents_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_photos" ADD CONSTRAINT "gallery_photos_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "contents_status_idx" ON "contents" USING btree ("status");--> statement-breakpoint
CREATE INDEX "contents_kind_idx" ON "contents" USING btree ("kind");--> statement-breakpoint
CREATE INDEX "contents_published_idx" ON "contents" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "gallery_photos_region_idx" ON "gallery_photos" USING btree ("region");--> statement-breakpoint
CREATE INDEX "gallery_photos_created_idx" ON "gallery_photos" USING btree ("created_at");