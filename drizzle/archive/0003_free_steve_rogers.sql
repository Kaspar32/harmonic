CREATE TABLE "superlikes" (
	"id" serial PRIMARY KEY NOT NULL,
	"from" uuid,
	"to" uuid,
	"liked_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "superlikes" ADD CONSTRAINT "superlikes_from_users_uuid_fk" FOREIGN KEY ("from") REFERENCES "public"."users"("uuid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "superlikes" ADD CONSTRAINT "superlikes_to_users_uuid_fk" FOREIGN KEY ("to") REFERENCES "public"."users"("uuid") ON DELETE no action ON UPDATE no action;