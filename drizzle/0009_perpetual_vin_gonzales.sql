CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"from_user" text NOT NULL,
	"to_user" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"intresse" text,
	"alter" jsonb,
	"uuid" uuid NOT NULL
);
--> statement-breakpoint
DROP TABLE "orderPics" CASCADE;--> statement-breakpoint
ALTER TABLE "likes" ADD COLUMN "id" serial PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "profile_pictures" ADD COLUMN "image_base64_blurred" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "top_tracks" jsonb;--> statement-breakpoint
ALTER TABLE "settings" ADD CONSTRAINT "settings_uuid_users_uuid_fk" FOREIGN KEY ("uuid") REFERENCES "public"."users"("uuid") ON DELETE no action ON UPDATE no action;