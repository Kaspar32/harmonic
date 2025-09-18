CREATE TABLE "profile_pictures" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer,
	"image_base64" text,
	"position" integer
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "uuid" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "alter" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "geschlecht" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "grösse" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "ausbildung" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "intressen" jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "ichsuche" jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "genres" jsonb;--> statement-breakpoint
ALTER TABLE "profile_pictures" ADD CONSTRAINT "profile_pictures_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_uuid_unique" UNIQUE("uuid");