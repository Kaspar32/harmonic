CREATE TABLE "swissLoc" (
	"id" integer PRIMARY KEY NOT NULL,
	"zip_code" varchar(6) DEFAULT '',
	"city_name" varchar(50) DEFAULT '',
	"canton_name_short" varchar(2) DEFAULT '',
	"canton_name_long" varchar(25) NOT NULL,
	"iLatitude" double precision,
	"iLongitude" double precision
);
--> statement-breakpoint
CREATE UNIQUE INDEX "swissLoc_pkey" ON "swissLoc" USING btree ("id");