import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { userId } = await req.json();

  const session = await stripe.checkout.sessions.create({
    mode: "payment", // wichtig: KEIN subscription!

    line_items: [
      {
        price_data: {
          currency: "chf",
          product_data: {
            name: "30 Tage Premium",
          },
          unit_amount: 990,
        },
        quantity: 1,
      },
    ],

    automatic_payment_methods: {
      enabled: true,
    },

    metadata: {
      userId,
    },

    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
  });

  return Response.json({ url: session.url });