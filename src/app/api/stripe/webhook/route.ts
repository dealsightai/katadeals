import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const stripe = getStripe();
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const email = session.customer_details?.email || session.customer_email || null;
    if (email) {
      const items = await stripe.checkout.sessions.listLineItems(session.id);
      const pid = items.data[0]?.price?.id || "";
      const plan = pid === process.env.STRIPE_TEAM_PRICE_ID ? "team" : "pro";
      await prisma.user.update({ where: { email }, data: { plan } });
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as any;
    const cust = await stripe.customers.retrieve(sub.customer as string) as any;
    if (cust.email) {
      await prisma.user.update({ where: { email: cust.email }, data: { plan: "free" } });
    }
  }

  return NextResponse.json({ received: true });
}