ALTER TABLE "profile_pictures" DROP CONSTRAINT "profile_pictures_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "profile_pictures" ADD CONSTRAINT "profile_pictures_user_id_users_uuid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("uuid") ON DELETE no action ON UPDATE no action;