import Stripe from "stripe";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

import { stripe } from "@/lib/stripe";

import { db } from "@/db";
import { Abos, boosts } from "@/db/schema";

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

    //Welches Produkt wurde gewählt

    const productType = session.metadata?.type || "abo";
    
    //Boost
    if (productType === "boost") {

      const boostDurationMs = 60 * 60 * 1000;

      const existingBoost = await db.select().from(boosts).where(eq(boosts.uuid, userId)).limit(1);

      if (existingBoost.length > 0) {
        await db.update(boosts).set({
          startsAt: new Date(),
          endsAt: new Date(Date.now() + boostDurationMs),
          multiplier: 150,
        }).where(eq(boosts.uuid, userId));
      } else {
        await db.insert(boosts).values({
          uuid: userId,
          startsAt: new Date(),
          endsAt: new Date(Date.now() + boostDurationMs),
          multiplier: 150,
        });
      }

      console.log("Boost aktiviert");
    }

    else{

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
  }}


  return new Response("OK", {
    status: 200,
  });
}
