CREATE TYPE "public"."trail_route_status" AS ENUM('terverifikasi', 'alternatif', 'dalam-perbaikan', 'rusak', 'terlarang');--> statement-breakpoint
ALTER TYPE "public"."route_surface" ADD VALUE 'tanah-liat' BEFORE 'batu';--> statement-breakpoint
ALTER TABLE "trail_routes" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "trail_routes" ALTER COLUMN "status" SET DATA TYPE trail_route_status USING (CASE "status"::text WHEN 'diterbitkan' THEN 'terverifikasi' WHEN 'terverifikasi' THEN 'terverifikasi' ELSE 'alternatif' END)::trail_route_status;--> statement-breakpoint
ALTER TABLE "trail_routes" ALTER COLUMN "status" SET DEFAULT 'terverifikasi';--> statement-breakpoint
ALTER TABLE "track_nodes" ADD COLUMN "image_url" text;