import {
  varchar,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { pgTable, serial, text, integer, jsonb, uuid, timestamp, boolean, doublePrecision } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  password: text('passwort'),
  name: text('name'),
  alter: integer('alter'),
  geburtstag: timestamp('geburtstag'),
  geschlecht: text('geschlecht'),
  groesse: integer('groesse'),
  ausbildung: text('ausbildung'),
  intressen: jsonb('intressen').$type<string[]>(),
  ichsuche:jsonb('ichsuche').$type<string[]>(),
  genres: jsonb('genres').$type<string[]>(),
  favorite_track: jsonb("favorite_track"),
  favorite_artist: jsonb("favorite_artist"),
  roles: text('roles'),
  fakeUsersEnabled: boolean().default(true),
  profile_pics: jsonb("profile_pics"),
  location: text('location'),
  locationid: integer("locationid"),
});

export const profilePictures = pgTable("profile_pictures", {
  id: text("id").primaryKey(),
  userUuid: uuid("user_id").references(() => users.uuid),
  imageBase64: text("image_base64"),
  imageBase64_blurred: text("image_base64_blurred"), // Base64 als Text
  position: integer("position")    
});

export const likes = pgTable("likes",{
  id: serial("id").primaryKey(),
  from: uuid("from").references(() => users.uuid),
  to: uuid("to").references(() => users.uuid),
  likedAt: timestamp("liked_at").defaultNow(),

} );

export const superlikes = pgTable("superlikes",{
  id: serial("id").primaryKey(),
  from: uuid("from").references(() => users.uuid),
  to: uuid("to").references(() => users.uuid),
  likedAt: timestamp("liked_at").defaultNow(),

} );

export const dislikes = pgTable("dislikes",{
  id: serial("id").primaryKey(),
  from: uuid("from").references(() => users.uuid),
  to: uuid("to").references(() => users.uuid),
  dislikedAt: timestamp("disliked_at").defaultNow(),

} );

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  fromUser: text("from_user").notNull(),
  toUser: text("to_user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  intresse: text("intresse"),
  alter: jsonb("alter").$type<number[]>(),
  uuid: uuid("uuid").references(() => users.uuid).notNull(),
  radius: integer("radius"),
});

export const reports = pgTable("reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  reportedId: text("reported_id").notNull(),
  reporterId: text("reporter_id").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const questionaires = pgTable("questionaires", {
  id: serial("id").primaryKey(),
  uuid: uuid("user_uuid").references(() => users.uuid).notNull(),
  answers: jsonb("answers").$type<Record<string, string>>().notNull(),
}); 

export const swissLoc = pgTable(
  "swissLoc",
  {
    id: integer("id").primaryKey().notNull(),
    zipCode: varchar("zip_code", { length: 6 }).default(""),
    cityName: varchar("city_name", { length: 50 }).default(""),
    cantonNameShort: varchar("canton_name_short", { length: 2 }).default(""),
    cantonNameLong: varchar("canton_name_long", { length: 25 }).notNull(),
    iLatitude: doublePrecision("iLatitude"),
    iLongitude: doublePrecision("iLongitude"),
  },
  (table) => ({
    pk: uniqueIndex("swissLoc_pkey").on(table.id),
  })
);
