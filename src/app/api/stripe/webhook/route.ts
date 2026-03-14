import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
export async function POST(req: Request) {
const body = await req.text();
const sig = req.headers.get("stripe-signature");
if (!sig) {
return NextResponse.json({ error: "No signature" }, { status: 400 });
}
// Verify the request actually came from Stripe
let event: Stripe.Event;
try {
event = stripe.webhooks.constructEvent(
body, sig, process.env.STRIPE_WEBHOOK_SECRET!
);
} catch (err) {
console.error("Webhook error:"
, err);
return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
}
switch (event.type) {
// Payment succeeded — upgrade the user
case "checkout.session.completed": {
const s = event.data.object as Stripe.CheckoutSession;const email =
s.customer_details?.email ?? s.customer_email ?? null;
if (email) {
// Figure out which plan they bought
const items = await stripe.checkout.sessions.listLineItems(s.id);
const pid = items.data[0]?.price?.id ?? "";
const plan = pid === process.env.STRIPE_TEAM_PRICE_ID
? "team" : "pro";
await prisma.user.update({
where: { email },
data: { plan },
});
}
break;
}
// Subscription cancelled — downgrade back to free
case "customer.subscription.deleted": {
const sub = event.data.object as Stripe.Subscription;
const cust = await stripe.customers.retrieve(
sub.customer as string
);
if (!cust.deleted && cust.email) {
await prisma.user.update({
where: { email: cust.email },
data: { plan: "free" },
});
}
break;
}
default:
console.log("Unhandled Stripe event:"
, event.type);
}
return NextResponse.json({ received: true });
}
