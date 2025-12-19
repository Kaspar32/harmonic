//habe diese file im lib ordner gemacht 

import cron from 'node-cron';
import { lt } from 'drizzle-orm';
import { db } from '@/db';
import { dislikes } from '@/db/schema';
import { subMonths } from 'date-fns';

async function deleteOldEntries() {
  const oneMonthAgo = subMonths(new Date(), 1);

  await db.delete(dislikes).where(
    lt(dislikes.dislikedAt, oneMonthAgo)
  );

  console.log('Alte Einträge gelöscht');
}

cron.schedule('0 3 * * *', () => {
  deleteOldEntries().catch(err => console.error('löschen fehlgeschlagen:', err));
});