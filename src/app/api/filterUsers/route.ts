import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, likes, superlikes, dislikes, settings, swissLoc } from "@/db/schema";
import { eq, not, inArray, and, or, like, sql } from "drizzle-orm";

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

  const [interest] = await db
    .select({ myInterest: settings.intresse })
    .from(settings)
    .where(eq(settings.uuid, userfromAuth.uuid));

  const [result] = await db
    .select({ mygender: users.geschlecht })
    .from(users)
    .where(eq(users.uuid, userfromAuth.uuid));

  const [interestLocationData] = await db
    .select({ radius: settings.radius })
    .from(settings)
    .where(eq(settings.uuid, userfromAuth.uuid));


  const [locationResult] = await db.select({ location: users.location }).from(users).where(eq(users.uuid, userfromAuth.uuid));
  const city = locationResult?.location?.split(",")[0].trim();
  const country = locationResult?.location?.split(",")[2].trim();

  let locationFilter = undefined;
  const interestLocationNum = (interestLocationData?.radius)||0;

 
  if (interestLocationNum === 20 && city && country) {
    // Alter Filter: Textbasierter Stadt/Land-Vergleich
    locationFilter = like(users.location, `${city}, %${country}`);
  }
  
  else if (interestLocationNum > 1) {
    // Neuer Radius-Filter (Kilometer)
    // Aktuelle Koordinaten des angemeldeten Users aus der swissLoc Tabelle holen
    const currentUserLocation = await db
      .select({
        lat: swissLoc.iLatitude,
        lon: swissLoc.iLongitude,
      })
      .from(users)
      .innerJoin(swissLoc, eq(users.locationid, swissLoc.id))
      .where(eq(users.uuid, userfromAuth.uuid))
      .then(res => res[0]);
    
    if (currentUserLocation?.lat != null && currentUserLocation?.lon != null) {
      const radiusKm = interestLocationNum;
      const lat1 = currentUserLocation.lat;
      const lon1 = currentUserLocation.lon;
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

  const areFakeUsersEnabled = await db //true oder false
    .select({ fakeUsersEnabled: users.fakeUsersEnabled })
    .from(users)
    .where(eq(users.uuid, userfromAuth.uuid))
    .then((res) => res[0]?.fakeUsersEnabled ?? false);

  //In settings werden die interessen mit 'mann', 'frau', 'divers', 'alle' gespeichert
  //In users werden die Geschlechter mit 'Weiblich', 'Männlich', 'Divers' gespeichert
  let myInterest = interest?.myInterest; //z.B mann
  let myGender = result?.mygender;

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

        !areFakeUsersEnabled ? not(eq(users.roles, "fakeUser")) : undefined,

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

  // Ranking der Nutzer
  const rankedUsers = allUsers.map((user) => {
    let score = 0;

    // +1 Punkt *0.5, wenn sie gemeinsame Interessen haben

    const userInterests = user.users.intressen || [];

    const currentUserInterests = interest?.myInterest ? [interest.myInterest] : [];

    const sharedInterests = userInterests.filter((interest) =>
      currentUserInterests.includes(interest),
    );

    if(sharedInterests.length > 0) {
      score += sharedInterests.length *0.5 ; // Je mehr gemeinsame Interessen, desto höher der Score
    }




  
  
  
  
  
  });





  return NextResponse.json(allUsers);
}
