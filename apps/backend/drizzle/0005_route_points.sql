CREATE TABLE "trail_route_points" (
	"route_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"latitude" numeric(10, 7) NOT NULL,
	"longitude" numeric(10, 7) NOT NULL,
	"elevation_meters" integer,
	"node_id" uuid,
	CONSTRAINT "trail_route_points_route_id_position_pk" PRIMARY KEY("route_id","position")
);
--> statement-breakpoint
ALTER TABLE "trail_route_points" ADD CONSTRAINT "trail_route_points_route_id_trail_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."trail_routes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trail_route_points" ADD CONSTRAINT "trail_route_points_node_id_track_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."track_nodes"("id") ON DELETE set null ON UPDATE no action;