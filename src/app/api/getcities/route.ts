import { swissLoc } from "@/db/schema";
import { db } from "@/lib/test";
import { NextResponse } from "next/server";

export async function GET(req: Request) {


  try {
    const result = await db
      .select({
        id: swissLoc.id,
        zipCode: swissLoc.zipCode,
        cityName: swissLoc.cityName,
        cantonNameLong: swissLoc.cantonNameLong,
        iLatitude: swissLoc.iLatitude,
        iLongitude: swissLoc.iLongitude,

      })
      .from(swissLoc)
      .orderBy(swissLoc.zipCode);


    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching Cities:", error);
    return NextResponse.json({ error: "Failed to fetch cities" }, { status: 500 });
  }
}
