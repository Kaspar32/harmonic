import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = "nodejs";

export async function GET(
  req: Request,
  context: { params: Promise<{ name: string }> } // Achtung: Promise!
) {
  const { name } = await context.params; // ✅ Hier wird das Promise aufgelöst
  console.log("Name:", name);

  const filePath = path.join(process.cwd(), 'uploads/images', `${name}.png`);

  if (!fs.existsSync(filePath)) {
    return new NextResponse('Not found', { status: 404 });
  }

  const file = fs.readFileSync(filePath);

  return new NextResponse(file, {
    headers: { 'Content-Type': 'image/png' },
  });
}