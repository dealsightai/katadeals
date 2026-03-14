"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
const PLANS = [
{
name: "Free"
,
price: 0,
priceId: null,
description: "Try KataDeals with no commitment"
analyses: "3 analyses / month"
,
features: [
"3 property analyses per month"
,
"Basic deal scoring (1-10)"
,
"Save up to 3 deals"
,
"Buy / Hold / Pass recommendation"
,
,
],
cta: "Get Started Free"
,
highlight: false,
},
{
name: "Pro"
,
price: 29,
priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
description: "For investors analyzing deals every day"
analyses: "Unlimited analyses"
,
features: [
"Unlimited property analyses"
,
"Advanced AI scoring and insights"
,
"Unlimited saved deals"
,
,"Cash flow, ARV, and cap rate estimates"
"Priority AI processing"
,
"Email support"
,
,
],
cta: "Start Pro — $29/mo"
highlight: true,
,
},
{
name: "Team"
,
price: 79,
priceId: process.env.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID,
description: "For investment teams and brokerages"
,
analyses: "Unlimited analyses"
,
features: [
"Everything in Pro"
,
"5 team member seats"
,
"Shared deal library"
,
"CSV and PDF export"
,
"Team analytics dashboard"
,
"Priority support"
,
],
cta: "Start Team — $79/mo"
highlight: false,
,
},
];
export default function PricingPage() {
const router = useRouter();
const [loading, setLoading] = useState<string | null>(null);const handleSelect = async (priceId: string | null | undefined, name: string) => {
// Free plan — just go to sign in
if (!priceId) {
router.push("/api/auth/signin");
return;
}
setLoading(name);
try {
const res = await fetch("/api/stripe/checkout"
, {
method: "POST"
,
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ priceId }),
});
const data = await res.json();
if (data.url) window.location.href = data.url;
} catch (err) {
console.error(err);
} finally {
setLoading(null);
}
};
return (
<main className="min-h-screen bg-slate-50">
{/* Header */}
<section className="max-w-4xl mx-auto px-6 pt-20 pb-10 text-center">
<h1 className="text-4xl font-bold text-slate-900 mb-3">
Simple, Transparent Pricing
</h1><p className="text-slate-500 text-lg max-w-xl mx-auto">
Start free. Upgrade when you need more. Cancel anytime.
</p>
</section>
{/* Plans Grid */}
<section className="max-w-5xl mx-auto px-6 pb-20">
<div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
{PLANS.map((plan) => (
<div key={plan.name} className={`
rounded-2xl border p-8 flex flex-col
${plan.highlight
? "bg-blue-600 border-blue-600 text-white shadow-2xl md:scale-105"
: "bg-white border-slate-200 text-slate-900"}
`}>
{/* Plan name */}
<div className="mb-6">
{plan.highlight && (
<span className="text-xs font-bold bg-white text-blue-600
px-3 py-1 rounded-full mb-3 inline-block">
MOST POPULAR
</span>
)}
<h2 className="text-2xl font-bold">{plan.name}</h2>
<p className={`text-sm mt-1 ${plan.highlight ? "text-blue-100" : "text-sla te-500"}`}>
{plan.description}
</p>
</div>{/* Price */}
<div className="mb-6">
<span className="text-4xl font-bold">${plan.price}</span>
<span className={`text-sm ml-1 ${plan.highlight ? "text-blue-100" : "text-
slate-400"}`}>
/month
</span>
<p className={`text-sm mt-1 font-medium
${plan.highlight ? "text-blue-100" : "text-blue-600"}`}>
{plan.analyses}
</p>
</div>
{/* Features */}
<ul className="space-y-3 mb-8 flex-1">
{plan.features.map((f) => (
<li key={f} className="flex items-start gap-2 text-sm">
<span className={plan.highlight ? "text-blue-200" : "text-green-500"}>
✓
</span>
{f}
</li>
))}
</ul>
{/* CTA Button */}
<button
onClick={() => handleSelect(plan.priceId, plan.name)}
disabled={loading === plan.name}
className={`
w-full py-3 rounded-xl font-semibold transition-alldisabled:opacity-60 disabled:cursor-not-allowed
${plan.highlight
? "bg-white text-blue-600 hover:bg-blue-50"
: "bg-blue-600 text-white hover:bg-blue-700"}
`}
>
{loading === plan.name ? "Loading..." : plan.cta}
</button>
</div>
))}
</div>
{/* Trust line */}
<p className="text-center text-slate-400 text-sm mt-12">
■ Secure checkout via Stripe &nbsp;·&nbsp;
Cancel anytime &nbsp;·&nbsp;
7-day money-back guarantee
</p>
</section>
</main>
);
}
