
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, likes, dislikes, settings } from "@/db/schema";
import { eq, not, inArray, and, or } from "drizzle-orm";

export async function GET(request:NextRequest) {

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

  const liked = await db
    .select({ to: likes.to })
    .from(likes)
    .where(eq(likes.from, userfromAuth.uuid));

  const disliked = await db
    .select()
    .from(dislikes)
    .where(eq(dislikes.from, userfromAuth.uuid));

  const likedUuids = liked
    .map((l) => l.to)
    .filter((id): id is string => id != null);

   //console.log('likedUuids:', likedUuids);

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

        dislikedUuids.length > 0
          ? not(inArray(users.uuid, dislikedUuids)) // nur die holen, dessen user.uuid nicht im dislikedUuids vorkommt
          : undefined,

        !areFakeUsersEnabled ? not(eq(users.roles, "fakeUser")) : undefined,

        and(
          or(
            myGender ? eq(settings.intresse, myGender) : undefined, // hole nur die user dessen interesse mein geschlecht ist oder alle
            eq(settings.intresse, "alle")
          ),
          // Only add a DB filter for candidate gender when myInterest is set and not "alle"
          myInterest && myInterest !== "alle" ? eq(users.geschlecht, myInterest) : undefined
        ), 
      )
    );
//console.log('alle gefilterten userss:', allUsers);

  return NextResponse.json(allUsers);
}
