import { NextResponse } from "next/server";
import { db } from "@/db";
import { likes } from "@/db/schema";
import {eq, and} from 'drizzle-orm'

export async function GET (){
 try {
    const Likes = await db.select().from(likes);
    return NextResponse.json(Likes)
  } catch (error) { 
    console.error("Error fetching likes:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }

}


export async function POST(req: Request) {
    try {
      const body = await req.json();
      const { from, to } = body;

      console.log(to);
  
  
      if (!body) {
        return new Response(JSON.stringify({ error: "From and To is required" }), {
          status: 400,
        });
      }

      const existingLike = await db.select().from(likes).where(and(eq(likes.from, from), eq(likes.to, to)));

      if(existingLike.length>0)
      {
        return new Response(JSON.stringify({ message: "Like already exists" }), {
            status: 409, // Conflict
          });

    }
      
      
      await db.insert(likes).values({
        from: from,
        to: to
        
      });
  
      return new Response(JSON.stringify({ message: "Like added", body }), {
        status: 200,
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Server error" }), {
        status: 500,
      });

    }


   
  }