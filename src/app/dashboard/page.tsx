import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDealsByUser } from "@/lib/deals";
import DealCard from "@/components/DealCard";
import Link from "next/link";

export const metadata = {
  title: "My Deals | KataDeals",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/api/auth/signin");
  }

  const deals = await getDealsByUser(session.user.email);

  return (
    <main className="min-h-screen bg-slate-950 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-2">
              Dashboard
            </p>
            <h1 className="text-3xl font-bold text-white">My Deals</h1>
            <p className="text-slate-500 mt-1 text-sm">
              {deals.length} deal{deals.length !== 1 ? "s" : ""} analyzed
            </p>
          </div>
          <Link
            href="/analyze"
            className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
          >
            + New Deal
          </Link>
        </div>

        {/* Empty State */}
        {deals.length === 0 && (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <span className="text-3xl">📊</span>
            </div>
            <h2 className="text-xl font-semibold text-slate-300 mb-2">
              No deals yet
            </h2>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
              Analyze your first property to get started. Your deals will be saved here automatically.
            </p>
            <Link
              href="/analyze"
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20"
            >
              Analyze a Deal →
            </Link>
          </div>
        )}

        {/* Deal Cards Grid */}
        {deals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deals.map((deal: any) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
