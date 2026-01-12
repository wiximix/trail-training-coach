CREATE TABLE "members" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"height" integer,
	"weight" integer,
	"gender" varchar(10),
	"resting_heart_rate" integer,
	"max_heart_rate" integer,
	"lactate_threshold_heart_rate" integer,
	"lactate_threshold_pace" varchar(20),
	"marathon_pace" varchar(20),
	"terrain_pace_factors" jsonb,
	"preferred_supply_types" jsonb,
	"cramp_frequency" varchar(20),
	"expected_sweat_rate" varchar(20),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" varchar(36) NOT NULL,
	"trail_id" varchar(36) NOT NULL,
	"training_date" timestamp with time zone NOT NULL,
	"predicted_time" text NOT NULL,
	"predicted_pace" text NOT NULL,
	"predicted_checkpoints" jsonb NOT NULL,
	"predicted_hourly_energy_needs" jsonb,
	"predicted_supply_dosages" jsonb,
	"actual_time" text,
	"actual_pace" text,
	"actual_checkpoints" jsonb,
	"total_water_intake" integer,
	"total_calories_intake" integer,
	"total_electrolytes_intake" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" varchar(36) NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"role" varchar(20) DEFAULT 'member',
	"status" varchar(20) DEFAULT 'pending',
	"joined_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"owner_id" varchar(36) NOT NULL,
	"member_count" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "trails" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"cp_count" integer NOT NULL,
	"checkpoints" jsonb NOT NULL,
	"route_map_key" text,
	"route_map_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(50) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
