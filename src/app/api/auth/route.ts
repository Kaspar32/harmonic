 
import { cookies } from 'next/headers';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
 
export async function GET() {
 
  const cookieStore = cookies();
 
  const userId = (await cookieStore).get('userId')?.value;
 
  if (!userId) return new Response('Not logged in');
 
  const userData = await db.select().from(users).where(eq(users.uuid, userId)).limit(1);
 
 
  if (userData.length === 0) return new Response('User not found', { status: 404 });
 
  return new Response(JSON.stringify(userData[0]), {
    headers: { 'Content-Type': 'application/json' }
  });
}