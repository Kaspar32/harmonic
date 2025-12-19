import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
 
export async function POST (req:Request){

    const {username, password, confirmPassword}= await req.json();

    //Kontrolle 

    if(!username || !password || !confirmPassword)
        return new Response("Fehler: Fehlende Eingaben", {status: 400});
    if(password !== confirmPassword)
        return new Response("Fehler: Passwörter stimmen nicht überein", {status: 400});
    if(password.length < 8)
        return new Response("Fehler: Passwort muss mindestens 8 Zeichen enthalten.", {status: 400});


    const existing = await db.select().from(users).where(eq(users.name, username));

    if(existing.length > 0) 
        return new Response ("Fehler: Benutzername bereits vergeben.", {status:400})

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.insert(users).values({name: username , password: hashedPassword, roles: "user"})

    return new Response("Account erfolgreich erstellt.", {status:200})

}