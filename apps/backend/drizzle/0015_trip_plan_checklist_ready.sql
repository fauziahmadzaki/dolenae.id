ALTER TABLE "trip_plans" ADD COLUMN IF NOT EXISTS "checklist_ready" boolean DEFAULT false NOT NULL;
