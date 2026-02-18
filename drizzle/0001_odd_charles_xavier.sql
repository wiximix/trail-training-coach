CREATE TABLE "terrain_types" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"pace_factor" text NOT NULL,
	"color" varchar(7) NOT NULL,
	"icon" varchar(50),
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "terrain_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "vo2_max" integer;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "flat_baseline_pace" varchar(20);