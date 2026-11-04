CREATE TYPE "public"."dummy_payment_status" AS ENUM('pending', 'paid', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."facility_proposal_status" AS ENUM('menunggu', 'terverifikasi', 'ditolak');--> statement-breakpoint
CREATE TYPE "public"."promo_discount_type" AS ENUM('percentage', 'fixed');--> statement-breakpoint
CREATE TYPE "public"."checklist_category" AS ENUM('perlengkapan', 'kesehatan', 'konservasi', 'administrasi');--> statement-breakpoint
CREATE TYPE "public"."faq_category" AS ENUM('akun', 'perjalanan', 'fasilitas', 'data');--> statement-breakpoint
CREATE TYPE "public"."feedback_category" AS ENUM('bug', 'saran', 'konten', 'lainnya');--> statement-breakpoint
CREATE TYPE "public"."notification_kind" AS ENUM('rekomendasi', 'rencana', 'checklist', 'usulan', 'sistem');--> statement-breakpoint
CREATE TYPE "public"."settings_language" AS ENUM('id', 'en');--> statement-breakpoint
CREATE TYPE "public"."settings_theme" AS ENUM('terang', 'sistem', 'gelap');--> statement-breakpoint
CREATE TYPE "public"."trip_status" AS ENUM('aktif', 'arsip');--> statement-breakpoint
CREATE TABLE "dummy_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"support_id" uuid NOT NULL,
	"support_name" varchar(120) NOT NULL,
	"quantity" integer NOT NULL,
	"subtotal" bigint NOT NULL,
	"discount" bigint NOT NULL,
	"total" bigint NOT NULL,
	"promo_id" uuid,
	"promo_code" varchar(32),
	"status" "dummy_payment_status" DEFAULT 'pending' NOT NULL,
	"method" varchar(20) DEFAULT 'dummy_qr' NOT NULL,
	"is_dummy" boolean DEFAULT true NOT NULL,
	"qr_payload" varchar(53) NOT NULL,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "dummy_payments_amounts" CHECK ("dummy_payments"."quantity" BETWEEN 1 AND 100 AND "dummy_payments"."subtotal" BETWEEN 0 AND 214748364700 AND "dummy_payments"."discount" BETWEEN 0 AND "dummy_payments"."subtotal" AND "dummy_payments"."total" = "dummy_payments"."subtotal" - "dummy_payments"."discount"),
	CONSTRAINT "dummy_payments_simulation" CHECK ("dummy_payments"."is_dummy" = true AND "dummy_payments"."method" = 'dummy_qr' AND "dummy_payments"."qr_payload" = 'DUMMY:' || "dummy_payments"."id"::text AND (("dummy_payments"."status" = 'paid' AND "dummy_payments"."paid_at" IS NOT NULL) OR ("dummy_payments"."status" != 'paid' AND "dummy_payments"."paid_at" IS NULL)))
);
--> statement-breakpoint
CREATE TABLE "facility_proposals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(120) NOT NULL,
	"type" "support_category" NOT NULL,
	"destination_id" uuid,
	"nearest_destination_name" varchar(160) NOT NULL,
	"address" text NOT NULL,
	"note" text,
	"status" "facility_proposal_status" DEFAULT 'menunggu' NOT NULL,
	"review_note" text,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "operation_activity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"action" varchar(80) NOT NULL,
	"target_type" varchar(40) NOT NULL,
	"target_id" uuid NOT NULL,
	"target_label" varchar(160) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(32) NOT NULL,
	"title" varchar(160) NOT NULL,
	"discount_type" "promo_discount_type" NOT NULL,
	"value" integer NOT NULL,
	"min_amount" integer DEFAULT 0 NOT NULL,
	"max_discount" integer,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "promos_code_unique" UNIQUE("code"),
	CONSTRAINT "promos_validity" CHECK ("promos"."starts_at" < "promos"."ends_at" AND "promos"."value" >= 1 AND ("promos"."discount_type" != 'percentage' OR "promos"."value" <= 100) AND "promos"."min_amount" >= 0 AND ("promos"."max_discount" IS NULL OR "promos"."max_discount" >= 0) AND "promos"."code" ~ '^[A-Z0-9_-]{3,32}$')
);
--> statement-breakpoint
CREATE TABLE "checklist_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"destination_id" uuid NOT NULL,
	"name" varchar(160) NOT NULL,
	"category" "checklist_category" NOT NULL,
	"is_required" boolean NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faqs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" "faq_category" NOT NULL,
	"question" varchar(500) NOT NULL,
	"answer" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"category" "feedback_category" NOT NULL,
	"subject" varchar(160) NOT NULL,
	"message" text NOT NULL,
	"rating" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feedback_rating_valid" CHECK ("feedback"."rating" is null or "feedback"."rating" between 0 and 5)
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"kind" "notification_kind" NOT NULL,
	"title" varchar(160) NOT NULL,
	"body" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"href" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_destinations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"destination_id" uuid NOT NULL,
	"saved_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "saved_destinations_user_destination_unique" UNIQUE("user_id","destination_id")
);
--> statement-breakpoint
CREATE TABLE "trip_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"trip_id" uuid NOT NULL,
	"destination_id" uuid NOT NULL,
	"date" date NOT NULL,
	"order" integer NOT NULL,
	"notes" text,
	"support_ids" uuid[] DEFAULT '{}' NOT NULL,
	CONSTRAINT "trip_items_order_valid" CHECK ("trip_items"."order" >= 0)
);
--> statement-breakpoint
CREATE TABLE "trips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(160) NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"people_count" integer NOT NULL,
	"budget" integer,
	"notes" text,
	"status" "trip_status" DEFAULT 'aktif' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "trips_id_user_unique" UNIQUE("id","user_id"),
	CONSTRAINT "trips_dates_valid" CHECK ("trips"."end_date" >= "trips"."start_date"),
	CONSTRAINT "trips_people_valid" CHECK ("trips"."people_count" between 1 and 100),
	CONSTRAINT "trips_budget_valid" CHECK ("trips"."budget" is null or "trips"."budget" >= 0)
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"theme" "settings_theme" DEFAULT 'terang' NOT NULL,
	"language" "settings_language" DEFAULT 'id' NOT NULL,
	"data_saver" boolean DEFAULT false NOT NULL,
	"notifications" jsonb DEFAULT '{"rekomendasi":true,"pengingatRencana":true,"pengingatChecklist":true,"fasilitasBaru":false,"promo":false}'::jsonb NOT NULL,
	"privacy" jsonb DEFAULT '{"profilPublik":true,"bagikanAktivitas":true,"analitik":false}'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dummy_payments" ADD CONSTRAINT "dummy_payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dummy_payments" ADD CONSTRAINT "dummy_payments_support_id_travel_supports_id_fk" FOREIGN KEY ("support_id") REFERENCES "public"."travel_supports"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dummy_payments" ADD CONSTRAINT "dummy_payments_promo_id_promos_id_fk" FOREIGN KEY ("promo_id") REFERENCES "public"."promos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facility_proposals" ADD CONSTRAINT "facility_proposals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facility_proposals" ADD CONSTRAINT "facility_proposals_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facility_proposals" ADD CONSTRAINT "facility_proposals_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operation_activity" ADD CONSTRAINT "operation_activity_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checklist_items" ADD CONSTRAINT "checklist_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checklist_items" ADD CONSTRAINT "checklist_items_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_destinations" ADD CONSTRAINT "saved_destinations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_destinations" ADD CONSTRAINT "saved_destinations_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_items" ADD CONSTRAINT "trip_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_items" ADD CONSTRAINT "trip_items_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_items" ADD CONSTRAINT "trip_items_trip_id_user_id_trips_id_user_id_fk" FOREIGN KEY ("trip_id","user_id") REFERENCES "public"."trips"("id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "dummy_payments_user_idx" ON "dummy_payments" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "dummy_payments_status_idx" ON "dummy_payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "facility_proposals_user_idx" ON "facility_proposals" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "facility_proposals_status_idx" ON "facility_proposals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "operation_activity_created_idx" ON "operation_activity" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "checklist_items_user_destination_idx" ON "checklist_items" USING btree ("user_id","destination_id");--> statement-breakpoint
CREATE INDEX "feedback_user_idx" ON "feedback" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_user_created_idx" ON "notifications" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "trip_items_user_trip_idx" ON "trip_items" USING btree ("user_id","trip_id");--> statement-breakpoint
CREATE INDEX "trips_user_idx" ON "trips" USING btree ("user_id");