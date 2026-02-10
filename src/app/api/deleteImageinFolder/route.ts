
import path from "path";
import fs from "fs/promises";
import {  NextResponse } from "next/server";

export async function POST(request: Request) {
  
  try {
    const { id } = await request.json();
    console.log("ID zum Löschen:", id);

    const directory = path.join(process.cwd(), "uploads/images");
      const files = await fs.readdir(directory);  
      for (const file of files) {
        if (file.startsWith(`${id}`) ) {
            //console.log("Lösche Datei:", file);
          await fs.unlink(path.join(directory, file));
        } 
      }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete error:", err);

    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
    // Löschen der Bilder im Ordner

    





}
