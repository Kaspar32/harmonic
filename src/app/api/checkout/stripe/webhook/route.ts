import Stripe from "stripe";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

import { stripe } from "@/lib/stripe";

import { db } from "@/db";
import { Abos } from "@/db/schema";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();

  const headersList = await headers();

  const signature = headersList.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook Fehler:", err);

    return new Response("Webhook Error", {
      status: 400,
    });
  }

  // Zahlung erfolgreich
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.userId;

    if (!userId) {
      return new Response("No userId", {
        status: 400,
      });
    }

    // User updaten
    const existingAbo = await db.select().from(Abos).where(eq(Abos.user_uuid, userId)).limit(1);

    if (existingAbo.length > 0) {
      await db
        .update(Abos)
        .set({
          abo: true,
          start_date: new Date(),
          end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        })
        .where(eq(Abos.user_uuid, userId));
    } else {

      console.log("Neues Abo anlegen::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::");
      await db.insert(Abos).values({
        user_uuid: userId,
        abo: true,
        start_date: new Date(),
        end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      });
    }

    console.log("Premium aktiviert");
  }

  return new Response("OK", {
    status: 200,
  });
}
