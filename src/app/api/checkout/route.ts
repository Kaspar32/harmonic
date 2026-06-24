import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const { userId } = await req.json();

  const session =
    await stripe.checkout.sessions.create({
      mode: "payment",

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

      metadata: {
        userId,
      },

      success_url:
        `${process.env.NEXT_PUBLIC_APP_URL}/likes?success=true`,

      cancel_url:
        `${process.env.NEXT_PUBLIC_APP_URL}/likes?canceled=true`,
    });

  return Response.json({
    url: session.url,
  });
}