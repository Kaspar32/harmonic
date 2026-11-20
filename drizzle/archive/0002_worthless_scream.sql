ALTER TABLE "users" ADD COLUMN "verification_email" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "verification_token" varchar(100);