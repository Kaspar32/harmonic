// app/images/[...name]/route.ts
import { join } from 'path';
import { promises as fs } from 'fs';

export async function GET(request: Request, { params }: { params: Promise<{ name: string[] }> }) {

  const url = new URL(request.url);
  const blurFlag = url.searchParams.get("blur");


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

  try {

    // Warte auf das gesamte params-Objekt
    const awaitedParams = await Promise.resolve(params || {});
    const fileSegments = awaitedParams.name || [];

    
    const filePath = join(
      process.cwd(),
      'uploads',
      'images',
      ...fileSegments
    );


    const isBlurred = filePath.endsWith("_blurred.png");

    if (isBlurred && !blurFlag) {
      return new Response(null, { status: 404 });
    }

    // Dateityp-Erkennung
    const ext = (filePath.split('.').pop() ?? '').toLowerCase();
    const contentType = {
      png: 'image/png',
      gif: 'image/gif',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      webp: 'image/webp',
      svg: 'image/svg+xml'
    }[ext] || 'application/octet-stream';


    let fileBuffer = await fs.readFile(filePath);
    
    // Convert Buffer to Uint8Array for Response compatibility
    return new Response(new Uint8Array(fileBuffer), {
      status: 200,
      headers: { 
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable' // 1 Jahr Caching
      }
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return new Response(
      JSON.stringify({ error: 'File not found' }), 
      { 
        status: 404, 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store' 
        } 
      }
    );
  }
}