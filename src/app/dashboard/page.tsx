import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDealsByUser } from "@/lib/deals";
import DealCard from "@/components/DealCard";
import Link from "next/link";
export const metadata = {
title: "My Deals | KataDeals"
,
};
export default async function DashboardPage() {
const session = await getServerSession(authOptions);
// Redirect to sign in if not logged in
if (!session?.user?.email) {
redirect("/api/auth/signin");
}
const deals = await getDealsByUser(session.user.email);
return (
<main className="min-h-screen bg-slate-50">
<div className="max-w-6xl mx-auto px-4 py-12">
{/* Header */}
<div className="flex items-center justify-between mb-8">
<div>
<h1 className="text-3xl font-bold text-slate-900">My Deals</h1>
<p className="text-slate-500 mt-1">{deals.length} deal{deals.length !== 1 ? "s" : ""} analyzed
</p>
</div>
<Link href="/analyze"
className="bg-blue-600 hover:bg-blue-700 text-white font-semibold
px-5 py-2.5 rounded-xl text-sm transition-colors">
+ Analyze New Deal
</Link>
</div>
{/* Empty state */}
{deals.length === 0 && (
<div className="text-center py-24">
<div className="text-5xl mb-4">■</div>
<h2 className="text-xl font-semibold text-slate-700 mb-2">
No deals yet
</h2>
<p className="text-slate-500 mb-6">
Analyze your first property to get started.
</p>
<Link href="/analyze"
className="bg-blue-600 text-white font-medium px-6 py-3 rounded-xl">
Analyze a Deal →
</Link>
</div>
)}
{/* Deal cards grid */}
{deals.length > 0 && (
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
{deals.map((deal) => (
<DealCard key={deal.id} deal={deal} />
))}
</div>
)}
</div>
</main>
);
}
