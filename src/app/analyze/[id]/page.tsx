import { notFound } from "next/navigation";
import { getDealById } from "@/lib/deals";
import DealReport from "@/components/DealReport";
import Link from "next/link";
export default async function DealResultPage({
params,
}: {
}) {
params: { id: string };
// Fetch the deal from the database
const deal = await getDealById(params.id);
// Show 404 if deal not found
if (!deal) {
notFound();
}
return (
<main className="min-h-screen bg-slate-50">
<div className="max-w-3xl mx-auto px-4 py-12">
{/* Back link */}
<Link href="/analyze"
className="inline-flex items-center gap-1 text-slate-500
hover:text-blue-600 text-sm mb-8 transition-colors">
← Analyze Another Deal
</Link>
{/* The full AI report */}
<DealReport deal={deal} />
{/* Save to dashboard button */}
<div className="mt-8 text-center">
<Link href="/dashboard"
className="inline-block border border-slate-300 hover:border-blue-400
text-slate-600 hover:text-blue-600 px-6 py-3 rounded-xl
text-sm font-medium transition-all">
View All Saved Deals →
</Link>
</div>
</div>
</main>
);
}
