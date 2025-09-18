ALTER TABLE "users" ADD COLUMN "spotify_data" jsonb;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "top_tracks";