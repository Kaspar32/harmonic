CREATE TABLE "boosts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_uuid" uuid NOT NULL,
	"starts_at" timestamp NOT NULL,
	"ends_at" timestamp NOT NULL,
	"multiplier" integer DEFAULT 150
);
--> statement-breakpoint
ALTER TABLE "boosts" ADD CONSTRAINT "boosts_user_uuid_users_uuid_fk" FOREIGN KEY ("user_uuid") REFERENCES "public"."users"("uuid") ON DELETE no action ON UPDATE no action;