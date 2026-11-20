CREATE TABLE "dislikes" (
	"id" serial PRIMARY KEY NOT NULL,
	"from" uuid,
	"to" uuid,
	"disliked_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "likes" (
	"id" serial PRIMARY KEY NOT NULL,
	"from" uuid,
	"to" uuid,
	"liked_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"from_user" text NOT NULL,
	"to_user" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_pictures" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"image_base64" text,
	"image_base64_blurred" text,
	"position" integer
);
--> statement-breakpoint
CREATE TABLE "questionaires" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_uuid" uuid NOT NULL,
	"answers" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reported_id" text NOT NULL,
	"reporter_id" text NOT NULL,
	"reason" text,
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
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"passwort" text,
	"name" text,
	"alter" integer,
	"geschlecht" text,
	"groesse" integer,
	"ausbildung" text,
	"intressen" jsonb,
	"ichsuche" jsonb,
	"genres" jsonb,
	"favorite_track" jsonb,
	"favorite_artist" jsonb,
	"roles" text,
	"fakeUsersEnabled" boolean DEFAULT true,
	"profile_pics" jsonb,
	CONSTRAINT "users_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
ALTER TABLE "dislikes" ADD CONSTRAINT "dislikes_from_users_uuid_fk" FOREIGN KEY ("from") REFERENCES "public"."users"("uuid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dislikes" ADD CONSTRAINT "dislikes_to_users_uuid_fk" FOREIGN KEY ("to") REFERENCES "public"."users"("uuid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_from_users_uuid_fk" FOREIGN KEY ("from") REFERENCES "public"."users"("uuid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_to_users_uuid_fk" FOREIGN KEY ("to") REFERENCES "public"."users"("uuid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_pictures" ADD CONSTRAINT "profile_pictures_user_id_users_uuid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("uuid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questionaires" ADD CONSTRAINT "questionaires_user_uuid_users_uuid_fk" FOREIGN KEY ("user_uuid") REFERENCES "public"."users"("uuid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settings" ADD CONSTRAINT "settings_uuid_users_uuid_fk" FOREIGN KEY ("uuid") REFERENCES "public"."users"("uuid") ON DELETE no action ON UPDATE no action;