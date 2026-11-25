CREATE TYPE "public"."route_grade" AS ENUM('datar', 'landai', 'sedang', 'terjal', 'sangat-terjal');--> statement-breakpoint
CREATE TYPE "public"."route_status" AS ENUM('draft', 'diterbitkan', 'terverifikasi');--> statement-breakpoint
CREATE TYPE "public"."route_surface" AS ENUM('setapak', 'aspal', 'tanah', 'batu', 'pasir');--> statement-breakpoint
CREATE TYPE "public"."track_node_type" AS ENUM('basecamp', 'gerbang', 'parkir', 'pos', 'sumber-air', 'viewpoint', 'puncak', 'persimpangan', 'area-camp');--> statement-breakpoint
CREATE TABLE "route_segments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"destination_id" uuid NOT NULL,
	"from_node_id" uuid NOT NULL,
	"to_node_id" uuid NOT NULL,
	"surface" "route_surface" DEFAULT 'setapak' NOT NULL,
	"grade" "route_grade" DEFAULT 'sedang' NOT NULL,
	"traversable_by" text[] DEFAULT '{}' NOT NULL,
	"bidirectional" boolean DEFAULT true NOT NULL,
	"distance_km" numeric(8, 2),
	"estimated_duration_minutes" integer,
	"seasonal" boolean DEFAULT false NOT NULL,
	"notes" text,
	"status" "route_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "track_nodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"destination_id" uuid NOT NULL,
	"name" varchar(120) NOT NULL,
	"type" "track_node_type" DEFAULT 'pos' NOT NULL,
	"latitude" numeric(10, 7) NOT NULL,
	"longitude" numeric(10, 7) NOT NULL,
	"elevation_meters" integer NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trail_route_nodes" (
	"route_id" uuid NOT NULL,
	"node_id" uuid NOT NULL,
	"position" integer NOT NULL,
	CONSTRAINT "trail_route_nodes_route_id_position_pk" PRIMARY KEY("route_id","position")
);
--> statement-breakpoint
CREATE TABLE "trail_route_segments" (
	"route_id" uuid NOT NULL,
	"segment_id" uuid NOT NULL,
	"position" integer NOT NULL,
	CONSTRAINT "trail_route_segments_route_id_position_pk" PRIMARY KEY("route_id","position")
);
--> statement-breakpoint
CREATE TABLE "trail_routes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"destination_id" uuid NOT NULL,
	"name" varchar(120) NOT NULL,
	"description" text,
	"basecamp_node_id" uuid,
	"surface" varchar(20) DEFAULT 'campuran' NOT NULL,
	"grade" "route_grade" DEFAULT 'sedang' NOT NULL,
	"traversable_by" text[] DEFAULT '{}' NOT NULL,
	"difficulty" "difficulty" DEFAULT 'menengah' NOT NULL,
	"recommended" boolean DEFAULT false NOT NULL,
	"status" "route_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "route_segments" ADD CONSTRAINT "route_segments_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_segments" ADD CONSTRAINT "route_segments_from_node_id_track_nodes_id_fk" FOREIGN KEY ("from_node_id") REFERENCES "public"."track_nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_segments" ADD CONSTRAINT "route_segments_to_node_id_track_nodes_id_fk" FOREIGN KEY ("to_node_id") REFERENCES "public"."track_nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "track_nodes" ADD CONSTRAINT "track_nodes_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trail_route_nodes" ADD CONSTRAINT "trail_route_nodes_route_id_trail_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."trail_routes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trail_route_nodes" ADD CONSTRAINT "trail_route_nodes_node_id_track_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."track_nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trail_route_segments" ADD CONSTRAINT "trail_route_segments_route_id_trail_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."trail_routes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trail_route_segments" ADD CONSTRAINT "trail_route_segments_segment_id_route_segments_id_fk" FOREIGN KEY ("segment_id") REFERENCES "public"."route_segments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trail_routes" ADD CONSTRAINT "trail_routes_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trail_routes" ADD CONSTRAINT "trail_routes_basecamp_node_id_track_nodes_id_fk" FOREIGN KEY ("basecamp_node_id") REFERENCES "public"."track_nodes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "route_segments_destination_idx" ON "route_segments" USING btree ("destination_id");--> statement-breakpoint
CREATE INDEX "track_nodes_destination_idx" ON "track_nodes" USING btree ("destination_id");--> statement-breakpoint
CREATE INDEX "trail_routes_destination_idx" ON "trail_routes" USING btree ("destination_id");