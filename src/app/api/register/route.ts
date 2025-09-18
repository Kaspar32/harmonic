import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
 
export async function POST (req:Request){

    const {username, password, confirmPassword}= await req.json();

    //Kontrolle

    if(!username || !password || !confirmPassword)
        return new Response("Missing inputs", {status: 400});
    if(password !== confirmPassword)
        return new Response("Passwords do not match", {status: 400});
    if(password.length < 8)
        return new Response("Password must contain at least 8 chars.", {status: 400});


    const existing = await db.select().from(users).where(eq(users.name, username));

    if(existing.length > 0) 
        return new Response ("Username already exists.", {status:400})

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.insert(users).values({name: username , password: hashedPassword })

    return new Response("Account created successfully.", {status:200})

}