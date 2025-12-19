import { createRandomProfiles } from "@/lib/seed";

export async function POST (req:Request){

    const {count} = await req.json();

      if (!count) {
    return new Response("Gib eine Zahl bis 100 ein.", { status: 400 });
  }

        if (count > 100) {
    return new Response("Maximal 100 auf einmal.", { status: 400 });
  }

    await createRandomProfiles(count);
    return new Response(`${count} Accounts erfolgreich erstellt.`, {status:200})

} 