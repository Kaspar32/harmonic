import { stripe } from "@/lib/stripe";
import { getAuthenticatedUserId } from "@/lib/auth";

export async function POST(req: Request) {
  const userId = await getAuthenticatedUserId(req);

  if (!userId) {
    return Response.json({ error: "Nicht eingeloggt" }, { status: 401 });
  }

  const session =
    await stripe.checkout.sessions.create({
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "chf",

            product_data: {
              name: "Boost",
            },

            unit_amount: 500,
          },

          quantity: 1,
        },
      ],

      metadata: {
        userId,
        type: "boost", 
      },

      success_url:`${process.env.NEXT_PUBLIC_APP_URL}/home?success=true`,
      cancel_url:`${process.env.NEXT_PUBLIC_APP_URL}/home?canceled=true`,


    });

  return Response.json({
    url: session.url,
  });
}