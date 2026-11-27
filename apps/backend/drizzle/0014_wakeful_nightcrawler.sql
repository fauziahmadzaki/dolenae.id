CREATE TABLE "trip_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"client_id" varchar(120),
	"title" varchar(160) NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"people_count" integer DEFAULT 1 NOT NULL,
	"total_budget" integer DEFAULT 0 NOT NULL,
	"origin_province" varchar(100) DEFAULT '' NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"engine" varchar(30) DEFAULT 'draft' NOT NULL,
	"notice" text,
	"ai_warning" text,
	"destination_ids" text[] DEFAULT '{}' NOT NULL,
	"briefing_json" jsonb DEFAULT '{"grounded":[],"general":[],"warnings":[]}'::jsonb NOT NULL,
	"days_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sources_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"checklist_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "trip_plans" ADD CONSTRAINT "trip_plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_plans" ADD CONSTRAINT "trip_plans_date_range_check" CHECK ("trip_plans"."start_date" IS NULL OR "trip_plans"."end_date" IS NULL OR "trip_plans"."end_date" >= "trip_plans"."start_date");--> statement-breakpoint
CREATE TABLE "trip_plan_deletions" (
	"user_id" uuid NOT NULL,
	"client_id" varchar(120) NOT NULL,
	"deleted_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "trip_plan_deletions_user_id_client_id_pk" PRIMARY KEY("user_id","client_id")
);
--> statement-breakpoint
ALTER TABLE "trip_plan_deletions" ADD CONSTRAINT "trip_plan_deletions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "trip_plans_user_idx" ON "trip_plans" USING btree ("user_id","start_date");--> statement-breakpoint
CREATE UNIQUE INDEX "trip_plans_user_client_uidx" ON "trip_plans" USING btree ("user_id","client_id");