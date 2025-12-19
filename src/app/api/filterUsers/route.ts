import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, likes, dislikes, settings } from "@/db/schema";
import { eq, not, inArray, and, or } from "drizzle-orm";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = cookies();
  const userId = (await cookieStore).get("userId")?.value;

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const [interest] = await db
    .select({ myInterest: settings.intresse })
    .from(settings)
    .where(eq(settings.uuid, userId));

  const [result] = await db
    .select({ mygender: users.geschlecht })
    .from(users)
    .where(eq(users.uuid, userId));

  const liked = await db
    .select({ to: likes.to })
    .from(likes)
    .where(eq(likes.from, userId));

  const disliked = await db
    .select()
    .from(dislikes)
    .where(eq(dislikes.from, userId));

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
    .where(eq(users.uuid, userId))
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
        not(eq(users.uuid, userId)), //sich selber ausschliessen

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
        )
      )
    );
//console.log('alle gefilterten userss:', allUsers);
  return NextResponse.json(allUsers);
}
