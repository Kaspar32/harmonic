ALTER TABLE "likes" RENAME COLUMN "user_id" TO "id";--> statement-breakpoint
ALTER TABLE "likes" DROP CONSTRAINT "likes_user_id_users_uuid_fk";
--> statement-breakpoint
ALTER TABLE "likes" ADD COLUMN "from" uuid;--> statement-breakpoint
ALTER TABLE "likes" ADD COLUMN "to" uuid;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_from_users_uuid_fk" FOREIGN KEY ("from") REFERENCES "public"."users"("uuid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_to_users_uuid_fk" FOREIGN KEY ("to") REFERENCES "public"."users"("uuid") ON DELETE no action ON UPDATE no action;