import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";

export async function GET() {
  const allUsers = await db.select().from(users).orderBy(users.id);
  return NextResponse.json(allUsers);
}




export async function POST(req: Request) {
    try {
      const body = await req.json();
      const { name, alter, geschlecht, grösse, ausbildung, intressen, ichsuche, genres} = body;

      console.log(ichsuche);
  
  
      if (!name) {
        return new Response(JSON.stringify({ error: "Name is required" }), {
          status: 400,
        });
      }

      await db.insert(users).values({
        name: name.trim(),
        alter: alter,
        geschlecht: geschlecht,
        grösse: grösse,
        ausbildung: ausbildung,
        intressen: intressen,
        ichsuche: ichsuche, 
        genres: genres,
      });
  
      // Do something with `name`, like save to database...
  
      return new Response(JSON.stringify({ message: "User added", name }), {
        status: 200,
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Server error" }), {
        status: 500,
      });

    }


   
  }