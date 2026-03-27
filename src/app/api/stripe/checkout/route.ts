import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-02-25.clover",
  });
}
export async function POST(req: Request) {
  const stripe = getStripe();
const session = await getServerSession(authOptions);
if (!session?.user?.email) {
return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
const { priceId } = await req.json();
if (!priceId) {
return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
}
// Check if user already has a Stripe customer ID saved
const user = await prisma.user.findUnique({
where: { email: session.user.email },
select: { stripeCustomerId: true },
});
let customerId = user?.stripeCustomerId ?? null;
// Create a new Stripe customer if this is their first time
if (!customerId) {
const customer = await stripe.customers.create({email: session.user.email,
name: session.user.name ?? undefined,
});
customerId = customer.id;
// Save the customer ID so we reuse it next time
await prisma.user.update({
where: { email: session.user.email },
data: { stripeCustomerId: customerId },
});
}
// Create the checkout session
const checkoutSession = await stripe.checkout.sessions.create({
mode: "subscription"
,
customer: customerId,
line_items: [{ price: priceId, quantity: 1 }],
success_url: `${process.env.NEXTAUTH_URL}/dashboard?upgraded=true`,
cancel_url: `${process.env.NEXTAUTH_URL}/pricing?cancelled=true`,
allow_promotion_codes: true,
});
return NextResponse.json({ url: checkoutSession.url });
}
