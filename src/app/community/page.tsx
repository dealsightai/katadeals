import CommunityCalculator from "@/components/CommunityCalculator";
export default function Page() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Community Development Tool</h1>
        <p className="text-slate-500 mb-8">Plan a mixed community of houses, townhouses, and apartments. Calculate costs, revenue, profit, and timeline.</p>
        <CommunityCalculator />
      </div>
    </main>
  );
}