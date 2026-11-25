CREATE TABLE "ai_itineraries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"request_hash" varchar(64) NOT NULL,
	"request_json" jsonb NOT NULL,
	"result_json" jsonb NOT NULL,
	"model" varchar(80),
	"engine" varchar(20) DEFAULT 'deterministic' NOT NULL,
	"latency_ms" integer,
	"status" varchar(20) DEFAULT 'ok' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "travel_supports" ADD COLUMN "price_min" integer;--> statement-breakpoint
ALTER TABLE "travel_supports" ADD COLUMN "price_max" integer;--> statement-breakpoint
ALTER TABLE "ai_itineraries" ADD CONSTRAINT "ai_itineraries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_itineraries_user_idx" ON "ai_itineraries" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "ai_itineraries_hash_idx" ON "ai_itineraries" USING btree ("request_hash");