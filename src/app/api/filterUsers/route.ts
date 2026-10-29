import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  users,
  likes,
  superlikes,
  dislikes,
  settings,
  swissLoc,
  boosts,
} from "@/db/schema";
import { eq, not, inArray, and, or, like, sql, gt } from "drizzle-orm";
import { rankUsers } from "@/lib/rankUsers";

export async function GET(request: NextRequest) {
  let userfromAuth;
  try {
    const res = await fetch("http://localhost:3000/api/auth/me", {
      method: "GET",
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
    });

    if (res.ok) {
      const UserData = await res.json();
      userfromAuth = UserData;
    }
  } catch (err) {
    console.error("Error fetching user:", err);
  }

  if (!userfromAuth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  
  const [profile] = await db
    .select({
      myInterest: settings.intresse,
      myActivities: users.intressen,
      mygender: users.geschlecht,
      radius: settings.radius,
      location: users.location,
      fakeUsersEnabled: users.fakeUsersEnabled,
      iLatitude: swissLoc.iLatitude,
      iLongitude: swissLoc.iLongitude,
    })
    .from(users)
    .innerJoin(settings, eq(settings.uuid, users.uuid))
    .leftJoin(swissLoc, eq(users.locationid, swissLoc.id))
    .where(eq(users.uuid, userfromAuth.uuid));
    


  const city = profile?.location?.split(",")?.[0]?.trim();
  const country = profile?.location?.split(",")?.[2]?.trim();

  let locationFilter = undefined;
  const interestLocationNum = profile?.radius || 0;

  if (interestLocationNum === 20 && city && country) {
    // Alter Filter: Textbasierter Stadt/Land-Vergleich
    locationFilter = like(users.location, `${city}, %${country}`);
  } else if (interestLocationNum > 1) {
    // Neuer Radius-Filter (Kilometer)
    const lat1 = profile?.iLatitude;
    const lon1 = profile?.iLongitude;
    if (lat1 != null && lon1 != null) {
      const radiusKm = interestLocationNum;
      // Haversine-Formel als SQL-Bedingung mit EXISTS (vermeidet zusätzlichen JOIN)
      locationFilter = sql`EXISTS (
        SELECT 1 FROM ${swissLoc} sl 
        WHERE sl.id = ${users.locationid} 
        AND (6371 * acos(cos(radians(${lat1})) * cos(radians(sl."iLatitude")) * cos(radians(sl."iLongitude") - radians(${lon1})) + sin(radians(${lat1})) * sin(radians(sl."iLatitude")))) <= ${radiusKm}
      )`;
    }
  }

  const liked = await db
    .select({ to: likes.to })
    .from(likes)
    .where(eq(likes.from, userfromAuth.uuid));

  const superliked = await db
    .select()
    .from(superlikes)
    .where(eq(superlikes.from, userfromAuth.uuid));

  const disliked = await db
    .select()
    .from(dislikes)
    .where(eq(dislikes.from, userfromAuth.uuid));

  const likedUuids = liked
    .map((l) => l.to)
    .filter((id): id is string => id != null);

  const superlikedUuids = superliked
    .map((l) => l.to)
    .filter((id): id is string => id != null);

  const dislikedUuids = disliked
    .map((d) => d.to)
    .filter((id): id is string => id != null);

  //In settings werden die interessen mit 'mann', 'frau', 'divers', 'alle' gespeichert
  //In users werden die Geschlechter mit 'Weiblich', 'Männlich', 'Divers' gespeichert
  let myInterest = profile?.myInterest; //z.B mann
  let myGender = profile?.mygender;

  if (myGender === "Weiblich") myGender = "frau";
  else if (myGender === "Männlich") myGender = "mann";
  else if (myGender === "Divers") myGender = "divers";

  if (myInterest === "frau") myInterest = "Weiblich";
  else if (myInterest === "mann") myInterest = "Männlich";
  else if (myInterest === "divers") myInterest = "Divers";

  //console.log(myGender, myInterest);

  const allUsers = await db
    .select()
    .from(users)
    .innerJoin(settings, eq(settings.uuid, users.uuid)) //nimmt die settings mit
    .where(
      and(
        not(eq(users.uuid, userfromAuth.uuid)), //sich selber ausschliessen

        likedUuids.length > 0
          ? not(inArray(users.uuid, likedUuids)) // nur die holen, dessen user.uuid nicht im likedUuids vorkommt
          : undefined,

        superlikedUuids.length > 0
          ? not(inArray(users.uuid, superlikedUuids)) // nur die holen, dessen user.uuid nicht im superlikedUuids vorkommt
          : undefined,

        dislikedUuids.length > 0
          ? not(inArray(users.uuid, dislikedUuids)) // nur die holen, dessen user.uuid nicht im dislikedUuids vorkommt
          : undefined,

        !profile?.fakeUsersEnabled ? not(eq(users.roles, "fakeUser")) : undefined,

        and(
          or(
            myGender ? eq(settings.intresse, myGender) : undefined, // hole nur die user dessen interesse mein geschlecht ist oder alle
            eq(settings.intresse, "alle"),
          ),
          // Only add a DB filter for candidate gender when myInterest is set and not "alle"
          myInterest && myInterest !== "alle"
            ? eq(users.geschlecht, myInterest)
            : undefined,
        ),

        // Filter by interest location
        locationFilter,

        // Nicht deleted Users
        not(eq(users.deleted, true)),
      ),
    );
  //console.log('alle gefilterten userss:', allUsers);

  // Hier das Ranking noch machen sehr abhängig vom Boost

  // Alle aktiven Boosts für gefundene User auf einmal abrufen (vermeidet N+1)
  const userUuids = allUsers.map((u) => u.users.uuid);
  const activeBoosts = await db
    .select({ uuid: boosts.uuid })
    .from(boosts)
    .where(
      and(
        inArray(boosts.uuid, userUuids),
        gt(boosts.endsAt, new Date())
      ),
    );
  const boostedUuids = new Set(activeBoosts.map((b) => b.uuid));

  const rankedUsers = rankUsers(allUsers, profile, boostedUuids);

  return NextResponse.json(rankedUsers);
}
